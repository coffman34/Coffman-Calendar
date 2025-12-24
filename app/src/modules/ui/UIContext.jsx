/**
 * @fileoverview UI Context Provider
 * 
 * JUNIOR DEV NOTE: This context handles global UI states that don't belong 
 * to a specific module. Currently, it's the home of our notification system.
 * 
 * WHY IS THIS IMPORTANT?
 * Every app needs a way to talk to the user. By putting notifications in 
 * a global context, any component can show a message without needing 
 * to know where the actual Snackbar UI code lives.
 */

import React, { useState, useCallback } from 'react';
import { UIContext } from './UIContextCore';

/**
 * UIProvider Component
 * 
 * DESIGN PATTERN: The "Centralized Notification" Pattern
 * Instead of having 50 Snackbars across the app, we have ONE here 
 * and let everyone trigger it via showNotification().
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children
 */
export default function UIProvider({ children }) {
    // 1. Define UI State
    // STRUCTURE: { open: bool, message: string, severity: 'success'|'error'|... }
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'info',
    });

    // 2. Define Actions
    // JUNIOR DEV NOTE: We use useCallback so these functions don't change 
    // on every render. This prevents unnecessary re-renders in components 
    // that consume this context.

    /** 
     * Shows a popup message 
     * @param {string} message - The text to display
     * @param {string} severity - success | error | warning | info
     */
    const showNotification = useCallback((message, severity = 'info') => {
        setSnackbar({
            open: true,
            message,
            severity,
        });
    }, []);

    /** Closes the currently visible popup */
    const hideNotification = useCallback(() => {
        setSnackbar(prev => ({
            ...prev,
            open: false,
        }));
    }, []);

    // 3. Assemble Value Object
    // We keep the functions stable with useCallback to avoid re-renders.
    const value = {
        showNotification,
        hideNotification,
        snackbar,
    };

    return (
        <UIContext.Provider value={value}>
            {children}
        </UIContext.Provider>
    );
}
