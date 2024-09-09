import express from 'express';
import { locationController } from '../controllers/locationController';
import { validateLocationInput } from '../middleware/validateLocationInput';
import { asyncHandler } from '../middleware/errorHandler';

const router = express.Router();

// GET saved locations for a user
router.get('/', asyncHandler(locationController.getSavedLocations));

// GET a specific saved location by ID for a user
router.get('/:locationId', asyncHandler(locationController.getSavedLocationById));

// POST a new saved location
router.post('/', validateLocationInput, asyncHandler(locationController.addSavedLocation));

// PUT update a saved location
router.put('/:locationId', validateLocationInput, asyncHandler(locationController.updateSavedLocation));

// DELETE a saved location
router.delete('/:locationId', asyncHandler(locationController.removeSavedLocation));

export default router;
