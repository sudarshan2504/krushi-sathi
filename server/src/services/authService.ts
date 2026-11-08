import jwt from 'jsonwebtoken';
import { config } from '../config';
import prisma from '../utils/prisma';
import admin from '../utils/firebaseAdmin';

interface OtpChallenge {
  phone: string;
  otp: string;
  createdAt: number;
  attempts: number;
}

// In-memory OTP challenge store with 5-minute expiry
const otpStore = new Map<string, OtpChallenge>();

// Clean up expired challenges periodically
setInterval(() => {
  const now = Date.now();
  for (const [phone, challenge] of otpStore.entries()) {
    if (now - challenge.createdAt > 5 * 60 * 1000) {
      otpStore.delete(phone);
    }
  }
}, 60 * 1000);

export function isValidIndianPhone(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, '');
  // 10 digits starting with 6, 7, 8, or 9
  return /^[6-9]\d{9}$/.test(cleaned);
}

export function cleanPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 12 && cleaned.startsWith('91')) {
    return cleaned.slice(2);
  }
  return cleaned;
}

/**
 * Real Firebase Phone Authentication Login
 * - Accepts idToken
 * - Verifies it using admin.auth().verifyIdToken()
 * - Reads phone_number exclusively from the verified token
 * - Normalizes with cleanPhone()
 * - Finds or creates Prisma user
 * - Issues existing JWT and returns { user, isNewUser, token }
 */
export async function verifyFirebaseLogin(idToken: string) {
  if (!idToken || typeof idToken !== 'string') {
    throw new Error('Firebase ID token is required');
  }

  // Verifies it with admin.auth().verifyIdToken
  let decodedToken;
  try {
    decodedToken = await admin.auth().verifyIdToken(idToken);
  } catch (err: any) {
    throw new Error(err.message || 'Invalid or expired Firebase authentication token');
  }

  // Read phone_number from the VERIFIED token only (never from request body)
  const verifiedPhone = decodedToken.phone_number;
  if (!verifiedPhone) {
    throw new Error('Firebase token does not contain a verified phone number');
  }

  // Normalize phone number with existing cleanPhone()
  const phone = cleanPhone(verifiedPhone);
  if (!isValidIndianPhone(phone)) {
    throw new Error('Verified phone number must be a valid 10-digit Indian mobile number');
  }

  // Find or create the Prisma user
  let user = await prisma.user.findUnique({
    where: { phone },
  });

  const isNewUser = !user;

  if (!user) {
    user = await prisma.user.create({
      data: {
        phone,
        name: `Farmer ${phone.slice(-4)}`,
        language: 'en',
        state: 'Karnataka',
        district: 'Mandya',
        farmSize: 2.5,
        farmUnit: 'Acres',
      },
    });
  }

  // Issue signed JWT token valid for 7 days
  const token = jwt.sign(
    {
      userId: user.id,
      phone: user.phone,
      name: user.name,
      language: user.language,
    },
    config.jwtSecret,
    { expiresIn: '7d' }
  );

  return {
    token,
    user,
    isNewUser,
  };
}

export async function createOtpChallenge(rawPhone: string) {
  if (!(config.nodeEnv === 'development' && config.demoOtpEnabled)) {
    throw new Error('Demo OTP is disabled. Please use real Firebase Phone Authentication.');
  }

  const phone = cleanPhone(rawPhone);
  if (!isValidIndianPhone(phone)) {
    throw new Error('Please enter a valid 10-digit Indian mobile number');
  }

  // Development/Demo mode fixed OTP
  const demoOtp = config.demoOtp || '123456';

  otpStore.set(phone, {
    phone,
    otp: demoOtp,
    createdAt: Date.now(),
    attempts: 0,
  });

  // Check if user already exists in SQLite
  const existingUser = await prisma.user.findUnique({
    where: { phone },
  });

  return {
    phone,
    isExistingUser: !!existingUser,
    userName: existingUser?.name || null,
    demoOtpNote: 'Demo OTP: 123456 — Local testing only',
    expiresInSeconds: 300,
  };
}

