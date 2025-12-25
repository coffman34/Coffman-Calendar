/**
 * @fileoverview Weather Service for fetching weather data
 * @module services/weatherService
 * 
 * EDUCATIONAL NOTES FOR JUNIOR DEVELOPERS:
 * 
 * DESIGN PATTERN: Service Layer
 * This file handles all weather-related API logic. By separating this
 * from the component, we:
 * 1. Keep components focused on rendering
 * 2. Make API logic testable in isolation
 * 3. Allow easy swapping of weather providers
 * 
 * KIOSK-SPECIFIC CONSIDERATIONS:
 * On a locked-down Ubuntu Frame kiosk, navigator.geolocation can
 * trigger permission popups that are hard to interact with.
 * We prioritize stored "home location" over browser geolocation.
 */

import { WEATHER_CONFIG, STORAGE_KEYS } from '../utils/constants.js';

// ============================================================================
// STORAGE KEY FOR HOME LOCATION
// ============================================================================
const HOME_LOCATION_KEY = 'coffman_calendar_home_location';

// ============================================================================
// LOCATION FUNCTIONS
// ============================================================================

/**
 * Get saved home location from localStorage
 * 
 * @returns {object|null} - { lat, lon, name } or null if not set
 * 
 * JUNIOR DEV NOTE: Why check localStorage first?
 * For a kiosk, the location rarely changes. Saving it avoids
 * geolocation popups and ensures consistent weather display.
 */
export const getSavedLocation = () => {
    try {
        const saved = localStorage.getItem(HOME_LOCATION_KEY);
        if (saved) {
            return JSON.parse(saved);
        }
    } catch (error) {
        console.error('[WeatherService] Error reading saved location:', error);
    }
    return null;
};

/**
 * Save home location to localStorage
 * 
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @param {string} name - Location name (for display)
 */
export const saveHomeLocation = (lat, lon, name = 'Home') => {
    try {
        localStorage.setItem(HOME_LOCATION_KEY, JSON.stringify({ lat, lon, name }));
    } catch (error) {
        console.error('[WeatherService] Error saving location:', error);
    }
};

/**
 * Reverse geocode coordinates to get city name
 * 
 * Uses BigDataCloud's free reverse geocoding API (no key required)
 * 
 * JUNIOR DEV NOTE: Why BigDataCloud?
 * It's free for non-commercial use, fast, and doesn't require an API key.
 * Perfect for kiosk applications.
 * 
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @returns {Promise<string>} - City name or coordinates as fallback
 */
const reverseGeocode = async (lat, lon) => {
    try {
        const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`;

        const response = await fetch(url);
        if (!response.ok) throw new Error('Geocode API error');

        const data = await response.json();

        // Use city, locality, or principal subdivision
        const cityName = data.city || data.locality || data.principalSubdivision || null;

        if (cityName) {
            // Add state abbreviation if available (for US locations)
            const state = data.principalSubdivisionCode?.replace('US-', '') || '';
            return state ? `${cityName}, ${state}` : cityName;
        }

        // Fallback to coordinates display
        return `${lat.toFixed(2)}°, ${lon.toFixed(2)}°`;

    } catch (error) {
        console.error('[WeatherService] Reverse geocode error:', error);
        // Use default location name if near it, otherwise show coords
        if (Math.abs(lat - WEATHER_CONFIG.DEFAULT_LOCATION.lat) < 0.5 &&
            Math.abs(lon - WEATHER_CONFIG.DEFAULT_LOCATION.lon) < 0.5) {
            return WEATHER_CONFIG.DEFAULT_LOCATION.name;
        }
        return `${lat.toFixed(2)}°, ${lon.toFixed(2)}°`;
    }
};

/**
 * Get current location with defensive fallback chain
 * 
 * ORDER OF PRIORITY:
 * 1. Saved home location (best for kiosk)
 * 2. Browser geolocation (if available)
 * 3. Default config location (Danville, IL)
 * 
 * @returns {Promise<{lat: number, lon: number, name: string}>}
 * 
 * JUNIOR DEV NOTE: Why async even though localStorage is sync?
 * navigator.geolocation is async. By making this function async,
 * the component always uses the same pattern regardless of source.
 */
export const getCurrentLocation = async () => {
    // 1. Check for saved home location FIRST (kiosk-friendly)
    const saved = getSavedLocation();
    if (saved) {
        console.log('[WeatherService] Using saved home location:', saved.name);
        return saved;
    }

    // 2. Try browser geolocation (with timeout)
    try {
        const position = await new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('Geolocation not supported'));
                return;
            }

            navigator.geolocation.getCurrentPosition(
                resolve,
                reject,
                {
                    timeout: 5000, // 5 second timeout
                    maximumAge: 300000, // Accept cached position up to 5 mins old
                    enableHighAccuracy: false // We don't need GPS precision
                }
            );
        });

        const lat = position.coords.latitude;
        const lon = position.coords.longitude;

        // Get city name from coordinates
        const cityName = await reverseGeocode(lat, lon);

        const location = {
            lat,
            lon,
            name: cityName
        };

        console.log('[WeatherService] Got browser geolocation:', location);

        // Save this for future use so we don't need geolocation again
        saveHomeLocation(lat, lon, cityName);

        return location;

    } catch (error) {
        // Geolocation failed or denied - this is expected on kiosk
        console.log('[WeatherService] Geolocation unavailable, using default:', error.message);
    }

    // 3. Fall back to default location from config
    return WEATHER_CONFIG.DEFAULT_LOCATION;
};

// ============================================================================
// WEATHER API FUNCTIONS
// ============================================================================

/**
 * Fetch weather data from backend proxy
 * 
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @returns {Promise<object>} - Weather data
 * 
 * JUNIOR DEV NOTE: Why use backend proxy?
 * 1. Server-side caching reduces API calls
 * 2. Consistent error handling
 * 3. Future-proofs for API keys if needed
 */
export const fetchWeather = async (lat, lon) => {
    // DEFENSIVE UX: Use relative URL for proxy
    // This ensures it works both in dev (Vite proxy) and prod (Nginx proxy)
    const url = `/api/weather?lat=${lat}&lon=${lon}`;

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`Weather API error: ${response.status}`);
    }

    return response.json();
};

/**
 * Main weather fetch function with location resolution
 * 
 * This is the primary function components should use.
 * It handles location detection and API fetching in one call.
 * 
 * @returns {Promise<{weather: object, location: object}>}
 */
export const getWeatherWithLocation = async () => {
    // 1. Get location (with fallback chain)
    const location = await getCurrentLocation();

    // 2. Fetch weather for that location
    const weather = await fetchWeather(location.lat, location.lon);

    return {
        weather,
        location
    };
};
