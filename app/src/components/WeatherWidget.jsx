/**
 * @fileoverview Real-time Weather Widget - iOS Style Layout
 * @module components/WeatherWidget
 * 
 * EDUCATIONAL NOTES FOR JUNIOR DEVELOPERS:
 * 
 * DESIGN REFERENCE:
 * This widget mimics the iOS Weather app layout showing:
 * - Location name
 * - Current temperature (large)
 * - Weather condition text
 * - Hourly forecast strip (5 hours)
 * 
 * LAYOUT STRUCTURE:
 * ┌─────────────────────────────────────────────┐
 * │ Location Name              Condition Text   │
 * │ 47°F                                        │
 * │ ┌──────┬──────┬──────┬──────┬──────┐       │
 * │ │ Now  │ 5PM  │ 6PM  │ 7PM  │ 8PM  │       │
 * │ │ ☀️   │ ☀️   │ ☁️   │ ☁️   │ 🌙   │       │
 * │ │ 47°  │ 44°  │ 41°  │ 37°  │ 35°  │       │
 * │ └──────┴──────┴──────┴──────┴──────┘       │
 * └─────────────────────────────────────────────┘
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Box, Typography, Skeleton, IconButton, Tooltip, Paper } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import { getWeatherWithLocation } from '../services/weatherService';
import { getWeatherIcon, getWeatherDescription, formatTemperature } from '../utils/weatherUtils.jsx';
import { WEATHER_CONFIG, UI_CONFIG } from '../utils/constants';

// ============================================================================
// CUSTOM HOOK: useWeather
// ============================================================================
/**
 * Custom hook for weather data fetching with auto-refresh
 */
const useWeather = () => {
    const [weather, setWeather] = useState(null);
    const [location, setLocation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [lastUpdated, setLastUpdated] = useState(null);
    const isMountedRef = useRef(true);

    // JUNIOR DEV NOTE: We use a ref to track if we have existing weather data
    // This avoids putting `weather` in the useCallback deps which would cause
    // an infinite loop: fetchWeatherData changes -> useEffect runs -> fetches -> 
    // setWeather -> fetchWeatherData changes again (loop!)
    const hasWeatherRef = useRef(false);

    const fetchWeatherData = useCallback(async (showLoading = true) => {
        if (showLoading) setLoading(true);
        setError(null);

        try {
            const result = await getWeatherWithLocation();
            if (!isMountedRef.current) return;

            setWeather(result.weather);
            setLocation(result.location);
            setLastUpdated(new Date());
            setLoading(false);
            hasWeatherRef.current = true;
        } catch (err) {
            console.error('[WeatherWidget] Fetch error:', err);
            if (!isMountedRef.current) return;
            // Only show error if we don't have fallback data
            if (!hasWeatherRef.current) setError(err.message);
            setLoading(false);
        }
    }, []); // No deps - stable reference

    useEffect(() => {
        isMountedRef.current = true;
        fetchWeatherData();

        const intervalId = setInterval(() => {
            fetchWeatherData(false);
        }, WEATHER_CONFIG.REFRESH_INTERVAL);

        return () => {
            isMountedRef.current = false;
            clearInterval(intervalId);
        };
    }, [fetchWeatherData]);

    return { weather, location, loading, error, lastUpdated, refetch: () => fetchWeatherData(true) };
};

// ============================================================================
// HELPER: Get upcoming hours from hourly data
// ============================================================================
/**
 * Extract the next N hours from Open-Meteo hourly data
 * 
 * JUNIOR DEV NOTE: Why do we need this?
 * Open-Meteo returns hourly data for the entire forecast period.
 * We only want to show the next 5 hours starting from "now".
 */
const getUpcomingHours = (hourlyData, count = 5) => {
    if (!hourlyData?.time || !hourlyData?.temperature_2m) return [];

    const now = new Date();
    const currentHour = now.getHours();

    // Find the index of the current hour in today's data
    const todayStr = now.toISOString().split('T')[0];

    const hours = [];
    for (let i = 0; i < hourlyData.time.length && hours.length < count; i++) {
        const hourTime = new Date(hourlyData.time[i]);

        // Only include hours from now onwards
        if (hourTime >= now || (hourTime.getHours() === currentHour && hourTime.toDateString() === now.toDateString())) {
            hours.push({
                time: hourTime,
                temp: hourlyData.temperature_2m[i],
                code: hourlyData.weather_code[i],
                isNow: hours.length === 0
            });
        }
    }

    return hours;
};

// ============================================================================
// LOADING SKELETON
// ============================================================================
const WeatherSkeleton = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, minWidth: 280 }}>
        <Skeleton variant="text" width={100} height={20} />
        <Skeleton variant="text" width={80} height={48} />
        <Box sx={{ display: 'flex', gap: 1 }}>
            {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} variant="rectangular" width={50} height={60} sx={{ borderRadius: 1 }} />
            ))}
        </Box>
    </Box>
);

