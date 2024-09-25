import { Request, Response } from 'express';
import Logging from '../utils/Logging';
import { getSuggestions, getWeatherByCoordinates } from '../services/weatherService';

export const weatherController = {
    async getWeatherForLocation(req: Request, res: Response) {
        const { latitude, longitude } = req.query;

        // Log incoming request
        Logging.info(`Received request with latitude: ${latitude}, longitude: ${longitude}`);

        // Validate latitude and longitude
        if (!latitude || !longitude) {
            Logging.warn('Latitude or longitude is missing');
            return res.status(400).json({ message: 'Latitude and longitude are required' });
        }

        const lat = Number(latitude);
        const lon = Number(longitude);

        // Validate latitude and longitude ranges
        if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
            Logging.warn('Invalid latitude or longitude values');
            return res.status(400).json({ message: 'Invalid latitude or longitude values' });
        }

        try {
            // Fetch weather data using the provided latitude and longitude
            const weatherData = await getWeatherByCoordinates(lat, lon);
            Logging.info('Weather data fetched successfully');
            res.status(200).json(weatherData);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
            Logging.error(`Error fetching weather data: ${errorMessage}`);
            res.status(500).json({ message: 'Error fetching weather data', error: errorMessage });
        }
    },

    async getLocationSuggestions(req: Request, res: Response) {
        const { search } = req.query;

        if (typeof search !== 'string' || !search) {
            Logging.warn('Search query is missing or not a string');
            return res.status(400).json({ message: 'Search query is required and must be a string' });
        }
        try {
            const suggest = await getSuggestions(search);
            Logging.info('Location suggestions fetched successfully');
            res.status(200).json(suggest);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
            Logging.error(`Error fetching location suggestions for query "${search}": ${errorMessage}`);
            res.status(500).json({ message: 'Error fetching location suggestions', error: errorMessage });
        }
    }
}