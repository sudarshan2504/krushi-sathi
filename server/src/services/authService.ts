import jwt from 'jsonwebtoken';
import { config } from '../config';
import prisma from '../utils/prisma';

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

export async function createOtpChallenge(rawPhone: string) {
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
  farmSize?: number;
  farmUnit?: string;
}) {
  const phone = cleanPhone(data.phone);
  if (!isValidIndianPhone(phone)) {
    throw new Error('Please enter a valid 10-digit Indian mobile number');
  }

  if (!data.name || data.name.trim().length < 2) {
    throw new Error('Please enter farmer name (minimum 2 letters)');
  }

  const existing = await prisma.user.findUnique({
    where: { phone },
  });

  let user;
  if (existing) {
    user = await prisma.user.update({
      where: { phone },
      data: {
        name: data.name.trim(),
        language: data.language || existing.language,
        state: data.state || existing.state,
        district: data.district || existing.district,
        village: data.village !== undefined ? data.village : existing.village,
        farmSize: data.farmSize ?? existing.farmSize,
        farmUnit: data.farmUnit || existing.farmUnit,
      },
    });
  } else {
    user = await prisma.user.create({
      data: {
        phone,
        name: data.name.trim(),
        language: data.language || 'en',
        state: data.state || 'Karnataka',
        district: data.district || 'Mandya',
        village: data.village || '',
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
