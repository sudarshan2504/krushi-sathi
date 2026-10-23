import { Router, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import {
  createOtpChallenge,
  verifyOtp,
  registerFarmer,
  verifyFirebaseLogin,
} from '../services/authService';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { authRateLimiter } from '../middleware/rateLimiter';
import { config } from '../config';
import prisma from '../utils/prisma';

const router = Router();

// Apply simple rate limiting (10 requests per minute per IP) to all /api/auth routes
router.use(authRateLimiter);

/**
 * POST /api/auth/firebase-login
 * - Accepts { idToken }
 * - Verifies it with admin.auth().verifyIdToken
 * - Reads phone_number exclusively from the VERIFIED token
 * - Normalizes with cleanPhone() and finds or creates the Prisma user
 * - Issues JWT in httpOnly cookie and returns { user, isNewUser }
 * - Returns clear 401 if token is invalid or has no phone number
 */
router.post('/firebase-login', async (req: Request, res: Response) => {
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

// Send OTP (Demo Path — Disabled unless NODE_ENV === 'development' AND DEMO_OTP_ENABLED === 'true')
router.post('/send-otp', async (req: Request, res: Response) => {
  if (!(config.nodeEnv === 'development' && config.demoOtpEnabled)) {
    return res.status(404).json({
      success: false,
      message: 'Demo OTP is disabled. Please use real Firebase Phone Authentication via /api/auth/firebase-login',
    });
  }

  try {
    const { phone } = req.body;
    if (!phone) {
      return res.status(400).json({ success: false, message: 'Mobile number is required' });
    }

    const result = await createOtpChallenge(phone);
    res.json({
      success: true,
      data: result,
      message: 'OTP sent successfully. For local testing, use Demo OTP: 123456',
    });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message || 'Failed to send OTP' });
  }
});

// Verify OTP (Demo Path — Disabled unless NODE_ENV === 'development' AND DEMO_OTP_ENABLED === 'true')
router.post('/verify-otp', async (req: Request, res: Response) => {
  if (!(config.nodeEnv === 'development' && config.demoOtpEnabled)) {
    return res.status(404).json({
      success: false,
      message: 'Demo OTP is disabled. Please use real Firebase Phone Authentication via /api/auth/firebase-login',
    });
  }

  try {
    const { phone, otp } = req.body;
    if (!phone || !otp) {
      return res.status(400).json({ success: false, message: 'Phone and OTP are required' });
    }

    const result = await verifyOtp(phone, otp);

    // Set HTTP-only cookie for secure development session
    res.cookie('token', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      sameSite: 'lax',
    });

    res.json({
      success: true,
      data: result,
      message: 'Login successful',
    });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message || 'OTP verification failed' });
  }
});

// Register
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { name, phone, language, state, district, village, farmSize, farmUnit } = req.body;
    const result = await registerFarmer({
      name,
      phone,
      language: language || 'en',
      state: state || 'Karnataka',
      district: district || 'Mandya',
      village,
      farmSize: farmSize ? parseFloat(farmSize) : 2.5,
      farmUnit: farmUnit || 'Acres',
    });

    res.cookie('token', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: 'lax',
    });

    res.json({
      success: true,
      data: result,
      message: 'Registration successful! Welcome to Krishi Sathi.',
    });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message || 'Registration failed' });
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
    const { name, village, district, state, farmSize, farmUnit, language } = req.body;

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        name: name !== undefined ? String(name).trim() : undefined,
        village: village !== undefined ? String(village).trim() : undefined,
        district: district !== undefined ? String(district).trim() : undefined,
        state: state !== undefined ? String(state).trim() : undefined,
        farmSize: farmSize !== undefined ? parseFloat(farmSize) || null : undefined,
        farmUnit: farmUnit !== undefined ? String(farmUnit).trim() : undefined,
        language: language !== undefined ? String(language).trim() : undefined,
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
