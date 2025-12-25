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
 * DEFENSIVE UX FEATURE: Wake Delay
 * When waking from screensaver, we block input for 500ms to prevent
 * the same touch that dismissed the screensaver from triggering UI.
 * 
 * DESIGN PATTERN: Custom Hook Pattern
 * Encapsulates stateful logic for reuse across components.
 */

import { useState, useEffect, useRef, useCallback } from 'react';

// Time to block input after waking from screensaver (ms)
const WAKE_DELAY_MS = 500;

/**
 * Hook for tracking user idle time with wake delay protection
 * 
 * @param {number} timeout - Milliseconds of inactivity before idle
 * @returns {Object} { isIdle, setIdle, isWaking }
 */
const useIdleTimer = (timeout = 30000) => {
    const [isIdle, setIsIdle] = useState(false);
    const [isWaking, setIsWaking] = useState(false);
    const timerRef = useRef(null);
    const wakeTimerRef = useRef(null);
    const hasInitialized = useRef(false);

    /**
     * Resets the idle timer and handles wake delay
     * 
     * JUNIOR DEV NOTE: When transitioning from idle to active,
     * we set isWaking=true for WAKE_DELAY_MS to block accidental clicks.
     */
    const resetTimer = useCallback(() => {
        // Clear existing timer
        if (timerRef.current) {
            clearTimeout(timerRef.current);
        }

        // Handle wake delay: if we were idle, block input briefly
        setIsIdle(prev => {
            if (prev === true) {
                // We're waking up - start the wake delay
                setIsWaking(true);

                // Clear any existing wake timer
                if (wakeTimerRef.current) {
                    clearTimeout(wakeTimerRef.current);
                }

                // End wake delay after timeout
                wakeTimerRef.current = setTimeout(() => {
                    setIsWaking(false);
                }, WAKE_DELAY_MS);
            }
            if (prev === false) return prev;
            return false;
        });

        // Start new idle timer
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

        // Cleanup: remove listeners and clear timers
        return () => {
            events.forEach(event => {
                window.removeEventListener(event, resetTimer);
            });
            if (timerRef.current) clearTimeout(timerRef.current);
            if (wakeTimerRef.current) clearTimeout(wakeTimerRef.current);
        };
    }, [resetTimer]);

    return {
        isIdle,
        setIdle: setIsIdle,
        isWaking, // New: true during wake delay period
    };
};

export default useIdleTimer;
