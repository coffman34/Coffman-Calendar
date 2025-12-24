/**
 * @fileoverview Custom hook for calendar navigation and view management
 * @module modules/calendar/hooks/useCalendarNavigation
 * 
 * EDUCATIONAL NOTES FOR JUNIOR DEVELOPERS:
 * 
 * WHY THIS FILE EXISTS:
 * Calendar views need to navigate between dates (day, week, month).
 * This hook encapsulates all navigation logic.
 * 
 * DESIGN PATTERN: Custom Hook Pattern
 * Extracts stateful navigation logic for reuse and testing.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { addWeeks, subWeeks, addDays, subDays, addMonths, subMonths } from 'date-fns';

/**
 * Hook for calendar navigation
 * 
 * WHAT IT DOES:
 * Manages current date, view mode, and navigation between dates.
 * 
 * HOW IT WORKS:
 * 1. Track current date and view mode (day/week/month)
 * 2. Provide navigation functions (next, previous, today)
 * 3. Handle touch gestures for swipe navigation
 * 4. Update current time every minute
 * 
 * @param {string} initialView - Initial view mode ('day' | 'week' | 'month')
 * @returns {Object} Navigation state and functions
 */
export const useCalendarNavigation = (initialView = 'week') => {
    // 1. Core Navigation State
    const [currentDate, setCurrentDate] = useState(new Date());
    const [currentTime, setCurrentTime] = useState(new Date());
    const [viewMode, setViewMode] = useState(initialView);

    // 2. Refs for Touch Navigation
    const containerRef = useRef(null);
    const touchStartX = useRef(0);

    /**
     * Navigate to next/previous period
     * 
     * JUNIOR DEV NOTE: Why useCallback?
     * This function is used inside the touch event listeners and returned 
     * in the tool's public API. We use useCallback so that components 
     * like DayView or WeekView don't re-render unless the viewMode changes.
     */
    const navigate = useCallback((direction) => {
        switch (viewMode) {
            case 'day':
                setCurrentDate(d => direction > 0 ? addDays(d, 1) : subDays(d, 1));
                break;
            case 'week':
                setCurrentDate(d => direction > 0 ? addWeeks(d, 1) : subWeeks(d, 1));
                break;
            case 'month':
                setCurrentDate(d => direction > 0 ? addMonths(d, 1) : subMonths(d, 1));
                break;
        }
    }, [viewMode]);

    /** Navigate to today */
    const goToToday = useCallback(() => {
        setCurrentDate(new Date());
    }, []);

    /** Navigate to specific date */
    const goToDate = useCallback((date) => {
        setCurrentDate(date);
    }, []);

    // 3. Effects

    /** Update current time every minute */
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 60000);

        return () => clearInterval(timer);
    }, []);

    /**
     * Set up touch gesture navigation
     * 
     * WHAT IT DOES:
     * Enables swipe left/right to navigate between dates.
     * 
     * JUNIOR DEV NOTE: Why add/remove event listeners manually?
     * On touchscreens, we want global swipe gestures on the calendar container. 
     * By using refs and manual listeners, we avoid re-rendering the whole 
     * calendar just to handle a touch move.
     */
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const handleTouchStart = (e) => {
            if (e.touches.length === 1) {
                touchStartX.current = e.touches[0].clientX;
            }
        };

        const handleTouchEnd = (e) => {
            if (e.changedTouches.length === 1) {
                const deltaX = e.changedTouches[0].clientX - touchStartX.current;

                // Threshold of 50px prevents accidental swipes
                if (Math.abs(deltaX) > 50) {
                    if (deltaX > 0) {
                        navigate(-1); // Swipe right = previous
                    } else {
                        navigate(1); // Swipe left = next
                    }
                }
            }
        };

        container.addEventListener('touchstart', handleTouchStart);
        container.addEventListener('touchend', handleTouchEnd);

        return () => {
            container.removeEventListener('touchstart', handleTouchStart);
            container.removeEventListener('touchend', handleTouchEnd);
        };
    }, [navigate]); // Only re-attach if navigate changes

    return {
        currentDate,
        currentTime,
        viewMode,
        setViewMode,
        navigate,
        goToToday,
        goToDate,
        containerRef,
    };
};
