import { Schema, model, Document } from 'mongoose';
import { userMiddleware } from '../middleware/userMiddleware';

export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  isVerified: boolean;
  oauthProvider?: string;
  oauthId?: string;
  profilePicture?: string;
}

const UserSchema = new Schema<IUser>({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  firstName: { type: String },
  lastName: { type: String },
  isVerified: { type: Boolean, default: false },
  oauthProvider: { type: String },
  oauthId: { type: String },
  profilePicture: { type: String },
}, { timestamps: true });

// Middleware
userMiddleware(UserSchema);

export const User = model<IUser>('User', UserSchema);
