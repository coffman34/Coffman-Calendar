/**
 * @fileoverview Weather Controller with server-side caching
 * @module controllers/weatherController
 * 
 * EDUCATIONAL NOTES FOR JUNIOR DEVELOPERS:
 * 
 * WHY SERVER-SIDE CACHING?
 * The kiosk frontend may re-mount components frequently during navigation.
 * If we hit the Open-Meteo API every time, we risk rate-limiting.
 * By caching on the server for 15 minutes, we:
 * 1. Reduce external API calls
 * 2. Improve response times
 * 3. Save CPU/battery on the kiosk device
 * 
 * DESIGN PATTERN: Simple In-Memory Cache
 * We use a plain object with timestamp. For a production app with
 * multiple instances, you'd use Redis. For a single-kiosk app, this works.
 */

// ============================================================================
// IN-MEMORY CACHE
// ============================================================================
/**
 * JUNIOR DEV NOTE: Why not use a library like node-cache?
 * For a simple use case with one cache key, a plain object is lighter.
 * We'd use a library if we needed TTL management for multiple keys.
 */
let weatherCache = {
    data: null,
    timestamp: null,
    location: null // Store which location this cache is for
};

const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes in ms

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Check if cached data is still valid
 * 
 * @param {number} lat - Latitude to check
 * @param {number} lon - Longitude to check
 * @returns {boolean} - True if cache is valid and matches location
 * 
 * JUNIOR DEV NOTE: Why check location too?
 * If the user changes their home location in settings, we don't want
 * to serve cached weather for the old location.
 */
const isCacheValid = (lat, lon) => {
    if (!weatherCache.data || !weatherCache.timestamp) return false;

    const now = Date.now();
    const cacheAge = now - weatherCache.timestamp;

    // 1. Check if cache has expired
    if (cacheAge > CACHE_DURATION) return false;

    // 2. Check if location matches (with small tolerance for floating point)
    const locMatch = weatherCache.location &&
        Math.abs(weatherCache.location.lat - lat) < 0.01 &&
        Math.abs(weatherCache.location.lon - lon) < 0.01;

    return locMatch;
};

/**
 * Build Open-Meteo API URL
 * 
 * JUNIOR DEV NOTE: Why build URL on server?
 * We can add/remove parameters without updating the frontend.
 * Also allows for future API key injection if we switch providers.
 */
const buildOpenMeteoUrl = (lat, lon) => {
    const baseUrl = 'https://api.open-meteo.com/v1/forecast';
    const params = new URLSearchParams({
        latitude: lat,
        longitude: lon,
        current_weather: 'true',
        // Daily forecast for 3 days
        daily: 'temperature_2m_max,temperature_2m_min,weather_code',
        // Hourly forecast for the scrollable widget
        hourly: 'temperature_2m,weather_code',
        temperature_unit: 'fahrenheit',
        windspeed_unit: 'mph',
        timezone: 'auto',
        forecast_days: '7' // 7 days covers full week view
    });

    return `${baseUrl}?${params.toString()}`;
};

// ============================================================================
// CONTROLLER FUNCTIONS
// ============================================================================

/**
 * GET /api/weather
 * 
 * Fetches weather data from Open-Meteo API with caching
 * 
 * Query Parameters:
 * - lat: Latitude (required)
 * - lon: Longitude (required)
 * 
 * Returns:
 * - current_weather: { temperature, weathercode, windspeed, time }
 * - daily: { time[], temperature_2m_max[], temperature_2m_min[], weather_code[] }
 * - cached: boolean - Whether this response came from cache
 * - lastUpdated: ISO timestamp of when data was fetched
 */
export const getWeather = async (req, res, next) => {
    try {
        // 1. Extract and validate coordinates
        const lat = parseFloat(req.query.lat);
        const lon = parseFloat(req.query.lon);

        if (isNaN(lat) || isNaN(lon)) {
            return res.status(400).json({
                error: 'Invalid coordinates',
                message: 'Please provide valid lat and lon query parameters'
            });
        }

        // 2. Check cache first (Performance Optimization)
        if (isCacheValid(lat, lon)) {
            console.log('[Weather] Serving from cache');
            return res.json({
                ...weatherCache.data,
                cached: true,
                lastUpdated: new Date(weatherCache.timestamp).toISOString()
            });
        }

        // 3. Fetch fresh data from Open-Meteo
        console.log('[Weather] Fetching fresh data from Open-Meteo');
        const url = buildOpenMeteoUrl(lat, lon);
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Open-Meteo API error: ${response.status}`);
        }

        const data = await response.json();

        // 4. Update cache with new data
        weatherCache = {
            data: data,
            timestamp: Date.now(),
            location: { lat, lon }
        };

        // 5. Return fresh data with metadata
        return res.json({
            ...data,
            cached: false,
            lastUpdated: new Date().toISOString()
        });

    } catch (error) {
        // DEFENSIVE UX: Log error but provide helpful message
        console.error('[Weather] Error fetching weather:', error.message);

        // If cache exists but is stale, return it anyway (Graceful Degradation)
        if (weatherCache.data) {
            console.log('[Weather] Returning stale cache due to API error');
            return res.json({
                ...weatherCache.data,
                cached: true,
                stale: true,
                lastUpdated: new Date(weatherCache.timestamp).toISOString(),
                error: 'Using cached data due to API error'
            });
        }

        // No cache available, pass to error handler
        next(error);
    }
};
