import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import Logging from '../utils/Logging';

// Add this interface
export interface AuthRequest extends Request {
  user?: {
    userId: string;
  };
}

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
