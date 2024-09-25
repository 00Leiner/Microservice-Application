import express from 'express';
import { weatherController } from '../controllers/weatherController';
import { asyncHandler } from '../middleware/errorHandler';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

router.get('/', authMiddleware, asyncHandler(weatherController.getWeatherForLocation));
router.get('/suggestions', asyncHandler(weatherController.getLocationSuggestions)); 

export default router;