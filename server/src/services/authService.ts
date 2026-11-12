import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import prisma from '../utils/prisma';
import admin, { verifyFirebaseIdToken } from '../utils/firebaseAdmin';

interface OtpChallenge {
  phone: string;
  otp: string;
  createdAt: number;
  attempts: number;
  purpose: 'login' | 'register';
}

interface VerifiedRegistration {
  jti: string;
  expiresAt: number;
}

// In-memory OTP challenge store with 5-minute expiry
const otpStore = new Map<string, OtpChallenge>();
// In-memory store for phones that completed register-purpose OTP verification (10-minute TTL)
const verifiedRegistrationStore = new Map<string, VerifiedRegistration>();
// Track consumed registration verification JTIs (10-minute TTL)
const consumedRegistrationJtis = new Map<string, number>();

export function clearAuthStoresForTest(): void {
  otpStore.clear();
  verifiedRegistrationStore.clear();
  consumedRegistrationJtis.clear();
}

export function isDemoOtpActive(): boolean {
  if (process.env.NODE_ENV === 'production') return false;
  if (process.env.DEMO_OTP_ENABLED !== undefined) {
    return process.env.DEMO_OTP_ENABLED === 'true';
  }
  return config.demoOtpEnabled;
}

export function isDemoModeActive(): boolean {
  return process.env.DEMO_MODE === 'true';
}

// Clean up expired challenges periodically (unref so test processes can exit cleanly)
const otpCleanupTimer = setInterval(() => {
  const now = Date.now();
  for (const [phone, challenge] of otpStore.entries()) {
    if (now - challenge.createdAt > 5 * 60 * 1000) {
      otpStore.delete(phone);
    }
  }
  for (const [phone, reg] of verifiedRegistrationStore.entries()) {
    if (now > reg.expiresAt) {
      verifiedRegistrationStore.delete(phone);
    }
  }
  for (const [jti, exp] of consumedRegistrationJtis.entries()) {
    if (now > exp) {
      consumedRegistrationJtis.delete(jti);
    }
  }
}, 60 * 1000);
if (typeof otpCleanupTimer.unref === 'function') {
  otpCleanupTimer.unref();
}

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

export async function createOtpChallenge(rawPhone: string, purpose: 'login' | 'register' = 'login') {
  if (!isDemoOtpActive()) {
    const err: any = new Error('Demo OTP is disabled. Please use real Firebase Phone Authentication.');
    err.status = 404;
    throw err;
  }

  const phone = cleanPhone(rawPhone);
  if (!isValidIndianPhone(phone)) {
    throw new Error('Please enter a valid 10-digit Indian mobile number');
  }

  // Check if user already exists in SQLite
  const existingUser = await prisma.user.findUnique({
    where: { phone },
  });

  if (purpose === 'register' && existingUser) {
    const err: any = new Error('An account with this mobile number already exists. Please login instead.');
    err.status = 409;
    throw err;
  }

  // Development/Demo mode fixed OTP
  const demoOtp = config.demoOtp || '123456';

  otpStore.set(phone, {
    phone,
    otp: demoOtp,
    createdAt: Date.now(),
    attempts: 0,
    purpose,
  });

  return {
    phone,
    isExistingUser: !!existingUser,
    userName: existingUser?.name || null,
    demoOtpNote: 'Demo OTP: 123456 — Local testing only',
    expiresInSeconds: 300,
  };
}

