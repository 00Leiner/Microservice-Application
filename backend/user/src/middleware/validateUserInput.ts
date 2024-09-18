import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import Logging from '../utils/Logging';
import { User } from '../models/userModel';
import { IUser } from '../models/userModel';

// Helper function to capitalize the first letter if it's not a number
const capitalizeFirstLetter = (str: string): string => {
  if (!str) return str;
  if (/^\d/.test(str)) return str; // Return unchanged if starts with a number
  return str.charAt(0).toUpperCase() + str.slice(1);
};

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
    // Capitalize firstName and lastName
    if (req.body.firstName) {
      req.body.firstName = capitalizeFirstLetter(req.body.firstName);
    }
    if (req.body.lastName) {
      req.body.lastName = capitalizeFirstLetter(req.body.lastName);
    }

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
    const { username, email, firstName, lastName, password, oauthProvider, oauthId, profilePicture } = req.body;
    const userId = req.params.id;

    const updateFields: Partial<IUser> = {};
    if (username !== undefined) updateFields.username = username;
    if (email !== undefined) updateFields.email = email;
    if (firstName !== undefined) updateFields.firstName = capitalizeFirstLetter(firstName);
    if (lastName !== undefined) updateFields.lastName = capitalizeFirstLetter(lastName);
    if (password !== undefined) updateFields.password = password;
    if (oauthProvider !== undefined) updateFields.oauthProvider = oauthProvider;
    if (oauthId !== undefined) updateFields.oauthId = oauthId;
    if (profilePicture !== undefined) updateFields.profilePicture = profilePicture;

    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({ message: 'No update fields provided' });
    }

    // Use the existing userSchema, but make all fields optional
    const updateSchema = userSchema.fork(Object.keys(userSchema.describe().keys), (schema) => schema.optional());
    const { error } = updateSchema.validate(updateFields, { abortEarly: false });

    if (error) {
      const errorMessage = error.details.map(detail => detail.message).join(', ');
      Logging.warn(`User update input validation failed: ${errorMessage}`);
      return res.status(400).json({ message: 'Invalid input', errors: errorMessage });
    }

    // Check uniqueness of username and email if they are being updated
    if (updateFields.username) {
      const existingUsername = await User.findOne({ username: updateFields.username, _id: { $ne: userId } });
      if (existingUsername) {
        return res.status(400).json({ message: 'Username already exists' });
      }
    }

    if (updateFields.email) {
      const existingEmail = await User.findOne({ email: updateFields.email, _id: { $ne: userId } });
      if (existingEmail) {
        return res.status(400).json({ message: 'Email already exists' });
      }
    }

    // Attach the validated updateFields to the request object
    req.body = updateFields;

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

export const validateGoogleAuthInput = (req: Request, res: Response, next: NextFunction) => {
  Logging.info('Validating Google Auth input');
  
  const schema = Joi.object({
    credential: Joi.string().required(),
  });
  const { error } = schema.validate(req.body);
  if (error) {
    const errorMessage = error.details[0].message;
    Logging.error(`Google Auth input validation failed: ${errorMessage}`);
    return res.status(400).json({ message: errorMessage });
  }

  Logging.info('Google Auth input validation passed');
  next();
};