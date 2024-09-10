import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import Logging from '../utils/Logging';
import { AppError } from './errorHandler';

const locationSchema = Joi.object({
  name: Joi.string().required(),
  latitude: Joi.number().min(-90).max(90).required(),
  longitude: Joi.number().min(-180).max(180).required(),
});

export const validateLocationInput = (req: Request, res: Response, next: NextFunction) => {
  Logging.info('Validating location input');
  
  const { error } = locationSchema.validate(req.body);
  
  if (error) {
    Logging.warn(`Invalid location input: ${error.details[0].message}`);
    const appError = new AppError(error.details[0].message, 400);
    return next(appError);
  }
  
  Logging.info('Location input validated successfully');
  next();
};
