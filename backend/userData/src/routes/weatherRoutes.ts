import express from 'express';
import { weatherController } from '../controllers/weatherController';
import { asyncHandler } from '../middleware/errorHandler';

const router = express.Router();

router.get('/', asyncHandler(weatherController.getWeatherForLocation));
router.get('/suggestions', asyncHandler(weatherController.getLocationSuggestions)); 

export default router;