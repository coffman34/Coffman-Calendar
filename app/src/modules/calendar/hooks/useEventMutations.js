/**
 * @fileoverview Custom hook for calendar event mutations (create, update, delete)
 * @module modules/calendar/hooks/useEventMutations
 * 
 * EDUCATIONAL NOTES FOR JUNIOR DEVELOPERS:
 * 
 * WHY THIS FILE EXISTS:
 * Creating, updating, and deleting events involves:
 * - Making API calls
 * - Handling errors
 * - Showing notifications
 * - Refreshing the event list
 * 
 * This hook encapsulates all mutation logic.
 * 
 * DESIGN PATTERN: Command Pattern + Custom Hook
 * Each mutation is a command that can be executed with consistent error handling.
 */

import { createGoogleEvent, updateGoogleEvent, deleteGoogleEvent } from '../../../services/googleCalendar';

/**
 * Hook for calendar event mutations
 * 
 * WHAT IT DOES:
 * Provides functions to create, update, and delete calendar events.
 * 
 * WHY WE NEED IT:
 * Separates mutation logic from the context, making it easier to test and reuse.
 * 
 * @param {Function} getCurrentUserToken - Function to get current user's token
 * @param {Function} showNotification - Function to show UI notifications
 * @param {Function} refreshEvents - Function to refresh event list after mutations
 * @returns {Object} { addEvent, updateEvent, removeEvent }
 */
export const useEventMutations = (getCurrentUserToken, showNotification, refreshEvents) => {
    /**
     * Creates a new calendar event
     * 
     * WHAT IT DOES:
     * Adds an event to the user's primary calendar.
     * 
     * HOW IT WORKS:
     * 1. Get current user's token
     * 2. Call Google Calendar API to create event
     * 3. Show success/error notification
     * 4. Refresh event list to show new event
     * 
     * @param {Object} eventData - Event data in app format
     * @returns {Promise<void>}
     * @throws {Error} If creation fails
     */
    const addEvent = async (eventData) => {
        const token = getCurrentUserToken();

        if (!token) {
            showNotification('Please connect your Google account first', 'warning');
            return;
        }

        try {
            await createGoogleEvent(token, 'primary', eventData);
            showNotification('Event created successfully', 'success');
            await refreshEvents(); // Refresh to show new event
        } catch (err) {
            console.error('Failed to create event:', err);
            showNotification('Failed to create event', 'error');
            throw err; // Re-throw so caller can handle if needed
        }
    };

    /**
     * Updates an existing calendar event
     * 
     * @param {string} calendarId - Calendar ID (defaults to 'primary')
     * @param {string} eventId - Event ID to update
     * @param {Object} eventData - Updated event data
     * @returns {Promise<void>}
     * @throws {Error} If update fails
     */
    const updateEvent = async (calendarId, eventId, eventData) => {
        const token = getCurrentUserToken();

        if (!token) {
            showNotification('Please connect your Google account first', 'warning');
            return;
        }

        try {
            await updateGoogleEvent(token, calendarId || 'primary', eventId, eventData);
            showNotification('Event updated successfully', 'success');
            await refreshEvents();
        } catch (err) {
            console.error('Failed to update event:', err);
            showNotification('Failed to update event', 'error');
            throw err;
        }
    };

    /**
     * Deletes a calendar event
     * 
     * @param {string} calendarId - Calendar ID (defaults to 'primary')
     * @param {string} eventId - Event ID to delete
     * @returns {Promise<void>}
     * @throws {Error} If deletion fails
     */
    const removeEvent = async (calendarId, eventId) => {
        const token = getCurrentUserToken();

        if (!token) {
            showNotification('Please connect your Google account first', 'warning');
            return;
        }

        try {
            await deleteGoogleEvent(token, calendarId || 'primary', eventId);
            showNotification('Event deleted successfully', 'success');
            await refreshEvents();
        } catch (err) {
            console.error('Failed to delete event:', err);
            showNotification('Failed to delete event', 'error');
            throw err;
        }
    };

    return {
        addEvent,
        updateEvent,
        removeEvent,
    };
};
