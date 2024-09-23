import express from 'express';
import { locationController } from '../controllers/locationController';
import { validateLocationInput } from '../middleware/validateLocationInput';
import { asyncHandler } from '../middleware/errorHandler';
import { ensureUser } from '../middleware/userMiddleware';

const router = express.Router();

// middleware
router.use('/:userId', ensureUser);
router.get('/:userId', asyncHandler(locationController.getSavedLocations));
router.get('/:userId/:locationId', asyncHandler(locationController.getSavedLocationById));
router.post('/:userId/add', validateLocationInput, asyncHandler(locationController.addSavedLocation));
router.put('/:userId/:locationId', validateLocationInput, asyncHandler(locationController.updateSavedLocation));
router.delete('/:userId/:locationId', asyncHandler(locationController.removeSavedLocation));

export default router;