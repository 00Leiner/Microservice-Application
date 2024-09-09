import { Request, Response } from 'express';
import Logging from '../utils/Logging';
import UserLocation from '../models/locationModel';

// Extend the Request interface to include the user property
interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
  };
}

export const locationController = {
  // Get saved locations for a user
  async getSavedLocations(req: AuthenticatedRequest, res: Response) {
    const userId = req.user?.id;
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
  async addSavedLocation(req: AuthenticatedRequest, res: Response) {
    const userId = req.user?.id;
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
  async removeSavedLocation(req: AuthenticatedRequest, res: Response) {
    const userId = req.user?.id;
    const locationId = req.params.locationId;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
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
  async getSavedLocationById(req: AuthenticatedRequest, res: Response) {
    const userId = req.user?.id;
    const locationId = req.params.locationId;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
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
  async updateSavedLocation(req: AuthenticatedRequest, res: Response) {
    const userId = req.user?.id;
    const locationId = req.params.locationId;
    const updatedLocation = req.body;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
      const result = await UserLocation.findOneAndUpdate(
        { userId, 'savedLocations._id': locationId },
        { $set: { 'savedLocations.$': updatedLocation } },
        { new: true }
      );

      if (!result) {
        Logging.warn(`Saved location ${locationId} not found for user: ${userId}`);
        return res.status(404).json({ message: 'User or saved location not found' });
      }

      const updatedLocationInResult = result.savedLocations.find(loc => loc._id?.toString() === locationId);
      
      if (!updatedLocationInResult) {
        Logging.warn(`Updated location ${locationId} not found in result for user: ${userId}`);
        return res.status(404).json({ message: 'Updated location not found in result' });
      }

      Logging.info(`Updated saved location ${locationId} for user: ${userId}`);
      res.status(200).json({ savedLocation: updatedLocationInResult });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      Logging.error(`Error updating saved location: ${errorMessage}`);
      res.status(500).json({ message: 'Error updating saved location', error: errorMessage });
    }
  }
};
