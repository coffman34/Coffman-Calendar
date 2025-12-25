/**
 * @fileoverview Weather Section for Calendar Day Column
 * @module calendar/WeatherSection
 * 
 * EDUCATIONAL NOTES FOR JUNIOR DEVELOPERS:
 * 
 * WHAT THIS COMPONENT DOES:
 * Displays the daily weather forecast for a specific day in the calendar.
 * Shown at the bottom of each day column, mirroring how MealSection
 * shows meals at the top.
 * 
 * DATA SOURCE:
 * Uses the shared weather data from the Open-Meteo API (via weatherService).
 * The daily forecast data includes high/low temps and weather code.
 */

import React, { useState, useEffect } from 'react';
import { Box, Typography, Skeleton } from '@mui/material';
import ThermostatIcon from '@mui/icons-material/Thermostat';
import { getWeatherIcon, formatTemperature } from '../../utils/weatherUtils.jsx';
import { fetchWeather, getSavedLocation } from '../../services/weatherService';
import { WEATHER_CONFIG } from '../../utils/constants';

// ============================================================================
// SHARED WEATHER CACHE
// ============================================================================
/**
 * JUNIOR DEV NOTE: Why a module-level cache?
 * Multiple WeatherSection components (one per day) would each fetch weather.
 * By caching at module level, we share one fetch across all 7 day columns.
 * This is simpler than React Context for this use case.
 */
let weatherCache = {
    data: null,
    timestamp: null
};

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes (shorter than backend cache)

// ============================================================================
// HELPER: Get daily forecast for a specific date
// ============================================================================
const getDailyForecast = (dailyData, targetDate) => {
    if (!dailyData?.time) return null;

    // Format target date to match API format (YYYY-MM-DD)
    const dateStr = typeof targetDate === 'string'
        ? targetDate
        : targetDate.toISOString().split('T')[0];

    // Find index for this date
    const idx = dailyData.time.findIndex(t => t === dateStr);
    if (idx === -1) return null;

    return {
        high: dailyData.temperature_2m_max?.[idx],
        low: dailyData.temperature_2m_min?.[idx],
        code: dailyData.weather_code?.[idx]
    };
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================
const WeatherSection = ({ day }) => {
    const [forecast, setForecast] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;

        const loadWeather = async () => {
            try {
                // Check cache first
                const now = Date.now();
                if (weatherCache.data && (now - weatherCache.timestamp) < CACHE_DURATION) {
                    const daily = getDailyForecast(weatherCache.data.daily, day);
                    if (mounted) {
                        setForecast(daily);
                        setLoading(false);
                    }
                    return;
                }

                // Get location
                const saved = getSavedLocation();
                const loc = saved || WEATHER_CONFIG.DEFAULT_LOCATION;

                // Fetch fresh data
                const weather = await fetchWeather(loc.lat, loc.lon);

                // Update cache
                weatherCache = { data: weather, timestamp: Date.now() };

                // Get forecast for this day
                const daily = getDailyForecast(weather.daily, day);
                if (mounted) {
                    setForecast(daily);
                    setLoading(false);
                }
            } catch (error) {
                console.error('[WeatherSection] Error:', error);
                if (mounted) setLoading(false);
            }
        };

        loadWeather();

        return () => { mounted = false; };
    }, [day]);

    // Loading state
    if (loading) {
        return (
            <Box sx={{ p: 1, borderTop: '1px solid #eee', bgcolor: 'rgba(100,150,200,0.05)' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Skeleton variant="circular" width={16} height={16} />
                    <Skeleton variant="text" width={60} height={20} />
                </Box>
            </Box>
        );
    }

    // No forecast available
    if (!forecast) {
        return (
            <Box sx={{ p: 1, borderTop: '1px solid #eee', bgcolor: 'rgba(100,150,200,0.03)' }}>
                <Typography variant="caption" color="text.disabled">
                    No forecast
                </Typography>
            </Box>
        );
    }

    return (
        <Box sx={{
            p: 1,
            borderTop: '1px solid #eee',
            bgcolor: 'rgba(100,150,200,0.05)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
        }}>
            {/* Weather icon */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                {getWeatherIcon(forecast.code, { sx: { fontSize: 20 } })}
            </Box>

            {/* High / Low temps */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <ThermostatIcon sx={{ fontSize: 14, color: 'error.light' }} />
                <Typography variant="caption" sx={{ fontWeight: 600, color: 'error.main' }}>
                    {Math.round(forecast.high)}°
                </Typography>
                <Typography variant="caption" color="text.secondary">
                    /
                </Typography>
                <Typography variant="caption" sx={{ color: 'info.main' }}>
                    {Math.round(forecast.low)}°
                </Typography>
            </Box>
        </Box>
    );
};

export default WeatherSection;
