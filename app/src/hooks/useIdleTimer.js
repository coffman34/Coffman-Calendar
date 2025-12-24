/**
 * @fileoverview Custom hook for idle timer (screensaver activation)
 * @module hooks/useIdleTimer
 * 
 * EDUCATIONAL NOTES FOR JUNIOR DEVELOPERS:
 * 
 * WHY THIS FILE EXISTS:
 * The kiosk should show a screensaver after inactivity.
 * This hook tracks user activity and triggers idle state.
 * 
 * DESIGN PATTERN: Custom Hook Pattern
 * Encapsulates stateful logic for reuse across components.
 */

import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Hook for tracking user idle time
 * 
 * @param {number} timeout - Milliseconds of inactivity before idle
 * @returns {Object} { isIdle, setIdle }
 */
const useIdleTimer = (timeout = 30000) => {
    const [isIdle, setIsIdle] = useState(false);
    const timerRef = useRef(null);
    const hasInitialized = useRef(false);

    /**
     * Resets the idle timer
     * 
     * JUNIOR DEV NOTE: We use useCallback so this function can be safely 
     * used as a dependency in useEffect.
     */
    const resetTimer = useCallback(() => {
        // Clear existing timer
        if (timerRef.current) {
            clearTimeout(timerRef.current);
        }

        // Only update state if needed to avoid "cascading renders"
        setIsIdle(prev => {
            if (prev === false) return prev;
            return false;
        });

        // Start new timer
        timerRef.current = setTimeout(() => {
            setIsIdle(true);
        }, timeout);
    }, [timeout]);

    useEffect(() => {
        // Events that indicate user activity
        const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];

        // Add listeners for all activity events
        events.forEach(event => {
            window.addEventListener(event, resetTimer);
        });

        // Start initial timer only once
        if (!hasInitialized.current) {
            hasInitialized.current = true;
            resetTimer();
        }

        // Cleanup: remove listeners and clear timer
        return () => {
            events.forEach(event => {
                window.removeEventListener(event, resetTimer);
            });
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
        };
    }, [resetTimer]);

    return {
        isIdle,
        setIdle: setIsIdle,
    };
};

export default useIdleTimer;
