/**
 * @fileoverview Info bar component showing date, time, and weather
 * @module components/InfoBar
 * 
 * EDUCATIONAL NOTES FOR JUNIOR DEVELOPERS:
 * 
 * WHY THIS FILE EXISTS:
 * The app needs to show current date, time, and weather at the top.
 * This component provides that information bar.
 * 
 * DESIGN PATTERN: Presentational Component + Custom Hook
 * The component handles presentation, the hook handles time logic.
 * 
 * REFACTORING NOTE:
 * Before: Inline time state management
 * After: Using extracted useClock hook
 */

import React from 'react';
import { Box, Typography } from '@mui/material';
import { format } from 'date-fns';
import { useClock } from '../hooks/useClock';
import WeatherWidget from './WeatherWidget';

/**
 * Info Bar Component
 * 
 * WHAT IT DOES:
 * Displays current date, time, and weather in a horizontal bar.
 * 
 * HOW IT WORKS:
 * 1. Get current time from useClock hook
 * 2. Format date and time using date-fns
 * 3. Display weather widget on the right
 * 
 * LAYOUT:
 * [Date] [Time] ................. [Weather]
 * 
 * JUNIOR DEV NOTE: Why date-fns format?
 * date-fns is a library for date formatting. It's more reliable
 * than native JavaScript date methods and handles timezones better.
 * 
 * Format codes:
 * - 'EEE, MMM d' = "Mon, Jan 15"
 * - 'h:mm a' = "3:45 PM"
 */
const InfoBar = () => {
    // ========================================================================
    // HOOKS
    // ========================================================================

    /**
     * Get current time (updates every minute)
     * 
     * JUNIOR DEV NOTE: Why not just new Date()?
     * We need the time to update automatically. The hook handles
     * setting up the interval and cleaning it up.
     */
    const time = useClock();

    // ========================================================================
    // RENDERING
    // ========================================================================

    return (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                px: 2,
                py: 1,
                bgcolor: 'background.paper',
                borderRadius: 2,
                mb: 2,
            }}
        >
            {/* Date */}
            <Typography variant="h6" sx={{ fontWeight: 500 }}>
                {format(time, 'EEE, MMM d')}
            </Typography>

            {/* Time */}
            <Typography variant="h6" color="text.secondary">
                {format(time, 'h:mm a')}
            </Typography>

            {/* Weather (right-aligned) */}
            <Box sx={{ ml: 'auto' }}>
                <WeatherWidget />
            </Box>
        </Box>
    );
};

export default InfoBar;

/**
 * REFACTORING IMPROVEMENTS:
 * 
 * 1. Extracted clock logic to useClock hook
 * 2. Added comprehensive documentation
 * 3. Cleaner component structure
 * 4. Easier to test (hook can be tested separately)
 * 
 * FUTURE ENHANCEMENTS:
 * - Add timezone support
 * - Add date format preferences
 * - Add click to toggle 12/24 hour format
 */
