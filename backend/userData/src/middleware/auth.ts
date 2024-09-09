import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import Logging from '../utils/Logging';

// Add this interface
export interface AuthRequest extends Request {
  user?: {
    userId: string;
  };
}

export const generateToken = (userId: string): string => {
  Logging.info(`Generating token for user: ${userId}`);
  return jwt.sign({ userId }, process.env.JWT_SECRET as string, { expiresIn: '1d' });
};

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    Logging.warn('No token provided, authorization denied');
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: string };
    Logging.info(`Token validated successfully for user: ${decoded.userId}`);
    req.user = { userId: decoded.userId };
    next();
  } catch (err) {
    Logging.error('Token is not valid');
    res.status(401).json({ message: 'Token is not valid' });
  }
};

export const getUserIdFromRequest = (req: AuthRequest): string | null => {
  const userId = req.user?.userId || null;
  if (userId) {
    Logging.info(`User ID extracted from request: ${userId}`);
  } else {
    Logging.warn('No user ID found in request');
  }
  return userId;
};
