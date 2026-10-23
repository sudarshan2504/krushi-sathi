import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import prisma from '../utils/prisma';

export interface AuthenticatedUser {
  id: string;
  name: string;
  phone: string;
  language: string;
  state: string;
  district: string;
  village?: string | null;
  farmSize?: number | null;
  farmUnit: string;
  avatar?: string | null;
}

export interface AuthRequest extends Request {
  user?: AuthenticatedUser;
}

export async function authMiddleware(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    let token: string | undefined;

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      res.status(401).json({ success: false, message: 'Authentication required. Please login with your mobile number.' });
      return;
    }

    const decoded = jwt.verify(token, config.jwtSecret) as { userId: string };
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      res.status(401).json({ success: false, message: 'User account not found. Please login again.' });
      return;
    }

    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ success: false, message: 'Session expired or invalid. Please login again.' });
  }
}

export async function optionalAuthMiddleware(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    let token: string | undefined;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (token) {
      const decoded = jwt.verify(token, config.jwtSecret) as { userId: string };
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
      });
      if (user) {
        req.user = user;
      }
    }
  } catch {
    // Ignore error for optional auth
  }
  next();
}
