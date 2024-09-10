import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import Logging from '../utils/Logging';
import { User } from '../models/userModel';

const userSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).max(30).required(),
  firstName: Joi.string().allow(''),
  lastName: Joi.string().allow(''),
  isVerified: Joi.boolean(),
  oauthProvider: Joi.string().allow(''),
  oauthId: Joi.string().allow(''),
  profilePicture: Joi.string().uri().allow('')
});

export const validateUserInput = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Validate input format
    const { error } = userSchema.validate(req.body, { abortEarly: false });
    
    if (error) {
      const errorMessage = error.details.map(detail => detail.message).join(', ');
      Logging.warn(`User input validation failed: ${errorMessage}`);
      return res.status(400).json({ message: 'Invalid input', errors: errorMessage });
    }

    // Check uniqueness of username and email
    const { username, email } = req.body;
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });

    if (existingUser) {
      let errorMessage = '';
      if (existingUser.username === username) {
        errorMessage += 'Username already exists. ';
      }
      if (existingUser.email === email) {
        errorMessage += 'Email already exists. ';
      }
      Logging.error(`User input validation failed: ${errorMessage}`);
      return res.status(400).json({ message: 'Invalid input', errors: errorMessage.trim() });
    }

    Logging.info('User input validation passed');
    next();
  } catch (error) {
    Logging.error(`Error during user input validation: ${error}`);
    res.status(500).json({ message: 'Server error during validation' });
  }
};

export const validateUserUpdateInput = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const updateSchema = userSchema.fork(['username', 'email', 'password'], (schema) => schema.optional());
    
    const { error } = updateSchema.validate(req.body, { abortEarly: false });
    
    if (error) {
      const errorMessage = error.details.map(detail => detail.message).join(', ');
      Logging.warn(`User update input validation failed: ${errorMessage}`);
      return res.status(400).json({ message: 'Invalid input', errors: errorMessage });
    }

    // Check uniqueness of username and email if they are being updated
    const { username, email } = req.body;
    const userId = req.params.id; // Make sure this matches your route parameter name

    if (username !== undefined) {
      const existingUsername = await User.findOne({ username, _id: { $ne: userId } });
      if (existingUsername) {
        return res.status(400).json({ message: 'Username already exists' });
      }
    }

    if (email !== undefined) {
      const existingEmail = await User.findOne({ email, _id: { $ne: userId } });
      if (existingEmail) {
        return res.status(400).json({ message: 'Email already exists' });
      }
    }

    Logging.info('User update input validation passed');
    next();
  } catch (error) {
    Logging.error(`Error during user update input validation: ${error}`);
    res.status(500).json({ message: 'Server error during validation' });
  }
};

export const validateLoginInput = (req: Request, res: Response, next: NextFunction) => {
  const loginSchema = Joi.object({
    login: Joi.alternatives().try(
      Joi.string().email(),
      Joi.string().alphanum().min(3).max(30)
    ).required().messages({
      'any.required': 'Username or email is required',
      'alternatives.match': 'Invalid username or email format'
    }),
    password: Joi.string().required().messages({
      'any.required': 'Password is required'
    })
  });

  const { error } = loginSchema.validate(req.body, { abortEarly: false });

  if (error) {
    const errorMessage = error.details.map(detail => detail.message).join(', ');
    Logging.error(`Login input validation failed: ${errorMessage}`);
    return res.status(400).json({ message: 'Invalid input', errors: errorMessage });
  }

  Logging.info('Login input validation passed');
  next();
};
