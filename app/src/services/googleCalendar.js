/**
 * @fileoverview Google Calendar API service
 * @module services/googleCalendar
 * 
 * EDUCATIONAL NOTES FOR JUNIOR DEVELOPERS:
 * 
 * WHY THIS FILE EXISTS:
 * This service provides a clean interface for working with Google Calendar.
 * Instead of making raw API calls throughout the app, we use these functions.
 * 
 * BENEFITS:
 * 1. Centralized API logic - changes only need to happen here
 * 2. Consistent error handling
 * 3. Data transformation happens automatically
 * 4. Easy to mock for testing
 * 
 * DESIGN PATTERN: Service Layer + Facade Pattern
 * We hide the complexity of the Google Calendar API behind simple functions.
 */

import { createGoogleApiClient, isTokenExpiredError } from './api/GoogleApiClient';
import { transformGoogleEvents, transformToGoogleEvent } from './transformers/calendarTransformer';
import { API_ENDPOINTS, CALENDAR_CONFIG } from '../utils/constants';

/**
 * Fetches calendar events from multiple Google Calendars
 * 
 * WHAT IT DOES:
 * Retrieves events from one or more calendars within a date range.
 * 
 * WHY WE NEED IT:
 * Users might have multiple calendars (Personal, Work, Family).
 * We need to fetch and merge events from all of them.
 * 
 * HOW IT WORKS:
 * 1. Loop through each calendar ID
 * 2. Make API request to Google for that calendar
 * 3. Collect all events
 * 4. Transform to our app's format
 * 5. Return merged list
 * 
 * ERROR HANDLING:
 * - If one calendar fails, we skip it and continue with others
 * - If token is expired, we throw TOKEN_EXPIRED error
 * - Network errors are caught and logged
 * 
 * @param {string} accessToken - OAuth2 access token
 * @param {Date} startDate - Beginning of date range
 * @param {Date} endDate - End of date range
 * @param {string[]} calendarIds - Array of calendar IDs to fetch from
 * @returns {Promise<Array>} Array of transformed calendar events
 * @throws {Error} TOKEN_EXPIRED if authentication fails
 * 
 * @example
 * const events = await fetchCalendarEvents(
 *   userToken,
 *   new Date('2024-01-01'),
 *   new Date('2024-01-31'),
 *   ['primary', 'family@group.calendar.google.com']
 * );
 */
export const fetchCalendarEvents = async (accessToken, startDate, endDate, calendarIds = ['primary']) => {
    const client = createGoogleApiClient(accessToken);
    const allEvents = [];

    // Fetch events from each calendar
    for (const calendarId of calendarIds) {
        try {
            const url = `${API_ENDPOINTS.GOOGLE_CALENDAR}/calendars/${encodeURIComponent(calendarId)}/events`;

            // Build query parameters
            const params = {
                timeMin: startDate.toISOString(),
                timeMax: endDate.toISOString(),
                singleEvents: 'true', // Expand recurring events
                orderBy: 'startTime',
                maxResults: CALENDAR_CONFIG.MAX_EVENTS_PER_REQUEST,
            };

            const data = await client.get(url, params);

            // Tag events with their source calendar
            const events = (data.items || []).map(item => ({
                ...item,
                originalCalendarId: calendarId,
            }));

            allEvents.push(...events);

        } catch (error) {
            // Re-throw token expiration errors
            if (isTokenExpiredError(error)) {
                throw error;
            }

            // Log and skip failed calendars
            console.warn(`Failed to fetch calendar ${calendarId}:`, error);
        }
    }

    // Transform to our app's format
    return transformGoogleEvents(allEvents);
};

/**
 * Fetches the list of user's Google Calendars
 * 
 * WHAT IT DOES:
 * Gets all calendars the user has access to (owned + subscribed).
 * 
 * WHY WE NEED IT:
 * Users need to select which calendars to display in the app.
 * 
 * @param {string} accessToken - OAuth2 access token
 * @returns {Promise<Array>} Array of calendar objects
 * 
 * @example
 * const calendars = await fetchCalendarList(userToken);
 * // Returns: [{ id: 'primary', name: 'My Calendar', color: '#9fc6e7', primary: true }, ...]
 */
export const fetchCalendarList = async (accessToken) => {
    const client = createGoogleApiClient(accessToken);
    const url = `${API_ENDPOINTS.GOOGLE_CALENDAR}/users/me/calendarList`;

    const data = await client.get(url);

    // Transform to simpler format
    return (data.items || []).map(cal => ({
        id: cal.id,
        name: cal.summary,
        color: cal.backgroundColor,
        primary: cal.primary || false,
    }));
};

/**
 * Creates a new event on Google Calendar
 * 
 * @param {string} accessToken - OAuth2 access token
 * @param {string} calendarId - Calendar ID to create event in
 * @param {Object} eventData - Event data in our app's format
 * @returns {Promise<Object>} Created event
 */
export const createGoogleEvent = async (accessToken, calendarId, eventData) => {
    const client = createGoogleApiClient(accessToken);
    const url = `${API_ENDPOINTS.GOOGLE_CALENDAR}/calendars/${encodeURIComponent(calendarId)}/events`;

    // Transform to Google's format
    const googleEvent = transformToGoogleEvent(eventData);

    const createdEvent = await client.post(url, googleEvent);
    return transformGoogleEvents([createdEvent])[0];
};

/**
 * Updates an existing Google Calendar event
 * 
 * @param {string} accessToken - OAuth2 access token
 * @param {string} calendarId - Calendar ID containing the event
 * @param {string} eventId - Event ID to update
 * @param {Object} eventData - Updated event data
 * @returns {Promise<Object>} Updated event
 */
export const updateGoogleEvent = async (accessToken, calendarId, eventId, eventData) => {
    const client = createGoogleApiClient(accessToken);
    const url = `${API_ENDPOINTS.GOOGLE_CALENDAR}/calendars/${encodeURIComponent(calendarId)}/events/${eventId}`;

    const googleEvent = transformToGoogleEvent(eventData);

    const updatedEvent = await client.put(url, googleEvent);
    return transformGoogleEvents([updatedEvent])[0];
};

/**
 * Deletes a Google Calendar event
 * 
 * @param {string} accessToken - OAuth2 access token
 * @param {string} calendarId - Calendar ID containing the event
 * @param {string} eventId - Event ID to delete
 * @returns {Promise<boolean>} True if successful
 */
export const deleteGoogleEvent = async (accessToken, calendarId, eventId) => {
    const client = createGoogleApiClient(accessToken);
    const url = `${API_ENDPOINTS.GOOGLE_CALENDAR}/calendars/${encodeURIComponent(calendarId)}/events/${eventId}`;

    await client.delete(url);
    return true;
};
