/**
 * @fileoverview Custom hook for fetching calendar events
 * @module modules/calendar/hooks/useCalendarEvents
 * 
 * EDUCATIONAL NOTES FOR JUNIOR DEVELOPERS:
 * 
 * WHY THIS FILE EXISTS:
 * Fetching calendar events is complex:
 * - Multiple users with different Google accounts
 * - Multiple calendars per user
 * - Need to merge and deduplicate events
 * - Handle token expiration
 * 
 * This hook encapsulates all that complexity.
 * 
 * DESIGN PATTERN: Custom Hook Pattern
 * React hooks let us extract stateful logic into reusable functions.
 */

import { useState, useCallback } from 'react';
import { fetchCalendarEvents } from '../../../services/googleCalendar';

/**
 * Hook for fetching calendar events from multiple users and calendars
 * 
 * WHAT IT DOES:
 * Fetches events from all connected Google accounts and merges them.
 * 
 * WHY WE NEED IT:
 * The calendar view needs to show events from all family members.
 * This hook handles the complexity of fetching from multiple sources.
 * 
 * HOW IT WORKS:
 * 1. Loop through all users
 * 2. For each user with a token, fetch their events
 * 3. Merge events, avoiding duplicates
 * 4. Tag each event with the source user
 * 5. Return the merged list
 * 
 * @param {Array} users - Array of user objects
 * @param {Object} googleTokens - Map of userId to token
 * @param {Object} selectedCalendars - Map of userId to calendar IDs
 * @returns {Object} { events, loading, error, fetchEvents }
 */
export const useCalendarEvents = (users, googleTokens, selectedCalendars) => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    /**
     * Fetches events from all users and calendars
     * 
     * JUNIOR DEV NOTE: Why useCallback?
     * This function is used in useEffect dependencies. useCallback prevents
     * it from being recreated on every render, which would cause infinite loops.
     */
    const fetchEvents = useCallback(async () => {
        console.log('📅 Fetching calendar events...');

        // Early return if no tokens
        if (Object.keys(googleTokens).length === 0) {
            console.warn('⚠️ No Google tokens - skipping event fetch');
            setEvents([]);
            return;
        }

        setLoading(true);
        setError(null);

        // Use a Map to deduplicate events by ID
        // JUNIOR DEV NOTE: Why Map instead of array?
        // Maps are faster for lookups. We can check if an event ID exists in O(1) time.
        const eventsMap = new Map();

        // Fetch events from 6 months ago to 12 months in the future
        const now = new Date();
        const startDate = new Date(now.getFullYear(), now.getMonth() - 6, 1);
        const endDate = new Date(now.getFullYear(), now.getMonth() + 12, 1);

        console.log(`📅 Date range: ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}`);

        try {
            // Fetch events for each user
            for (const user of users) {
                const token = googleTokens[user.id];

                if (!token) {
                    console.log(`⏭️ Skipping ${user.name} - no token`);
                    continue;
                }

                const calendars = selectedCalendars[user.id] || ['primary'];
                console.log(`🔍 Fetching for ${user.name} from:`, calendars);

                try {
                    const userEvents = await fetchCalendarEvents(token, startDate, endDate, calendars);
                    console.log(`✅ Fetched ${userEvents.length} events for ${user.name}`);

                    // Add events to map, tagging with source user
                    userEvents.forEach(event => {
                        // Only add if not already in map (deduplication)
                        if (!eventsMap.has(event.id)) {
                            eventsMap.set(event.id, {
                                ...event,
                                sourceUser: {
                                    name: user.name,
                                    color: user.color,
                                    avatar: user.avatar,
                                },
                            });
                        }
                    });
                } catch (err) {
                    console.error(`❌ Failed to fetch events for ${user.name}:`, err);
                    // Continue with other users even if one fails
                }
            }

            const allEvents = Array.from(eventsMap.values());
            console.log(`📊 Total events: ${allEvents.length}`);
            setEvents(allEvents);

        } catch (err) {
            console.error('❌ Calendar sync error:', err);
            setError(err.message || 'Failed to sync calendar events');
        } finally {
            setLoading(false);
        }
    }, [users, googleTokens, selectedCalendars]);

    return {
        events,
        loading,
        error,
        fetchEvents,
    };
};
