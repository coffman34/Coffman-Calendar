/**
 * @fileoverview Custom hook for live clock
 * @module hooks/useClock
 * 
 * EDUCATIONAL NOTES FOR JUNIOR DEVELOPERS:
 * 
 * WHY THIS FILE EXISTS:
 * Many components need to display the current time.
 * This hook provides a live-updating time value.
 * 
 * DESIGN PATTERN: Custom Hook Pattern
 * Encapsulates time-updating logic for reuse.
 */

import { useState, useEffect } from 'react';

/**
 * Hook for live clock
 * 
 * WHAT IT DOES:
 * Provides a Date object that updates every minute.
 * 
 * HOW IT WORKS:
 * 1. Create state with current time
 * 2. Set up interval to update every minute
 * 3. Clean up interval on unmount
 * 
 * WHY EVERY MINUTE?
 * Most clocks only show hours and minutes, not seconds.
 * Updating every second would be wasteful.
 * 
 * @param {number} updateInterval - Update interval in ms (default: 60000 = 1 minute)
 * @returns {Date} Current time
 * 
 * @example
 * function Clock() {
 *   const time = useClock();
 *   return <div>{time.toLocaleTimeString()}</div>;
 * }
 */
export const useClock = (updateInterval = 60000) => {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        // Set up interval
        const timer = setInterval(() => {
            setTime(new Date());
        }, updateInterval);

        // Cleanup
        return () => clearInterval(timer);
    }, [updateInterval]);

    return time;
};
