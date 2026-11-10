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

// Send OTP (Demo Path — Disabled in production or unless DEMO_OTP_ENABLED=true)
router.post('/send-otp', authRateLimiter, async (req: Request, res: Response) => {
  if (!isDemoOtpActive()) {
    return res.status(404).json({
      success: false,
      message: 'Demo OTP is disabled. Please use real Firebase Phone Authentication via /api/auth/firebase-login',
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
      message: 'OTP sent successfully. For local testing, use Demo OTP: 123456',
    });
  } catch (err: any) {
    res.status(err.status || 400).json({ success: false, message: err.message || 'Failed to send OTP' });
  }
});

// Verify OTP (Demo Path — Disabled in production or unless DEMO_OTP_ENABLED=true)
router.post('/verify-otp', authRateLimiter, async (req: Request, res: Response) => {
  if (!isDemoOtpActive()) {
    return res.status(404).json({
      success: false,
      message: 'Demo OTP is disabled. Please use real Firebase Phone Authentication via /api/auth/firebase-login',
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

    if (!phone || !name) {
      return res.status(400).json({ success: false, message: 'Name and phone number are required' });
    }

    const result = await registerFarmer({
      name,
      phone,
      otp,
      verificationToken,
      firebaseIdToken: firebaseIdToken || idToken,
      language: language || 'en',
      state: state || 'Karnataka',
      district: district || 'Mandya',
      village,
      taluk,
      farmSize: farmSize ? parseFloat(farmSize) : 2.5,
      farmUnit: farmUnit || 'Acres',
      latitude: latitude !== undefined && latitude !== null ? parseFloat(latitude) : undefined,
      longitude: longitude !== undefined && longitude !== null ? parseFloat(longitude) : undefined,
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
    } = req.body;

    const latVal = latitude !== undefined ? parseFloat(latitude) : undefined;
    const lonVal = longitude !== undefined ? parseFloat(longitude) : undefined;

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        name: name !== undefined ? String(name).trim() : undefined,
        village: village !== undefined ? String(village).trim() : undefined,
        district: district !== undefined ? String(district).trim() : undefined,
        state: state !== undefined ? String(state).trim() : undefined,
        taluk: taluk !== undefined ? String(taluk).trim() : undefined,
        farmSize: farmSize !== undefined ? parseFloat(farmSize) || null : undefined,
        farmUnit: farmUnit !== undefined ? String(farmUnit).trim() : undefined,
        language: language !== undefined ? String(language).trim() : undefined,
        latitude: latVal !== undefined && !isNaN(latVal) && latVal >= -90 && latVal <= 90 ? latVal : undefined,
        longitude: lonVal !== undefined && !isNaN(lonVal) && lonVal >= -180 && lonVal <= 180 ? lonVal : undefined,
        locationAccuracy: locationAccuracy !== undefined ? parseFloat(locationAccuracy) || null : undefined,
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
