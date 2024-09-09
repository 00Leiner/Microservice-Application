import mongoose, { Document, Schema } from 'mongoose';

// Define the interface for a single location
interface ILocation {
  _id?: string;
  name: string;
  latitude: number;
  longitude: number;
}

// Define the interface for the UserLocation document
export interface IUserLocation extends Document {
  userId: string;
  savedLocations: ILocation[];
}

// Create the schema for a single location
const locationSchema: Schema = new Schema<ILocation>(
  {
    _id: { type: String },
    name: { type: String, required: true },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
  },
  { timestamps: true }
);

// Create the schema for the UserLocation model
const userLocationSchema: Schema = new Schema<IUserLocation>({
  userId: { type: String, required: true, unique: true },
  savedLocations: [locationSchema],
});

export default mongoose.model<IUserLocation>('UserLocation', userLocationSchema);