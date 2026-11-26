import { Router, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import {
  createOtpChallenge,
  verifyOtp,
  registerFarmer,
  verifyFirebaseLogin,
  guestLogin,
  demoLogin,
  isDemoModeActive,
  isDemoOtpActive,
  isOtpServiceActive,
} from '../services/authService';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { authRateLimiter } from '../middleware/rateLimiter';
import prisma from '../utils/prisma';

const router = Router();

// Apply brute-force rate limiting explicitly to login, OTP, and registration routes
// (Authenticated GET /me and profile reads stay accessible across normal client reloads)
/**
 * POST /api/auth/demo-login
 * - Instant one-tap demo login as Ramesh Kumar (Mandya, Karnataka).
 * - Returns 404 unless DEMO_MODE=true.
 */
router.post('/demo-login', authRateLimiter, async (req: Request, res: Response) => {
  if (!isDemoModeActive()) {
    return res.status(404).json({ success: false, message: 'Endpoint not found' });
  }

  try {
    const result = await demoLogin();

    res.cookie('token', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: 'lax',
    });

    res.json({
      success: true,
      data: result,
      message: 'Logged in as Ramesh Kumar (Mandya, Karnataka).',
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message || 'Demo login failed',
    });
  }
});

/**
 * POST /api/auth/guest-login
 * - Legacy demo login alias; returns 404 unless DEMO_MODE=true.
 */
router.post('/guest-login', authRateLimiter, async (req: Request, res: Response) => {
  if (!isDemoModeActive()) {
    return res.status(404).json({ success: false, message: 'Endpoint not found' });
  }

  try {
    const { preferredPhone, preferredName } = req.body || {};
    const result = await guestLogin(preferredPhone, preferredName);

    res.cookie('token', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: 'lax',
    });

    res.json({
      success: true,
      data: result,
      message: 'Demo login successful! Welcome to Krishi Sathi.',
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message || 'Demo login failed',
    });
  }
});

/**
 * POST /api/auth/direct-login
 * - Legacy demo direct login; returns 404 unless DEMO_MODE=true.
 */
router.post('/direct-login', authRateLimiter, async (req: Request, res: Response) => {
  if (!isDemoModeActive()) {
    return res.status(404).json({ success: false, message: 'Endpoint not found' });
  }

  try {
    const { phone, name } = req.body || {};
    if (!phone) {
      return res.status(400).json({ success: false, message: 'Mobile number is required' });
    }

    const result = await guestLogin(phone, name);

    res.cookie('token', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: 'lax',
    });

    res.json({
      success: true,
      data: result,
      message: 'Login successful! Welcome to Krishi Sathi.',
    });
  } catch (err: any) {
    res.status(400).json({
      success: false,
      message: err.message || 'Direct login failed',
    });
  }
});

/**
 * POST /api/auth/firebase-login
 * - Accepts { idToken }
 * - Verifies it with admin.auth().verifyIdToken
 * - Reads phone_number exclusively from the VERIFIED token
 * - Normalizes with cleanPhone() and finds or creates the Prisma user
 * - Issues JWT in httpOnly cookie and returns { user, isNewUser }
 * - Returns clear 401 if token is invalid or has no phone number
 */
router.post('/firebase-login', authRateLimiter, async (req: Request, res: Response) => {
  try {
    const { idToken } = req.body;
    if (!idToken || typeof idToken !== 'string') {
      return res.status(401).json({
        success: false,
        message: 'Firebase ID token is required. Please sign in via Firebase phone authentication.',
      });
    }

    const result = await verifyFirebaseLogin(idToken);

    // Set HTTP-only cookie for secure browser session
    res.cookie('token', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      sameSite: 'lax',
    });

    res.json({
      success: true,
      data: {
        token: result.token,
        user: result.user,
        isNewUser: result.isNewUser,
      },
      message: result.isNewUser ? 'New user registered via Firebase' : 'Login successful',
    });
  } catch (err: any) {
    console.error('[auth/firebase-login] Verification failed:', err.message);
    res.status(401).json({
      success: false,
      message: err.message || 'Firebase authentication failed. Invalid or expired token.',
    });
  }
});

// Send OTP (Supported via self-hosted Android SMS Gateway or Demo OTP)
router.post('/send-otp', authRateLimiter, async (req: Request, res: Response) => {
  if (!isOtpServiceActive()) {
    return res.status(404).json({
      success: false,
      message: 'OTP service is disabled. Please configure SMS Gateway or use Firebase Phone Authentication.',
    });
  }

  try {
    const { phone, purpose } = req.body || {};
    if (!phone) {
      return res.status(400).json({ success: false, message: 'Mobile number is required' });
    }

    const safePurpose = purpose === 'register' ? 'register' : 'login';
    const result = await createOtpChallenge(phone, safePurpose);
    res.json({
      success: true,
      data: result,
      message: result.demoOtpNote || 'Verification code sent to your mobile via SMS',
    });
  } catch (err: any) {
    res.status(err.status || 400).json({ success: false, message: err.message || 'Failed to send OTP' });
  }
});