// ============================================================================
// HOURLY FORECAST ITEM
// ============================================================================
const HourlyItem = ({ hour }) => {
    const timeStr = hour.isNow ? 'Now' : hour.time.toLocaleTimeString([], { hour: 'numeric' });

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                minWidth: 48,
                py: 0.5,
            }}
        >
            {/* Time label */}
            <Typography variant="caption" sx={{ fontWeight: hour.isNow ? 600 : 400, fontSize: '0.7rem' }}>
                {timeStr}
            </Typography>

            {/* Weather icon */}
            <Box sx={{ my: 0.5 }}>
                {getWeatherIcon(hour.code, { sx: { fontSize: 20 } })}
            </Box>

            {/* Temperature */}
            <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.8rem' }}>
                {Math.round(hour.temp)}°
            </Typography>
        </Box>
    );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================
const WeatherWidget = () => {
    const { weather, location, loading, error, lastUpdated, refetch } = useWeather();

    // Loading state
    if (loading && !weather) {
        return <WeatherSkeleton />;
    }

    // Error state
    if (error && !weather) {
        return (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2" color="error">Weather unavailable</Typography>
                <IconButton size="small" onClick={refetch}><RefreshIcon fontSize="small" /></IconButton>
            </Box>
        );
    }

    const currentWeather = weather?.current_weather;
    const hourlyForecast = getUpcomingHours(weather?.hourly, 5);
    const isStale = weather?.stale;
    const condition = getWeatherDescription(currentWeather?.weathercode);

    return (
        <Tooltip title={isStale ? '⚠️ Using cached data - Click to refresh' : 'Click to refresh'}>
            <Paper
                elevation={0}
                onClick={refetch}
                sx={{
                    cursor: 'pointer',
                    bgcolor: 'rgba(100, 150, 200, 0.15)',
                    borderRadius: 2,
                    px: 2,
                    py: 1,
                    minWidth: 280,
                    opacity: isStale ? 0.8 : 1,
                    transition: 'all 0.2s ease',
                    '&:hover': {
                        bgcolor: 'rgba(100, 150, 200, 0.25)',
                    }
                }}
            >
                {/* Top row: Location + Condition */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.85rem' }}>
                        {location?.name || 'Weather'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                        {condition}
                    </Typography>
                </Box>

                {/* Current temperature - large */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    {getWeatherIcon(currentWeather?.weathercode, { sx: { fontSize: 32 } })}
                    <Typography variant="h4" sx={{ fontWeight: 300, lineHeight: 1 }}>
                        {formatTemperature(currentWeather?.temperature)}
                    </Typography>
                </Box>

                {/* Hourly forecast strip */}
                {hourlyForecast.length > 0 && (
                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            borderTop: '1px solid rgba(255,255,255,0.1)',
                            pt: 1,
                        }}
                    >
                        {hourlyForecast.map((hour, idx) => (
                            <HourlyItem key={idx} hour={hour} />
                        ))}
                    </Box>
                )}
            </Paper>
        </Tooltip>
    );
};

export default WeatherWidget;
