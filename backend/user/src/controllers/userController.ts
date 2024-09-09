import { Request, Response } from 'express';
import { User, IUser } from '../models/userModel';
import Logging from '../utils/Logging';
import * as argon2 from 'argon2';

export const userController = {
  // Create a new user
  createUser: async (req: Request, res: Response) => {
    try {
      const { username, email, password, firstName, lastName } = req.body;
      const newUser = new User({
        username,
        email,
        password,
        firstName,
        lastName
      });
      await newUser.save();
      Logging.info(`User created: ${username}`);
      res.status(201).json({ message: 'User created successfully', userId: newUser._id });
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'ValidationError') {
          Logging.error(`Error creating user: ${error.message}`);
          return res.status(400).json({ message: 'Invalid input', error: error.message });
        }
      }
      Logging.error(`Error creating user: ${error}`);
      res.status(500).json({ message: 'Error creating user', error });
    }
  },

  // Get user by ID
  getUserById: async (req: Request, res: Response) => {
    try {
      const user = await User.findById(req.params.id).select('-password');
      if (!user) {
        Logging.warn(`User not found: ${req.params.id}`);
        return res.status(404).json({ message: 'User not found' });
      }
      Logging.info(`User retrieved: ${user.username}`);
      res.json(user);
    } catch (error) {
      Logging.error(`Error retrieving user: ${error}`);
      res.status(500).json({ message: 'Error retrieving user', error });
    }
  },

  // Update user
  updateUser: async (req: Request, res: Response) => {
    try {
      const { username, email, firstName, lastName, password } = req.body;
      
      const updateFields: Partial<IUser> = {};
      if (username !== undefined) updateFields.username = username;
      if (email !== undefined) updateFields.email = email;
      if (firstName !== undefined) updateFields.firstName = firstName;
      if (lastName !== undefined) updateFields.lastName = lastName;
      if (password !== undefined) updateFields.password = password;

      const updatedUser = await User.findOneAndUpdate(
        { _id: req.params.id },
        { $set: updateFields },  // Use $set explicitly
        { new: true, runValidators: true }
      ).select('-password');

      if (!updatedUser) {
        Logging.warn(`User not found for update: ${req.params.id}`);
        return res.status(404).json({ message: 'User not found' });
      }

      Logging.info(`User updated: ${updatedUser.username}`);
      res.json(updatedUser);
    } catch (error) {
      if (error instanceof Error) {
        Logging.error(`Error updating user: ${error.message}`);
        if (error.name === 'ValidationError') {
          return res.status(400).json({ message: 'Invalid input', error: error.message });
        }
      }
      Logging.error(`Error updating user: ${error}`);
      res.status(500).json({ message: 'Error updating user', error });
    }
  },

  // Delete user
  deleteUser: async (req: Request, res: Response) => {
    try {
      const deletedUser = await User.findByIdAndDelete(req.params.id);
      if (!deletedUser) {
        Logging.warn(`User not found for deletion: ${req.params.id}`);
        return res.status(404).json({ message: 'User not found' });
      }
      Logging.warn(`User deleted: ${deletedUser.username}`);
      res.json({ message: 'User deleted successfully' });
    } catch (error) {
      Logging.error(`Error deleting user: ${error}`);
      res.status(500).json({ message: 'Error deleting user', error });
    }
  },

  // User login
  loginUser: async (req: Request, res: Response) => {
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
        Logging.warn(`Login failed: Incorrect password - ${user.username}`);
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      Logging.info(`User logged in: ${user.username}`);
      res.json({ message: 'Login successful', userId: user._id });
    } catch (error) {
      Logging.error(`Error during login: ${error}`);
      res.status(500).json({ message: 'Error during login', error });
    }
  }
};
