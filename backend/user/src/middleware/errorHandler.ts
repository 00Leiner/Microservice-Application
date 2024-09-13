import { Request, Response, NextFunction } from 'express';
import Logging from '../utils/Logging';

const NODE_ENV = process.env.NODE_ENV;
if (!NODE_ENV) {
  throw new Error('NODE_ENV is not set in environment variables');
}

export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public isOperational: boolean = true
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (err: AppError | Error, req: Request, res: Response, next: NextFunction) => {
  const appError = err instanceof AppError ? err : new AppError(err.message);

  // Log the error
  Logging.error(`[${appError.name}] ${appError.message}`);
  if (!appError.isOperational) {
    Logging.error(appError.stack || 'No stack trace available');
  }

  // Prepare the error response
  const errorResponse = {
    error: {
      message: appError.isOperational ? appError.message : 'An unexpected error occurred',
      ...(NODE_ENV === 'development' && { stack: appError.stack }),
    },
  };

  // Send the error response
  res.status(appError.statusCode).json(errorResponse);
};

// Function to wrap async route handlers
export const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