export async function verifyOtp(rawPhone: string, enteredOtp: string) {
  if (!(config.nodeEnv === 'development' && config.demoOtpEnabled)) {
    throw new Error('Demo OTP is disabled. Please use real Firebase Phone Authentication.');
  }

  const phone = cleanPhone(rawPhone);
  if (!isValidIndianPhone(phone)) {
    throw new Error('Please enter a valid 10-digit Indian mobile number');
  }

  const challenge = otpStore.get(phone);
  const fixedDemoOtp = config.demoOtp || '123456';

  // In demo development mode, accept either stored challenge or fixed demo OTP
  if (!challenge && enteredOtp !== fixedDemoOtp) {
    throw new Error('OTP expired or not requested. Please request a new OTP.');
  }

  if (challenge) {
    if (challenge.attempts >= 5) {
      otpStore.delete(phone);
      throw new Error('Too many failed attempts. Please request a fresh OTP.');
    }

    if (challenge.otp !== enteredOtp && enteredOtp !== fixedDemoOtp) {
      challenge.attempts += 1;
      throw new Error(`Invalid OTP entered. Please try again. (Hint: Test OTP is ${fixedDemoOtp})`);
    }

    // OTP is valid!
    otpStore.delete(phone);
  } else if (enteredOtp !== fixedDemoOtp) {
    throw new Error(`Invalid OTP. Use Demo OTP: ${fixedDemoOtp}`);
  }

  // Find or create local user
  let user = await prisma.user.findUnique({
    where: { phone },
  });

  const isNewUser = !user;

  if (!user) {
    // Create preliminary user profile
    user = await prisma.user.create({
      data: {
        phone,
        name: `Farmer ${phone.slice(-4)}`,
        language: 'en',
        state: 'Karnataka',
        district: 'Mandya',
        farmSize: 2.5,
        farmUnit: 'Acres',
      },
    });
  }

  // Issue signed JWT token valid for 7 days
  const token = jwt.sign(
    {
      userId: user.id,
      phone: user.phone,
      name: user.name,
      language: user.language,
    },
    config.jwtSecret,
    { expiresIn: '7d' }
  );

  return {
    token,
    user,
    isNewUser,
  };
}

