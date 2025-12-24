/**
 * @fileoverview Data transformers for Google Calendar API responses
 * @module services/transformers/calendarTransformer
 * 
 * EDUCATIONAL NOTES FOR JUNIOR DEVELOPERS:
 * 
 * WHY THIS FILE EXISTS:
 * Google Calendar API returns data in Google's format, but our app needs it
 * in a different format. This file transforms (converts) between the two.
 * 
 * DESIGN PATTERN: Adapter Pattern
 * We're adapting Google's data format to our app's data format.
 * This keeps our UI code clean - it doesn't need to know about Google's format.
 * 
 * SEPARATION OF CONCERNS:
 * - API layer: Fetches data from Google
 * - Transformer layer (this file): Converts data format
 * - UI layer: Displays the data
 * 
 * Each layer has one job and doesn't know about the others' implementation details.
 */

import { parseGoogleEventDate, formatEventTime } from '../../utils/date';

/**
 * Transforms a Google Calendar event to our app's event format
 * 
 * WHAT IT DOES:
 * Converts a single event from Google's format to our format.
 * 
 * WHY WE NEED IT:
 * Google's event object has fields like:
 * - event.start.dateTime or event.start.date
 * - event.summary (we call it "title")
 * - event.colorId (a number, we might want a hex color)
 * 
 * Our app uses a simpler, more consistent format.
 * 
 * @param {Object} googleEvent - Event from Google Calendar API
 * @param {number} index - Event index (for default color assignment)
 * @returns {Object} Transformed event for our app
 */
export const transformGoogleEvent = (googleEvent, index = 0) => {
    return {
        // Basic info
        id: googleEvent.id,
        summary: googleEvent.summary || '(No title)',
        description: googleEvent.description || '',
        location: googleEvent.location || '',

        // Dates and times
        date: parseGoogleEventDate(googleEvent),
        endDate: googleEvent.end?.dateTime ? new Date(googleEvent.end.dateTime) : null,
        time: formatEventTime(googleEvent),
        isAllDay: !googleEvent.start?.dateTime,

        // Visual
        colorId: googleEvent.colorId || (index % 11).toString(),
        emoji: '', // We don't use emojis for Google events

        // Metadata
        originalCalendarId: googleEvent.originalCalendarId || 'primary',
        isGoogleEvent: true,

        // Recurrence
        recurrence: googleEvent.recurrence || null,

        // Attendees and collaboration
        attendees: googleEvent.attendees || [],
        creator: googleEvent.creator?.email || '',
        organizer: googleEvent.organizer?.displayName || googleEvent.organizer?.email || '',
        calendarName: googleEvent.organizer?.displayName || 'Calendar',

        // Reminders
        reminders: googleEvent.reminders || { useDefault: true },

        // Additional properties
        transparency: googleEvent.transparency || 'opaque', // 'opaque' = busy, 'transparent' = free
        visibility: googleEvent.visibility || 'default',
        conferenceData: googleEvent.conferenceData || null,
        htmlLink: googleEvent.htmlLink || '',
        eventType: googleEvent.eventType || 'default',
    };
};

/**
 * Transforms an array of Google Calendar events
 * 
 * @param {Array} googleEvents - Array of events from Google Calendar API
 * @returns {Array} Array of transformed events
 */
export const transformGoogleEvents = (googleEvents) => {
    if (!Array.isArray(googleEvents)) {
        console.warn('transformGoogleEvents received non-array:', googleEvents);
        return [];
    }

    return googleEvents.map((event, index) => transformGoogleEvent(event, index));
};

/**
 * Transforms our app's event format to Google Calendar API format
 * 
 * WHAT IT DOES:
 * Converts an event from our format to Google's format for creating/updating.
 * 
 * WHY WE NEED IT:
 * When we create or update an event, we need to send it in Google's format.
 * 
 * @param {Object} appEvent - Event in our app's format
 * @returns {Object} Event in Google Calendar API format
 */
export const transformToGoogleEvent = (appEvent) => {
    const googleEvent = {
        summary: appEvent.summary,
        description: appEvent.description || '',
        location: appEvent.location || '',
    };

    // Handle color
    if (appEvent.colorId) {
        googleEvent.colorId = String(appEvent.colorId);
    }

    // Handle dates
    if (appEvent.isAllDay) {
        // All-day event
        const dateStr = formatDateOnly(appEvent.date);
        googleEvent.start = { date: dateStr };
        googleEvent.end = { date: dateStr };
    } else {
        // Timed event
        const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        googleEvent.start = {
            dateTime: appEvent.date.toISOString(),
            timeZone,
        };

        const endDate = appEvent.endDate || new Date(appEvent.date.getTime() + 3600000); // +1 hour
        googleEvent.end = {
            dateTime: endDate.toISOString(),
            timeZone,
        };
    }

    // Handle recurrence
    if (appEvent.repeat && appEvent.repeat !== 'Does not repeat') {
        googleEvent.recurrence = [generateRecurrenceRule(appEvent.repeat)];
    }

    // Handle attendees
    if (appEvent.attendees && appEvent.attendees.length > 0) {
        googleEvent.attendees = appEvent.attendees.map(email => ({ email }));
    }

    // Handle reminders
    if (appEvent.reminders) {
        if (appEvent.reminders.overrides && appEvent.reminders.overrides.length > 0) {
            googleEvent.reminders = {
                useDefault: false,
                overrides: appEvent.reminders.overrides,
            };
        } else if (appEvent.reminders.useDefault === false) {
            googleEvent.reminders = { useDefault: false, overrides: [] };
        } else {
            googleEvent.reminders = { useDefault: true };
        }
    }

    return googleEvent;
};

/**
 * Helper to format date as YYYY-MM-DD
 */
const formatDateOnly = (date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

/**
 * Helper to generate recurrence rule
 */
const generateRecurrenceRule = (repeatType) => {
    const map = {
        'Daily': 'RRULE:FREQ=DAILY',
        'Weekly': 'RRULE:FREQ=WEEKLY',
        'Monthly': 'RRULE:FREQ=MONTHLY',
        'Yearly': 'RRULE:FREQ=YEARLY',
    };
    return map[repeatType] || null;
};
