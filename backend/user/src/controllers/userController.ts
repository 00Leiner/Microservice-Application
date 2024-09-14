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
        id: newUser._id,
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

  // Get user by ID
  getUserById: async (req: AuthRequest, res: Response) => {
    Logging.info(`Get User - Request received for user ID: ${req.params.id}`);
    try {
      const user = await User.findById(req.params.id).select('-password');
      if (!user) {
        Logging.warn(`Get User - User not found: ${req.params.id}`);
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Check if the authenticated user is requesting their own data
      if (req.user._id.toString() !== req.params.id) {
        Logging.warn(`Get User - Access denied for user ${req.user._id} requesting data for ${req.params.id}`);
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
      const userId = req.params.id;

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
    Logging.info(`Delete User - Request received for user ID: ${req.params.id}`);
    try {
      // Check if the authenticated user is deleting their own account
      if (req.user._id.toString() !== req.params.id) {
        Logging.warn(`Delete User - Access denied for user ${req.user._id} deleting ${req.params.id}`);
        return res.status(403).json({ message: 'Access denied' });
      }

      const deletedUser = await User.findByIdAndDelete(req.params.id);
      if (!deletedUser) {
        Logging.warn(`Delete User - User not found for deletion: ${req.params.id}`);
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
        id: user._id,
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

  googleAuth: async (req: Request, res: Response) => {
    Logging.info(`Google Auth - Request received`);
    try {
      const { token } = req.body;
      const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.OAuthClientID,
      });
      const payload = ticket.getPayload();
      if (!payload) {
        return res.status(400).json({ message: 'Invalid token' });
      }

      const { email, name, picture, sub } = payload;
      let user = await User.findOne({ email });

      if (!user) {
        // Create a new user if they don't exist
        user = new User({
          email: email ?? '',
          username: email ? email.split('@')[0] : '', 
          firstName: name?.split(' ')[0] ?? '',
          lastName: name ? name.split(' ').slice(1).join(' ') : '',
          isVerified: true,
          oauthProvider: 'google',
          oauthId: sub,
          profilePicture: picture,
        });
        await user.save();
        Logging.info(`New user created via Google OAuth: ${user.email}`);
      } else {
        // Update existing user's OAuth info if necessary
        user.oauthProvider = 'google';
        user.oauthId = sub;
        user.isVerified = true;
        if (picture) user.profilePicture = picture;
        await user.save();
        Logging.info(`Existing user logged in via Google OAuth: ${user.email}`);
      }

      const authToken = generateToken(user._id);
      if (!authToken) {
        Logging.error(`Failed to generate token for user: ${user._id}`);
        return res.status(500).json({ message: 'Error generating authentication token' });
      }

      const userResponse = {
        id: user._id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        isVerified: user.isVerified,
        profilePicture: user.profilePicture
      };

      res.json({
        message: 'Google authentication successful',
        token: authToken,
        user: userResponse
      });
    } catch (error) {
      Logging.error(`Google Auth - Error: ${error}`);
      res.status(500).json({ message: 'Error during Google authentication', error });
    }
  }
};