export async function registerFarmer(data: {
  name: string;
  phone: string;
  language: string;
  state: string;
  district: string;
  village?: string;
  taluk?: string;
  farmSize?: number;
  farmUnit?: string;
  latitude?: number | null;
  longitude?: number | null;
  locationAccuracy?: number | null;
  locationSource?: string;
}) {
  const phone = cleanPhone(data.phone);
  if (!isValidIndianPhone(phone)) {
    throw new Error('Please enter a valid 10-digit Indian mobile number');
  }

  if (!data.name || data.name.trim().length < 2) {
    throw new Error('Please enter farmer name (minimum 2 letters)');
  }

  // Validate and sanitize location data
  let validLat: number | null = null;
  let validLon: number | null = null;
  if (typeof data.latitude === 'number' && !isNaN(data.latitude) && data.latitude >= -90 && data.latitude <= 90) {
    validLat = data.latitude;
  }
  if (typeof data.longitude === 'number' && !isNaN(data.longitude) && data.longitude >= -180 && data.longitude <= 180) {
    validLon = data.longitude;
  }

  const validAccuracy = typeof data.locationAccuracy === 'number' && !isNaN(data.locationAccuracy) && data.locationAccuracy >= 0
    ? Math.min(data.locationAccuracy, 100000)
    : null;

  const validSource = ['gps', 'ip', 'manual'].includes(String(data.locationSource || '').toLowerCase())
    ? String(data.locationSource).toLowerCase()
    : (validLat !== null ? 'gps' : 'manual');

  const cleanTaluk = data.taluk ? String(data.taluk).trim().slice(0, 100) : null;
  const cleanVillage = data.village !== undefined ? String(data.village).trim().slice(0, 100) : null;

  const existing = await prisma.user.findUnique({
    where: { phone },
  });

  let user;
  if (existing) {
    user = await prisma.user.update({
      where: { phone },
      data: {
        name: data.name.trim().slice(0, 100),
        language: data.language || existing.language,
        state: data.state || existing.state,
        district: data.district || existing.district,
        village: cleanVillage !== null ? cleanVillage : existing.village,
        taluk: cleanTaluk !== null ? cleanTaluk : existing.taluk,
        latitude: validLat !== null ? validLat : existing.latitude,
        longitude: validLon !== null ? validLon : existing.longitude,
        locationAccuracy: validAccuracy !== null ? validAccuracy : existing.locationAccuracy,
        locationSource: validSource || existing.locationSource,
        farmSize: data.farmSize ?? existing.farmSize,
        farmUnit: data.farmUnit || existing.farmUnit,
      },
    });
  } else {
    user = await prisma.user.create({
      data: {
        phone,
        name: data.name.trim().slice(0, 100),
        language: data.language || 'en',
        state: data.state || 'Karnataka',
        district: data.district || 'Mandya',
        village: cleanVillage || '',
        taluk: cleanTaluk || '',
        latitude: validLat,
        longitude: validLon,
        locationAccuracy: validAccuracy,
        locationSource: validSource,
        farmSize: data.farmSize || 2.5,
        farmUnit: data.farmUnit || 'Acres',
      },
    });
  }

  const token = jwt.sign(
    {
      userId: user.id,
      phone: user.phone,
      name: user.name,
      language: user.language,
    },
    config.jwtSecret,
    { expiresIn: '7d' }
  );

  return {
    token,
    user,
  };
}

/**
 * Guest / One-Tap Demo Login or Direct Phone Login (No OTP required)
 */
export async function guestLogin(preferredPhone?: string, preferredName?: string) {
  const phone = preferredPhone ? cleanPhone(preferredPhone) : '9876543210';
  const name = preferredName || 'Ramesh Kumar (Farmer)';

  // Find or create local user
  let user = await prisma.user.findFirst({
    where: { phone },
  });

  const isNewUser = !user;

  if (!user) {
    user = await prisma.user.create({
      data: {
        phone,
        name,
        language: 'en',
        state: 'Karnataka',
        district: 'Mandya',
        farmSize: 2.5,
        farmUnit: 'Acres',
      },
    });
  }

  const token = jwt.sign(
    {
      userId: user.id,
      phone: user.phone,
      name: user.name,
      language: user.language,
    },
    config.jwtSecret,
    { expiresIn: '7d' }
  );

  return {
    token,
    user,
    isNewUser,
  };
}

/**
 * Instant Demo Login as Ramesh Kumar (Mandya, Karnataka)
 * Explicitly provisions 2.5 Acres, Maddur Taluk, Koppa Hobli
 */
export async function demoLogin() {
  const phone = '9876543210';
  const name = 'Ramesh Kumar';

  let user = await prisma.user.findFirst({
    where: { phone },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        phone,
        name,
        language: 'en',
        state: 'Karnataka',
        district: 'Mandya',
        taluk: 'Maddur',
        hobli: 'Koppa',
        village: 'Koppa',
        farmSize: 2.5,
        farmUnit: 'Acres',
      },
    });
  } else if (!user.taluk || !user.hobli) {
    user = await prisma.user.update({
      where: { id: user.id },
      data: {
        taluk: user.taluk || 'Maddur',
        hobli: user.hobli || 'Koppa',
        village: user.village || 'Koppa',
      },
    });
  }

  const token = jwt.sign(
    {
      userId: user.id,
      phone: user.phone,
      name: user.name,
      language: user.language,
    },
    config.jwtSecret,
    { expiresIn: '7d' }
  );

  return {
    token,
    user,
    isNewUser: false,
  };
}