export async function verifyOtp(
  rawPhone: string,
  enteredOtp: string,
  purpose: 'login' | 'register' = 'login'
) {
  if (!isDemoOtpActive()) {
    const err: any = new Error('Demo OTP is disabled. Please use real Firebase Phone Authentication.');
    err.status = 404;
    throw err;
  }

  const phone = cleanPhone(rawPhone);
  if (!isValidIndianPhone(phone)) {
    throw new Error('Please enter a valid 10-digit Indian mobile number');
  }

  const challenge = otpStore.get(phone);
  const fixedDemoOtp = config.demoOtp || '123456';

  if (challenge) {
    if (Date.now() - challenge.createdAt > 5 * 60 * 1000) {
      otpStore.delete(phone);
      throw new Error('OTP expired. Please request a new OTP.');
    }

    if (challenge.attempts >= 5) {
      otpStore.delete(phone);
      throw new Error('Too many failed attempts. Please request a fresh OTP.');
    }

    if (enteredOtp !== challenge.otp) {
      challenge.attempts += 1;
      throw new Error(`Invalid OTP entered. Please try again. (Hint: Test OTP is ${fixedDemoOtp})`);
    }

    // OTP is valid!
    otpStore.delete(phone);
  } else if (purpose === 'register' || enteredOtp !== fixedDemoOtp) {
    throw new Error(
      purpose === 'register'
        ? 'OTP expired or not requested. Please request a new OTP before verifying.'
        : `Invalid OTP. Use Demo OTP: ${fixedDemoOtp}`
    );
  }

  // Check local user
  let user = await prisma.user.findUnique({
    where: { phone },
  });

  if (purpose === 'register') {
    if (user) {
      const err: any = new Error('An account with this mobile number already exists. Please login instead.');
      err.status = 409;
      throw err;
    }

    const jti = crypto.randomUUID();
    const verificationToken = jwt.sign(
      { phone, purpose: 'register_verified', jti },
      config.jwtSecret,
      { expiresIn: '10m' }
    );
    verifiedRegistrationStore.set(phone, {
      jti,
      expiresAt: Date.now() + 10 * 60 * 1000,
    });

    return {
      verified: true,
      isNewUser: true,
      phone,
      verificationToken,
    };
  }

  const isNewUser = !user;

  if (!user) {
    // Create preliminary user profile on first OTP login
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
  otp?: string;
  verificationToken?: string;
  firebaseIdToken?: string;
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
    const err: any = new Error('Please enter a valid 10-digit Indian mobile number');
    err.status = 400;
    throw err;
  }

  if (!data.name || data.name.trim().length < 2) {
    const err: any = new Error('Please enter farmer name (minimum 2 letters)');
    err.status = 400;
    throw err;
  }

  // Block overwriting or taking over an existing registered phone number
  const existing = await prisma.user.findUnique({
    where: { phone },
  });
  if (existing) {
    const err: any = new Error('An account with this mobile number already exists. Please login instead.');
    err.status = 409;
    throw err;
  }

  // Require proof of phone OTP verification before creating the account
  let otpVerified = false;

  if (data.verificationToken && typeof data.verificationToken === 'string') {
    let decoded: { phone?: string; purpose?: string; jti?: string };
    try {
      decoded = jwt.verify(data.verificationToken, config.jwtSecret) as {
        phone?: string;
        purpose?: string;
        jti?: string;
      };
    } catch {
      const err: any = new Error('Invalid or expired OTP verification token. Please verify your mobile number again.');
      err.status = 401;
      throw err;
    }

    if (
      decoded.purpose !== 'register_verified' ||
      decoded.phone !== phone ||
      !decoded.jti ||
      consumedRegistrationJtis.has(decoded.jti)
    ) {
      const err: any = new Error('OTP verification token is invalid or does not match this mobile number.');
      err.status = 401;
      throw err;
    }

    consumedRegistrationJtis.set(decoded.jti, Date.now() + 10 * 60 * 1000);
    verifiedRegistrationStore.delete(phone);
    otpVerified = true;
  } else if (data.firebaseIdToken && typeof data.firebaseIdToken === 'string') {
    const decodedFb = await verifyFirebaseIdToken(data.firebaseIdToken);
    if (!decodedFb.phone_number || cleanPhone(decodedFb.phone_number) !== phone) {
      const err: any = new Error('Firebase verification token does not match the provided mobile number.');
      err.status = 401;
      throw err;
    }
    otpVerified = true;
  } else if (data.otp && typeof data.otp === 'string') {
    if (!isDemoOtpActive()) {
      const err: any = new Error('Demo OTP registration is disabled. Please verify your phone number.');
      err.status = 401;
      throw err;
    }

    const pendingVerified = verifiedRegistrationStore.get(phone);
    const challenge = otpStore.get(phone);

    if (challenge) {
      if (Date.now() - challenge.createdAt > 5 * 60 * 1000) {
        otpStore.delete(phone);
        const err: any = new Error('OTP expired. Please request a new OTP.');
        err.status = 400;
        throw err;
      }
      if (challenge.attempts >= 5) {
        otpStore.delete(phone);
        const err: any = new Error('Too many failed attempts. Please request a fresh OTP.');
        err.status = 429;
        throw err;
      }
      if (data.otp !== challenge.otp) {
        challenge.attempts += 1;
        const err: any = new Error('Invalid OTP entered. Please check the verification code.');
        err.status = 400;
        throw err;
      }
      otpStore.delete(phone);
      otpVerified = true;
    } else if (pendingVerified && Date.now() <= pendingVerified.expiresAt) {
      consumedRegistrationJtis.set(pendingVerified.jti, pendingVerified.expiresAt);
      verifiedRegistrationStore.delete(phone);
      otpVerified = true;
    } else {
      const err: any = new Error('Please request and verify an OTP for this mobile number before registering.');
      err.status = 401;
      throw err;
    }
  } else {
    // Allow if caller previously verified via /verify-otp with purpose='register'
    const pendingVerified = verifiedRegistrationStore.get(phone);
    if (pendingVerified && Date.now() <= pendingVerified.expiresAt) {
      consumedRegistrationJtis.set(pendingVerified.jti, pendingVerified.expiresAt);
      verifiedRegistrationStore.delete(phone);
      otpVerified = true;
    }
  }

  if (!otpVerified) {
    const err: any = new Error('Verified OTP is required before creating an account.');
    err.status = 401;
    throw err;
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

  const user = await prisma.user.create({
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