// Verify OTP (Supported via self-hosted Android SMS Gateway or Demo OTP)
router.post('/verify-otp', authRateLimiter, async (req: Request, res: Response) => {
  if (!isOtpServiceActive()) {
    return res.status(404).json({
      success: false,
      message: 'OTP service is disabled. Please configure SMS Gateway or use Firebase Phone Authentication.',
    });
  }

  try {
    const { phone, otp, purpose } = req.body || {};
    if (!phone || !otp) {
      return res.status(400).json({ success: false, message: 'Phone and OTP are required' });
    }

    const safePurpose = purpose === 'register' ? 'register' : 'login';
    const result: any = await verifyOtp(phone, otp, safePurpose);

    if (result.token) {
      res.cookie('token', result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        sameSite: 'lax',
      });
    }

    res.json({
      success: true,
      data: result,
      message: safePurpose === 'register' ? 'Mobile number verified for registration' : 'Login successful',
    });
  } catch (err: any) {
    res.status(err.status || 400).json({ success: false, message: err.message || 'OTP verification failed' });
  }
});

// Register (Requires verified OTP or Firebase ID token; blocks existing phone takeover)
router.post('/register', authRateLimiter, async (req: Request, res: Response) => {
  try {
    const {
      name,
      phone,
      otp,
      verificationToken,
      firebaseIdToken,
      idToken,
      language,
      state,
      district,
      village,
      taluk,
      farmSize,
      farmUnit,
      latitude,
      longitude,
      locationAccuracy,
      locationSource,
    } = req.body || {};

    if (typeof phone !== 'string' || typeof name !== 'string' || !name.trim() || !phone.trim()) {
      return res.status(400).json({ success: false, message: 'Valid name and phone number are required' });
    }

    const VALID_LANGS = ['en', 'kn', 'ta', 'te'];
    if (language !== undefined && (typeof language !== 'string' || !VALID_LANGS.includes(language))) {
      return res.status(400).json({ success: false, message: 'Invalid language selection' });
    }

    let parsedFarmSize = 2.5;
    if (farmSize !== undefined && farmSize !== null && farmSize !== '') {
      parsedFarmSize = Number(farmSize);
      if (!Number.isFinite(parsedFarmSize) || parsedFarmSize <= 0 || parsedFarmSize > 100000) {
        return res.status(400).json({ success: false, message: 'farmSize must be a positive number' });
      }
    }

    let parsedLat: number | undefined;
    if (latitude !== undefined && latitude !== null && latitude !== '') {
      parsedLat = Number(latitude);
      if (!Number.isFinite(parsedLat) || parsedLat < -90 || parsedLat > 90) {
        return res.status(400).json({ success: false, message: 'latitude must be between -90 and 90' });
      }
    }

    let parsedLon: number | undefined;
    if (longitude !== undefined && longitude !== null && longitude !== '') {
      parsedLon = Number(longitude);
      if (!Number.isFinite(parsedLon) || parsedLon < -180 || parsedLon > 180) {
        return res.status(400).json({ success: false, message: 'longitude must be between -180 and 180' });
      }
    }

    const result = await registerFarmer({
      name: name.trim(),
      phone,
      otp,
      verificationToken,
      firebaseIdToken: firebaseIdToken || idToken,
      language: language || 'en',
      state: state || 'Karnataka',
      district: district || 'Mandya',
      village,
      taluk,
      farmSize: parsedFarmSize,
      farmUnit: farmUnit || 'Acres',
      latitude: parsedLat,
      longitude: parsedLon,
      locationAccuracy: locationAccuracy !== undefined && locationAccuracy !== null ? parseFloat(locationAccuracy) : undefined,
      locationSource,
    });

    res.cookie('token', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: 'lax',
    });

    res.status(201).json({
      success: true,
      data: result,
      message: 'Registration successful! Welcome to Krishi Sathi.',
    });
  } catch (err: any) {
    res.status(err.status || 400).json({ success: false, message: err.message || 'Registration failed' });
  }
});

// Current User Me
router.get('/me', authMiddleware, async (req: AuthRequest, res: Response) => {
  res.json({
    success: true,
    data: req.user,
  });
});

// Alias for GET /me
router.get('/profile', authMiddleware, async (req: AuthRequest, res: Response) => {
  res.json({
    success: true,
    data: req.user,
  });
});

