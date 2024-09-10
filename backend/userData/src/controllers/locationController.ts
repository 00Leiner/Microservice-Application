import { Request, Response } from 'express';
import Logging from '../utils/Logging';
import UserLocation, { ILocation, IUserLocation } from '../models/locationModel';
import mongoose from 'mongoose';

export const locationController = {
  // Get saved locations for a user
  async getSavedLocations(req: Request, res: Response) {
    const userId = req.params.userId;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const searchTerm = req.query.search as string | undefined;

    try {
      const userLocations = await UserLocation.findOne({ userId });
      if (!userLocations) {
        Logging.info(`No saved locations found for user: ${userId}`);
        return res.status(200).json({ savedLocations: [] });
      }

      let filteredLocations = userLocations.savedLocations;

      if (searchTerm) {
        filteredLocations = filteredLocations.filter(location => 
          location.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
        Logging.info(`Fetched and filtered saved locations for user: ${userId} with search term: ${searchTerm}`);
      } else {
        Logging.info(`Fetched all saved locations for user: ${userId}`);
      }

      res.status(200).json({ savedLocations: filteredLocations });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      Logging.error(`Error fetching saved locations: ${errorMessage}`);
      res.status(500).json({ message: 'Error fetching saved locations', error: errorMessage });
    }
  },

  // Add a saved location for a user
  async addSavedLocation(req: Request, res: Response) {
    const userId = req.params.userId;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const newLocation = req.body;
    try {
      const userLocations = await UserLocation.findOneAndUpdate(
        { userId },
        { $push: { savedLocations: newLocation } },
        { new: true, upsert: true }
      );
      Logging.info(`Added new saved location for user: ${userId}`);
      res.status(201).json({ savedLocations: userLocations.savedLocations });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      Logging.error(`Error adding saved location: ${errorMessage}`);
      res.status(500).json({ message: 'Error adding saved location', error: errorMessage });
    }
  },

  // Remove a saved location for a user
  async removeSavedLocation(req: Request, res: Response) {
    const userId = req.params.userId;
    let locationId = req.params.locationId;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    // Convert locationId to string if it's a valid ObjectId
    if (locationId.startsWith('new ObjectId(')) {
      locationId = locationId.slice(13, -2); // Remove 'new ObjectId(' and the closing ')'
    }

    try {
      const result = await UserLocation.findOneAndUpdate(
        { userId },
        { $pull: { savedLocations: { _id: locationId } } },
        { new: true }
      );
      if (!result) {
        Logging.warn(`No saved locations found for user: ${userId}`);
        return res.status(404).json({ message: 'User or location not found' });
      }
      Logging.info(`Removed saved location ${locationId} for user: ${userId}`);
      res.status(200).json({ savedLocations: result.savedLocations });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      Logging.error(`Error removing saved location: ${errorMessage}`);
      res.status(500).json({ message: 'Error removing saved location', error: errorMessage });
    }
  },

  // Get a specific saved location by ID for a user
  async getSavedLocationById(req: Request, res: Response) {
    const userId = req.params.userId;
    let locationId = req.params.locationId;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    // Convert locationId to string if it's a valid ObjectId
    if (locationId.startsWith('new ObjectId(')) {
      locationId = locationId.slice(13, -2); // Remove 'new ObjectId(' and the closing ')'
    }

    try {
      const userLocation = await UserLocation.findOne({ userId });
      if (!userLocation) {
        Logging.warn(`No saved locations found for user: ${userId}`);
        return res.status(404).json({ message: 'User not found' });
      }

      const location = userLocation.savedLocations.find(loc => loc._id?.toString() === locationId);

      if (!location) {
        Logging.warn(`Saved location ${locationId} not found for user: ${userId}`);
        return res.status(404).json({ message: 'Saved location not found' });
      }

      Logging.info(`Fetched saved location ${locationId} for user: ${userId}`);
      res.status(200).json({ savedLocation: location });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      Logging.error(`Error fetching saved location: ${errorMessage}`);
      res.status(500).json({ message: 'Error fetching saved location', error: errorMessage });
    }
  },

  // Update a saved location for a user
  async updateSavedLocation(req: Request, res: Response) {
    try {
      const userId = req.params.userId;
      let locationId = req.params.locationId;
      const { name, latitude, longitude } = req.body;

      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      // Extract the hexadecimal string from the ObjectId representation if necessary
      if (locationId.startsWith('new ObjectId(')) {
        locationId = locationId.slice(13, -2); // Remove 'new ObjectId(' and the closing ')'
      }

      const updateFields: Partial<ILocation> = {};
      if (name !== undefined) updateFields.name = name;
      if (latitude !== undefined) updateFields.latitude = latitude;
      if (longitude !== undefined) updateFields.longitude = longitude;

      const result = await UserLocation.findOneAndUpdate(
        { 
          userId, 
          'savedLocations._id': locationId
        },
        { 
          $set: Object.fromEntries(
            Object.entries(updateFields).map(([key, value]) => [`savedLocations.$.${key}`, value])
          )
        },
        { new: true, runValidators: true }
      );

      if (!result) {
        Logging.warn(`Saved location ${locationId} not found for user: ${userId}`);
        return res.status(404).json({ message: 'User or saved location not found' });
      }

      const updatedLocation = result.savedLocations.find(loc => 
        loc._id?.toString() === locationId
      );
      
      if (!updatedLocation) {
        Logging.warn(`Updated location ${locationId} not found in result for user: ${userId}`);
        return res.status(404).json({ message: 'Updated location not found in result' });
      }

      Logging.info(`Updated saved location ${locationId} for user: ${userId}`);
      res.json({ savedLocation: updatedLocation });
    } catch (error) {
      if (error instanceof mongoose.Error.ValidationError) {
        Logging.error(`Validation error updating saved location: ${error.message}`);
        return res.status(400).json({ message: 'Invalid input', error: error.message });
      } else if (error instanceof Error) {
        Logging.error(`Error updating saved location: ${error.message}`);
      } else {
        Logging.error(`Unknown error updating saved location`);
      }
      res.status(500).json({ message: 'Error updating saved location', error });
    }
  }
};
