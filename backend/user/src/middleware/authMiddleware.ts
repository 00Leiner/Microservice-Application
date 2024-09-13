import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/userModel';
import Logging from '../utils/Logging';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not set in environment variables');
}

export interface AuthRequest extends Request {
  user?: any;
}

export const generateToken = (userId: any): string | null => {
  try {
    const token = jwt.sign(
      { userId },
      JWT_SECRET,
      { expiresIn: '1h' }
    );
    Logging.info(`Token generated for user: ${userId}`);
    return token;
  } catch (error) {
    Logging.error(`Error generating token: ${error}`);
    return null;
  }
};

export const authMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
  Logging.info(`Auth Middleware - ${req.method} ${req.originalUrl}`);
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      Logging.warn('Auth Middleware - No token provided');
      return res.status(401).json({ message: 'No authentication token, access denied' });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      Logging.warn(`Auth Middleware - User not found for token: ${decoded.userId}`);
      return res.status(401).json({ message: 'User not found' });
    }

    req.user = user;
    Logging.info(`Auth Middleware - User authenticated: ${user._id}`);
    next();
  } catch (error) {
    Logging.error(`Auth Middleware - Authentication error: ${error}`);
    res.status(401).json({ message: 'Token is not valid' });
  }
};