// Update Profile
router.patch('/profile', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;
    const {
      name,
      village,
      district,
      state,
      taluk,
      farmSize,
      farmUnit,
      language,
      latitude,
      longitude,
      locationAccuracy,
      locationSource,
    } = req.body || {};

    const VALID_LANGS = ['en', 'kn', 'ta', 'te'];

    if (name !== undefined && (typeof name !== 'string' || !name.trim())) {
      return res.status(400).json({ success: false, message: 'Name must be a non-empty string' });
    }
    if (language !== undefined && (typeof language !== 'string' || !VALID_LANGS.includes(language.trim()))) {
      return res.status(400).json({ success: false, message: 'Invalid language selection. Allowed: en, kn, ta, te' });
    }

    let parsedFarmSize: number | undefined;
    if (farmSize !== undefined && farmSize !== null && farmSize !== '') {
      parsedFarmSize = Number(farmSize);
      if (!Number.isFinite(parsedFarmSize) || parsedFarmSize <= 0 || parsedFarmSize > 100000) {
        return res.status(400).json({ success: false, message: 'farmSize must be a positive number' });
      }
    }

    let latVal: number | undefined;
    if (latitude !== undefined && latitude !== null && latitude !== '') {
      latVal = Number(latitude);
      if (!Number.isFinite(latVal) || latVal < -90 || latVal > 90) {
        return res.status(400).json({ success: false, message: 'latitude must be between -90 and 90' });
      }
    }

    let lonVal: number | undefined;
    if (longitude !== undefined && longitude !== null && longitude !== '') {
      lonVal = Number(longitude);
      if (!Number.isFinite(lonVal) || lonVal < -180 || lonVal > 180) {
        return res.status(400).json({ success: false, message: 'longitude must be between -180 and 180' });
      }
    }

    for (const [key, val] of Object.entries({ village, district, state, taluk, farmUnit })) {
      if (val !== undefined && val !== null && typeof val !== 'string') {
        return res.status(400).json({ success: false, message: `${key} must be a string` });
      }
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        name: name !== undefined ? name.trim() : undefined,
        village: village !== undefined && village !== null ? village.trim() : village === null ? null : undefined,
        district: district !== undefined && district !== null ? district.trim() : undefined,
        state: state !== undefined && state !== null ? state.trim() : undefined,
        taluk: taluk !== undefined && taluk !== null ? taluk.trim() : taluk === null ? null : undefined,
        farmSize: parsedFarmSize,
        farmUnit: farmUnit !== undefined && farmUnit !== null ? farmUnit.trim() : undefined,
        language: language !== undefined ? language.trim() : undefined,
        latitude: latVal,
        longitude: lonVal,
        locationAccuracy: locationAccuracy !== undefined && locationAccuracy !== null ? parseFloat(locationAccuracy) || null : undefined,
        locationSource: locationSource !== undefined ? String(locationSource) : undefined,
      },
    });

    res.json({
      success: true,
      data: updated,
      message: 'Profile updated successfully',
    });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message || 'Failed to update profile' });
  }
});

// Upload User Profile Avatar (Safe base64 data-URL with MIME & size validation)
router.post('/avatar', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;
    const imageData = req.body.imageData || req.body.image;

    if (!imageData || typeof imageData !== 'string') {
      return res.status(400).json({ success: false, message: 'Image data is required' });
    }

    // Validate MIME type
    const matches = imageData.match(/^data:(image\/(jpeg|png|webp|gif));base64,(.+)$/);
    if (!matches) {
      return res.status(400).json({
        success: false,
        message: 'Invalid image format. Only JPEG, PNG, and WebP images are supported.',
      });
    }

    const mimeType = matches[1];
    const extension = mimeType === 'image/jpeg' ? 'jpg' : mimeType === 'image/png' ? 'png' : 'webp';
    const base64Buffer = Buffer.from(matches[3], 'base64');

    // Limit to 2.5MB
    if (base64Buffer.length > 2.5 * 1024 * 1024) {
      return res.status(400).json({
        success: false,
        message: 'Image size exceeds maximum limit of 2.5MB. Please choose a smaller photo.',
      });
    }

    // Ensure uploads/avatars directory exists
    const uploadsDir = path.join(__dirname, '../../uploads/avatars');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Clean up previous avatar file if exists
    if (user.avatar && user.avatar.startsWith('/uploads/avatars/')) {
      const oldPath = path.join(__dirname, '../../', user.avatar.replace(/^\//, ''));
      if (fs.existsSync(oldPath)) {
        try {
          fs.unlinkSync(oldPath);
        } catch {
          // ignore unlink error
        }
      }
    }

    // Save with unique user-specific filename
    const filename = `avatar-${user.id}-${Date.now()}.${extension}`;
    const filePath = path.join(uploadsDir, filename);
    fs.writeFileSync(filePath, base64Buffer);

    const avatarUrl = `/uploads/avatars/${filename}`;
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { avatar: avatarUrl },
    });

    res.json({
      success: true,
      data: updatedUser,
      message: 'Profile picture updated successfully',
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Failed to upload avatar' });
  }
});

// Remove User Profile Avatar
router.delete('/avatar', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;

    // Clean up file if on disk
    if (user.avatar && user.avatar.startsWith('/uploads/avatars/')) {
      const oldPath = path.join(__dirname, '../../', user.avatar.replace(/^\//, ''));
      if (fs.existsSync(oldPath)) {
        try {
          fs.unlinkSync(oldPath);
        } catch {
          // ignore unlink error
        }
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { avatar: null },
    });

    res.json({
      success: true,
      data: updatedUser,
      message: 'Profile picture removed successfully',
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Failed to remove avatar' });
  }
});

// Logout
router.post('/logout', (req: Request, res: Response) => {
  res.clearCookie('token');
  res.json({
    success: true,
    message: 'Logged out successfully',
  });
});

export default router;
