/**
 * @fileoverview Debounce utilities for touch-friendly kiosk interactions
 * @module utils/debounce
 * 
 * EDUCATIONAL NOTES FOR JUNIOR DEVELOPERS:
 * 
 * WHY THIS FILE EXISTS:
 * Kiosk touch screens often register multiple taps from a single touch.
 * Debouncing prevents rapid-fire function calls that could cause:
 * - Double API requests
 * - UI state confusion
 * - Accidental destructive actions
 * 
 * DESIGN PATTERN: Throttle Pattern
 * Unlike classic debounce (waits for silence), this uses throttling
 * which executes immediately then blocks subsequent calls for a period.
 * This feels more responsive on touch interfaces.
 */

/**
 * Creates a throttled handler that ignores rapid successive calls
 * 
 * WHAT IT DOES:
 * Executes the handler immediately on first call, then blocks
 * all subsequent calls until the delay period has passed.
 * 
 * WHY THROTTLE VS DEBOUNCE:
 * - Debounce: Waits for user to stop, then executes (good for search)
 * - Throttle: Executes immediately, blocks repeats (good for buttons)
 * 
 * @param {Function} handler - The function to wrap
 * @param {number} delay - Minimum ms between executions (default 300ms)
 * @returns {Function} Throttled version of the handler
 * 
 * @example
 * const handleClick = createThrottledHandler(() => {
 *     navigateToModule('calendar');
 * }, 300);
 */
export const createThrottledHandler = (handler, delay = 300) => {
    let lastCall = 0;

    return (...args) => {
        const now = Date.now();

        // Only execute if enough time has passed since last call
        if (now - lastCall >= delay) {
            lastCall = now;
            handler(...args);
        }
        // Otherwise, silently ignore the call (defensive UX)
    };
};

/**
 * React hook for creating a stable throttled callback
 * 
 * JUNIOR DEV NOTE: Why a hook?
 * In React, functions are recreated on every render.
 * This hook uses useCallback to maintain a stable reference
 * so the throttle state persists across renders.
 * 
 * @param {Function} callback - Function to throttle
 * @param {number} delay - Throttle delay in ms
 * @returns {Function} Stable throttled callback
 */
// Note: Hook version would go here, but requires React import
// For now, use createThrottledHandler directly

export default createThrottledHandler;
