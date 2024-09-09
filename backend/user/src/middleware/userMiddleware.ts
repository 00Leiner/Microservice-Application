import { Schema, Query } from 'mongoose';
import * as argon2 from 'argon2';
import Logging from '../utils/Logging';
import { IUser } from '../models/userModel'; // Make sure to import IUser

export const userMiddleware = (schema: Schema<IUser>) => {
  // Hash the password before saving
  schema.pre<IUser>('save', async function(next) {
    if (this.isModified('password')) {
      try {
        this.password = await argon2.hash(this.password);
        Logging.info(`Password hashed successfully for user: ${this.username}`);
      } catch (error) {
        Logging.error(`Error hashing password for user: ${this.username}`);
        throw error;
      }
    }
    next();
  });

  // Add pre-hook for update operations
  schema.pre('findOneAndUpdate', async function(this: Query<any, IUser>) {
    const update = this.getUpdate() as { $set?: { password?: string } };
    
    if (update.$set && update.$set.password) {
      try {
        update.$set.password = await argon2.hash(update.$set.password);
        Logging.info('Password hashed successfully for user update');
      } catch (error) {
        Logging.error('Error hashing password for user update');
        throw error;
      }
    }
  });
};
