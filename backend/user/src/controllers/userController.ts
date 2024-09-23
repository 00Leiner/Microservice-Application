import { Request, Response } from 'express';
import { User, IUser } from '../models/userModel';
import Logging from '../utils/Logging';
import * as argon2 from 'argon2';
import { AuthRequest, generateToken } from '../middleware/authMiddleware';
import { OAuth2Client } from 'google-auth-library';

const client = new OAuth2Client(process.env.OAuthClientID);

export const userController = {
  // Create a new user
  createUser: async (req: Request, res: Response) => {
    Logging.info(`Create User - Request received: ${JSON.stringify(req.body)}`);
    try {
      const { username, email, password, firstName, lastName } = req.body;

      const newUser = new User({
        username,
        email,
        password,
        firstName,
        lastName,
      });
      await newUser.save();

      // Generate JWT token
      const token = generateToken(newUser._id);
      if (!token) {
        Logging.error(`Failed to generate token for user: ${newUser._id}`);
        return res.status(500).json({ message: 'Error generating authentication token' });
      }

      // Create a user object without sensitive information
      const userResponse = {
        _id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        isVerified: newUser.isVerified,
        profilePicture: newUser.profilePicture
      };

      Logging.info(`User created: ${username} (${newUser._id})`);
      res.status(201).json({
        message: 'User created successfully',
        token,
        user: userResponse
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'ValidationError') {
          Logging.error(`Create User - Validation error: ${error.message}`);
          return res.status(400).json({ message: 'Invalid input', error: error.message });
        }
      }
      Logging.error(`Create User - Error: ${error}`);
      res.status(500).json({ message: 'Error creating user', error });
    }
  },

  // Get user by _id
  getUserById: async (req: AuthRequest, res: Response) => {
    Logging.info(`Get User - Request received for user _id: ${req.params._id}`);
    try {
      const user = await User.findById(req.params._id).select('-password');
      if (!user) {
        Logging.warn(`Get User - User not found: ${req.params._id}`);
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Check if the authenticated user is requesting their own data
      if (req.user._id.toString() !== req.params._id) {
        Logging.warn(`Get User - Access denied for user ${req.user._id} requesting data for ${req.params._id}`);
        return res.status(403).json({ message: 'Access denied' });
      }

      Logging.info(`User retrieved: ${user.username} (${user._id})`);
      res.json(user);
    } catch (error) {
      Logging.error(`Get User - Error retrieving user: ${error}`);
      res.status(500).json({ message: 'Error retrieving user', error });
    }
  },

  // Update user
  updateUser: async (req: AuthRequest, res: Response) => {
    Logging.info(`Update User - Method: ${req.method}, URL: ${req.originalUrl}, Params: ${JSON.stringify(req.params)}`);
    try {
      const userId = req.params._id;

      // Check if the authenticated user is updating their own data
      if (req.user._id.toString() !== userId) {
        Logging.warn(`Update User - Access denied for user ${req.user._id} updating ${userId}`);
        return res.status(403).json({ message: 'Access denied' });
      }
      
      const updateFields: Partial<IUser> = req.body;

      const updatedUser = await User.findOneAndUpdate(
        { _id: userId },
        { $set: updateFields },
        { new: true, runValidators: true }
      ).select('-password');

      if (!updatedUser) {
        Logging.warn(`Update User - User not found for update: ${userId}`);
        return res.status(404).json({ message: 'User not found' });
      }

      Logging.info(`User updated: ${updatedUser.username} (${updatedUser._id})`);
      res.json(updatedUser);
    } catch (error) {
      if (error instanceof Error) {
        Logging.error(`Update User - Error: ${error.message}`);
        if (error.name === 'ValidationError') {
          return res.status(400).json({ message: 'Invalid input', error: error.message });
        }
      }
      Logging.error(`Update User - Error updating user: ${error}`);
      res.status(500).json({ message: 'Error updating user', error });
    }
  },

  // Delete user
  deleteUser: async (req: AuthRequest, res: Response) => {
    Logging.info(`Delete User - Request received for user _id: ${req.params._id}`);
    try {
      // Check if the authenticated user is deleting their own account
      if (req.user._id.toString() !== req.params._id) {
        Logging.warn(`Delete User - Access denied for user ${req.user._id} deleting ${req.params._id}`);
        return res.status(403).json({ message: 'Access denied' });
      }

      const deletedUser = await User.findByIdAndDelete(req.params._id);
      if (!deletedUser) {
        Logging.warn(`Delete User - User not found for deletion: ${req.params._id}`);
        return res.status(404).json({ message: 'User not found' });
      }
      Logging.warn(`User deleted: ${deletedUser.username} (${deletedUser._id})`);
      res.json({ message: 'User deleted successfully' });
    } catch (error) {
      Logging.error(`Delete User - Error deleting user: ${error}`);
      res.status(500).json({ message: 'Error deleting user', error });
    }
  },

  // User login
  loginUser: async (req: Request, res: Response) => {
    Logging.info(`Login - Request received for: ${req.body.login}`);
    try {
      const { login, password } = req.body;
      // Find user by username or email
      const user = await User.findOne({
        $or: [{ username: login }, { email: login }]
      });

      if (!user) {
        Logging.warn(`Login failed: User not found - ${login}`);
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const isMatch = await argon2.verify(user.password, password);
      if (!isMatch) {
        Logging.warn(`Login failed: Incorrect password - ${user.username} (${user._id})`);
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const token = generateToken(user._id);
      if (!token) {
        Logging.error(`Failed to generate token for user: ${user._id}`);
        return res.status(500).json({ message: 'Error generating authentication token' });
      }

      // Create a user object without sensitive information
      const userResponse = {
        _id: user._id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        isVerified: user.isVerified,
        profilePicture: user.profilePicture
      };

      Logging.info(`User logged in: ${user.username} (${user._id})`);
      res.json({
        message: 'Login successful',
        token,
        user: userResponse
      });
    } catch (error) {
      Logging.error(`Login - Error during login: ${error}`);
      res.status(500).json({ message: 'Error during login', error });
    }
  },

  googleLogin: async (req: Request, res: Response) => {
    Logging.info(`Google Login - Request received`);
    try {
      const { credential } = req.body;
      Logging.info(`Google Login - Verifying token`);
      const ticket = await client.verifyIdToken({
        idToken: credential,
        audience: process.env.OAuthClientID,
      });
      const payload = ticket.getPayload();
      if (!payload || !payload.email) {
        Logging.warn(`Google Login - Invalid token or email not provided`);
        return res.status(400).json({ message: 'Invalid token or email not provided' });
      }

      Logging.info(`Google Login - Searching for user with email: ${payload.email}`);
      const user = await User.findOne({ email: payload.email });
      if (!user) {
        Logging.warn(`Google Login - User not found for email: ${payload.email}`);
        return res.status(404).json({ message: 'User not found. Please sign up first.' });
      }

      Logging.info(`Google Login - Updating OAuth info for user: ${user._id}`);
      user.oauthProvider = 'google';
      user.oauthId = payload.sub;
      user.isVerified = true;
      await user.save();

      Logging.info(`Google Login - Generating auth token for user: ${user._id}`);
      const authToken = generateToken(user._id);
      if (!authToken) {
        Logging.error(`Google Login - Failed to generate token for user: ${user._id}`);
        return res.status(500).json({ message: 'Error generating authentication token' });
      }

      const userResponse = {
        _id: user._id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        isVerified: user.isVerified,
        profilePicture: user.profilePicture
      };

      Logging.info(`Google Login - User logged in successfully: ${user.email}`);
      res.json({
        message: 'Google login successful',
        token: authToken,
        user: userResponse
      });
    } catch (error) {
      Logging.error(`Google Login - Error: ${error}`);
      res.status(500).json({ message: 'Error during Google login', error });
    }
  },

  googleSignup: async (req: Request, res: Response) => {
    Logging.info(`Google Signup - Request received`);
    try {
      const { credential } = req.body;
      Logging.info(`Google Signup - Verifying token`);
      const ticket = await client.verifyIdToken({
        idToken: credential,
        audience: process.env.OAuthClientID,
      });
      const payload = ticket.getPayload();
      if (!payload || !payload.email) {
        Logging.warn(`Google Signup - Invalid token or email not provided`);
        return res.status(400).json({ message: 'Invalid token or email not provided' });
      }

      Logging.info(`Google Signup - Checking if user already exists: ${payload.email}`);
      let user = await User.findOne({ email: payload.email });
      if (user) {
        Logging.warn(`Google Signup - User already exists: ${payload.email}`);
        return res.status(400).json({ message: 'User already exists. Please login instead.' });
      }

      Logging.info(`Google Signup - Creating new user: ${payload.email}`);
      user = new User({
        email: payload.email,
        username: payload.email.split('@')[0],
        firstName: payload.given_name || '',
        lastName: payload.family_name || '',
        isVerified: true,
        oauthProvider: 'google',
        oauthId: payload.sub,
        profilePicture: payload.picture || '',
      });
      await user.save();

      Logging.info(`Google Signup - Generating auth token for new user: ${user._id}`);
      const authToken = generateToken(user._id);
      if (!authToken) {
        Logging.error(`Google Signup - Failed to generate token for user: ${user._id}`);
        return res.status(500).json({ message: 'Error generating authentication token' });
      }

      const userResponse = {
        _id: user._id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        isVerified: user.isVerified,
        profilePicture: user.profilePicture
      };

      Logging.info(`Google Signup - New user created successfully: ${user.email}`);
      res.status(201).json({
        message: 'Google signup successful',
        token: authToken,
        user: userResponse
      });
    } catch (error) {
      Logging.error(`Google Signup - Error: ${error}`);
      res.status(500).json({ message: 'Error during Google signup', error });
    }
  }
};
