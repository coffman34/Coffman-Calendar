/**
 * @fileoverview Calendar Context Provider
 * 
 * JUNIOR DEV NOTE: This file is the "Brain" of the Calendar module.
 * It provides the state and actions needed to display and manage events.
 * 
 * DESIGN PATTERN: The "Service/Hook" Pattern
 * Instead of stuffing all the logic here, we've moved it into specialized hooks:
 * 1. useCalendarEvents: Handles fetching and merging events (READ)
 * 2. useEventMutations: Handles creating/updating/deleting events (WRITE)
 */

import React, { useEffect } from 'react';
import { useUser } from '../users/useUser';
import { useUI } from '../ui/useUI';
import { useCalendarEvents } from './hooks/useCalendarEvents';
import { useEventMutations } from './hooks/useEventMutations';
import { CalendarContext } from './CalendarContextCore';

/**
 * CalendarProvider Component
 * Envelopes the app (or a specific branch) to provide calendar state.
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children
 */
export default function CalendarProvider({ children }) {
    // 1. Get Dependencies from other contexts
    // JUNIOR DEV NOTE: We use other contexts since the calendar 
    // depends on who is logged in and needs to show notifications.
    const { users, googleTokens, selectedCalendars, getCurrentUserToken } = useUser();
    const { showNotification } = useUI();

    // 2. Initialize Read-side state (Events)
    // This hook handles the heavy lifting of fetching from multiple Google accounts.
    const {
        events,
        loading: syncing,
        error: fetchError,
        fetchEvents
    } = useCalendarEvents(
        users,
        googleTokens,
        selectedCalendars
    );

    // 3. Initialize Write-side operations (Mutations)
    // This hook provides standardized CRUD operations with built-in error handling.
    const {
        addEvent,
        updateEvent,
        removeEvent
    } = useEventMutations(
        getCurrentUserToken,
        showNotification,
        fetchEvents // Pass fetchEvents so it auto-refreshes after a mutation
    );

    // 4. Lifecycle Management
    // Automatically fetch events when the component mounts or when fetchEvents is recreated.
    useEffect(() => {
        fetchEvents();
    }, [fetchEvents]);

    // 5. Global Error Handling
    // If a fetch fails, we want to pop a toast/snackbar to let the family know.
    useEffect(() => {
        if (fetchError) {
            showNotification(`Calendar Error: ${fetchError}`, 'error');
        }
    }, [fetchError, showNotification]);

    // 6. Assemble the Context Value
    // JUNIOR DEV NOTE: We name these clearly so the components know exactly
    // what they are getting. 'syncing' is more descriptive for a UI than 'loading'.
    const value = {
        events,
        syncing,
        error: fetchError,
        fetchEvents,
        addEvent,
        updateEvent,
        removeEvent,
        // Alias for components expecting different names
        deleteEvent: removeEvent,
        loading: syncing
    };

    return (
        <CalendarContext.Provider value={value}>
            {children}
        </CalendarContext.Provider>
    );
}
