/**
 * @fileoverview Weather API routes
 * @module routes/weatherRoutes
 * 
 * EDUCATIONAL NOTES FOR JUNIOR DEVELOPERS:
 * 
 * WHY A SEPARATE ROUTE FILE?
 * This follows the MVC pattern where routes are defined separately
 * from controllers. It makes the code more modular and testable.
 * 
 * ROUTE STRUCTURE:
 * GET /api/weather?lat=X&lon=Y - Get current weather and 3-day forecast
 */

import express from 'express';
import * as weatherController from '../controllers/weatherController.js';

const router = express.Router();

// ============================================================================
// ROUTES
// ============================================================================

/**
 * GET /api/weather
 * 
 * Proxies weather data from Open-Meteo API with server-side caching.
 * 
 * Query Parameters:
 * - lat (required): Latitude
 * - lon (required): Longitude
 * 
 * JUNIOR DEV NOTE: Why proxy instead of calling Open-Meteo directly?
 * 1. Server-side caching reduces API calls
 * 2. Future-proofs for API keys if we switch providers
 * 3. Consistent error handling via our error middleware
 */
router.get('/', weatherController.getWeather);

export default router;
