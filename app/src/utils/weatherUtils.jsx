/**
 * @fileoverview WMO Weather Code to Material UI Icon Mapping
 * @module utils/weatherUtils
 * 
 * EDUCATIONAL NOTES FOR JUNIOR DEVELOPERS:
 * 
 * WHAT ARE WMO CODES?
 * The World Meteorological Organization (WMO) defines standard numeric codes
 * for weather conditions. Open-Meteo uses these codes because they're:
 * 1. Internationally standardized
 * 2. Language-agnostic (no need to parse strings like "Partly Cloudy")
 * 3. Machine-readable and consistent
 * 
 * WMO CODE RANGES (simplified):
 * 0      = Clear sky
 * 1-3    = Mainly clear, partly cloudy, overcast
 * 45-48  = Fog and depositing rime fog
 * 51-55  = Drizzle (light, moderate, dense)
 * 56-57  = Freezing drizzle
 * 61-65  = Rain (slight, moderate, heavy)
 * 66-67  = Freezing rain
 * 71-77  = Snow (slight, moderate, heavy, snow grains)
 * 80-82  = Rain showers
 * 85-86  = Snow showers
 * 95     = Thunderstorm
 * 96-99  = Thunderstorm with hail
 * 
 * DESIGN PATTERN: Lookup Table
 * Instead of a long if-else chain, we use range-based lookups for
 * better performance and readability.
 */

import WbSunnyIcon from '@mui/icons-material/WbSunny';
import CloudIcon from '@mui/icons-material/Cloud';
import CloudQueueIcon from '@mui/icons-material/CloudQueue';
import GrainIcon from '@mui/icons-material/Grain';
import UmbrellaIcon from '@mui/icons-material/Umbrella';
import AcUnitIcon from '@mui/icons-material/AcUnit';
import ThunderstormIcon from '@mui/icons-material/Thunderstorm';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import React from 'react';

// ============================================================================
// WEATHER ICON MAPPING
// ============================================================================

/**
 * Map WMO weather code to Material UI icon component
 * 
 * @param {number} code - WMO weather code from Open-Meteo API
 * @param {object} props - Optional props to pass to the icon (sx, color, etc.)
 * @returns {React.Element} - Material UI icon component
 * 
 * JUNIOR DEV NOTE: Why return components instead of icon names?
 * This allows the component to render immediately without needing
 * to do another lookup. It's a "render prop" pattern variant.
 */
export const getWeatherIcon = (code, props = {}) => {
    // Default props for consistent sizing
    const iconProps = {
        sx: { fontSize: 32 },
        ...props
    };

    // DEFENSIVE UX: Handle null/undefined gracefully
    if (code === null || code === undefined) {
        return <CloudIcon {...iconProps} />;
    }

    // 1. Clear sky
    if (code === 0) {
        return <WbSunnyIcon {...iconProps} sx={{ ...iconProps.sx, color: '#FFC107' }} />;
    }

    // 2. Partly cloudy / overcast
    if (code >= 1 && code <= 3) {
        return <CloudQueueIcon {...iconProps} sx={{ ...iconProps.sx, color: '#90A4AE' }} />;
    }

    // 3. Fog
    if (code >= 45 && code <= 48) {
        return <CloudIcon {...iconProps} sx={{ ...iconProps.sx, color: '#B0BEC5' }} />;
    }

    // 4. Drizzle (including freezing)
    if (code >= 51 && code <= 57) {
        return <GrainIcon {...iconProps} sx={{ ...iconProps.sx, color: '#64B5F6' }} />;
    }

    // 5. Rain (including freezing)
    if (code >= 61 && code <= 67) {
        return <UmbrellaIcon {...iconProps} sx={{ ...iconProps.sx, color: '#42A5F5' }} />;
    }

    // 6. Snow
    if (code >= 71 && code <= 77) {
        return <AcUnitIcon {...iconProps} sx={{ ...iconProps.sx, color: '#E3F2FD' }} />;
    }

    // 7. Rain showers
    if (code >= 80 && code <= 82) {
        return <WaterDropIcon {...iconProps} sx={{ ...iconProps.sx, color: '#29B6F6' }} />;
    }

    // 8. Snow showers
    if (code >= 85 && code <= 86) {
        return <AcUnitIcon {...iconProps} sx={{ ...iconProps.sx, color: '#B3E5FC' }} />;
    }

    // 9. Thunderstorm
    if (code >= 95 && code <= 99) {
        return <ThunderstormIcon {...iconProps} sx={{ ...iconProps.sx, color: '#5C6BC0' }} />;
    }

    // DEFENSIVE UX: Default fallback for unknown codes
    // Open-Meteo may add new codes in the future
    console.warn(`[WeatherUtils] Unknown WMO code: ${code}, using default icon`);
    return <CloudIcon {...iconProps} />;
};

/**
 * Get human-readable weather description from WMO code
 * 
 * @param {number} code - WMO weather code
 * @returns {string} - Weather description
 */
export const getWeatherDescription = (code) => {
    if (code === null || code === undefined) return 'Unknown';

    if (code === 0) return 'Clear';
    if (code === 1) return 'Mainly Clear';
    if (code === 2) return 'Partly Cloudy';
    if (code === 3) return 'Overcast';
    if (code >= 45 && code <= 48) return 'Foggy';
    if (code >= 51 && code <= 55) return 'Drizzle';
    if (code >= 56 && code <= 57) return 'Freezing Drizzle';
    if (code >= 61 && code <= 63) return 'Rain';
    if (code >= 64 && code <= 65) return 'Heavy Rain';
    if (code >= 66 && code <= 67) return 'Freezing Rain';
    if (code >= 71 && code <= 75) return 'Snow';
    if (code >= 76 && code <= 77) return 'Snow Grains';
    if (code >= 80 && code <= 82) return 'Rain Showers';
    if (code >= 85 && code <= 86) return 'Snow Showers';
    if (code === 95) return 'Thunderstorm';
    if (code >= 96 && code <= 99) return 'Thunderstorm + Hail';

    return 'Unknown';
};

/**
 * Format temperature for display
 * 
 * @param {number} temp - Temperature value
 * @param {string} unit - 'F' or 'C'
 * @returns {string} - Formatted temperature string
 */
export const formatTemperature = (temp, unit = 'F') => {
    if (temp === null || temp === undefined) return '--°';
    return `${Math.round(temp)}°${unit}`;
};
