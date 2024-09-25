import express from 'express';
import { locationController } from '../controllers/locationController';
import { validateLocationInput } from '../middleware/validateLocationInput';
import { asyncHandler } from '../middleware/errorHandler';
import { ensureUser } from '../middleware/userMiddleware';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

// middleware
router.use('/:userId', ensureUser);
router.get('/:userId', authMiddleware, asyncHandler(locationController.getSavedLocations));
router.get('/:userId/:locationId', authMiddleware, asyncHandler(locationController.getSavedLocationById));
router.post('/:userId/add', authMiddleware, validateLocationInput, asyncHandler(locationController.addSavedLocation));
router.put('/:userId/:locationId', authMiddleware, validateLocationInput, asyncHandler(locationController.updateSavedLocation));
router.delete('/:userId/:locationId', authMiddleware, asyncHandler(locationController.removeSavedLocation));

export default router;