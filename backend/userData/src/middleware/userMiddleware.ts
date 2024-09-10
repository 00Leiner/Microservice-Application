import { Request, Response, NextFunction } from 'express';
import UserLocation from '../models/locationModel';
import Logging from '../utils/Logging';

export const ensureUser = async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.params.userId;
  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized: User ID is required' });
  }

  try {
    let userLocations = await UserLocation.findOne({ userId });
    if (!userLocations) {
      userLocations = await UserLocation.create({ userId, savedLocations: [] });
      Logging.info(`Created new user with ID: ${userId}`);
    }

    // Attach the user to the request object for use in subsequent middleware or route handlers
    (req as any).userLocations = userLocations;
    
    next();
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    Logging.error(`Error ensuring user: ${errorMessage}`);
    res.status(500).json({ message: 'Error processing user', error: errorMessage });
  }
};
