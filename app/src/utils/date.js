/**
 * @fileoverview Date utility functions for calendar operations
 * @module utils/date
 * 
 * EDUCATIONAL NOTES FOR JUNIOR DEVELOPERS:
 * 
 * WHY THIS FILE EXISTS:
 * Date handling in JavaScript is notoriously tricky. Common problems:
 * 1. Timezones (UTC vs local time)
 * 2. Date formatting inconsistencies
 * 3. All-day events vs timed events
 * 4. Parsing different date formats
 * 
 * This utility centralizes all date logic so:
 * - We handle edge cases in one place
 * - Date formatting is consistent across the app
 * - We can easily switch date libraries if needed (currently using date-fns)
 * 
 * DESIGN PATTERN: Utility Module Pattern
 * Pure functions that take inputs and return outputs without side effects.
 */

import {
    format,
    isToday as dateFnsIsToday,
    isSameDay as dateFnsIsSameDay,
    startOfWeek,
    endOfWeek,
    startOfMonth,
    endOfMonth,
    addDays,
    addWeeks,
    addMonths,
    subDays,
    subWeeks,
    subMonths,
    parseISO,
} from 'date-fns';

// ============================================================================
// DATE PARSING
// ============================================================================

/**
 * Parses a Google Calendar event date correctly
 * 
 * WHAT IT DOES:
 * Google Calendar has two types of events:
 * 1. Timed events: { dateTime: "2024-01-15T14:00:00Z" }
 * 2. All-day events: { date: "2024-01-15" }
 * 
 * This function handles both cases and returns a proper Date object.
 * 
 * WHY WE NEED IT:
 * If you just do `new Date(event.start.date)`, all-day events will be
 * parsed as UTC midnight, which might be the previous day in your timezone!
 * 
 * HOW IT WORKS:
 * - For timed events: Parse the ISO 8601 datetime string
 * - For all-day events: Parse as local date (not UTC)
 * 
 * @param {Object} event - Google Calendar event object
 * @param {Object} event.start - Event start time
 * @param {string} [event.start.dateTime] - ISO datetime for timed events
 * @param {string} [event.start.date] - YYYY-MM-DD for all-day events
 * @returns {Date} JavaScript Date object
 * 
 * @example
 * // Timed event
 * parseGoogleEventDate({ start: { dateTime: "2024-01-15T14:00:00Z" } })
 * // Returns: Date object for 2pm on Jan 15, 2024
 * 
 * // All-day event
 * parseGoogleEventDate({ start: { date: "2024-01-15" } })
 * // Returns: Date object for Jan 15, 2024 at midnight LOCAL time
 */
export const parseGoogleEventDate = (event) => {
    // JUNIOR DEV NOTE: Why check dateTime first?
    // Timed events are more common, so we optimize for the common case.
    // Also, some events might have both fields, and dateTime is more specific.
    if (event.start?.dateTime) {
        // Timed event - parse as ISO 8601 datetime
        return parseISO(event.start.dateTime);
    }

    if (event.start?.date) {
        // All-day event - parse as local date
        // JUNIOR DEV NOTE: Why split and construct manually?
        // If we use `new Date("2024-01-15")`, JavaScript parses it as UTC.
        // UTC midnight might be yesterday in your timezone!
        // By splitting and using the Date constructor, we force local time.
        const [year, month, day] = event.start.date.split('-').map(Number);
        return new Date(year, month - 1, day); // month is 0-indexed in JS
    }

    // Fallback to current date if neither field exists
    console.warn('Event has no start date:', event);
    return new Date();
};

/**
 * Formats a date as YYYY-MM-DD (for Google Calendar all-day events)
 * 
 * @param {Date} date - Date to format
 * @returns {string} Date in YYYY-MM-DD format
 * 
 * @example
 * formatDateOnly(new Date(2024, 0, 15)) // Returns: "2024-01-15"
 */
export const formatDateOnly = (date) => {
    return format(date, 'yyyy-MM-dd');
};

// ============================================================================
// DATE COMPARISON
// ============================================================================

/**
 * Checks if a date is today
 * 
 * JUNIOR DEV NOTE: Why not just compare date.getDate()?
 * You need to compare year, month, AND day. This function does all three.
 * 
 * @param {Date} date - Date to check
 * @returns {boolean} True if date is today
 */
export const isToday = (date) => {
    return dateFnsIsToday(date);
};

/**
 * Checks if two dates are the same day
 * 
 * WHAT IT DOES:
 * Returns true if both dates are on the same day, ignoring time.
 * 
 * WHY WE NEED IT:
 * Useful for grouping events by day or highlighting the current day.
 * 
 * @param {Date} date1 - First date
 * @param {Date} date2 - Second date
 * @returns {boolean} True if same day
 * 
 * @example
 * const morning = new Date(2024, 0, 15, 9, 0);
 * const evening = new Date(2024, 0, 15, 18, 0);
 * isSameDay(morning, evening) // Returns: true
 */
export const isSameDay = (date1, date2) => {
    return dateFnsIsSameDay(date1, date2);
};

// ============================================================================
// DATE FORMATTING
// ============================================================================

/**
 * Formats event time for display
 * 
 * WHAT IT DOES:
 * Converts a Google Calendar event to a human-readable time string.
 * 
 * HOW IT WORKS:
 * - All-day events: Return "All day"
 * - Timed events: Return time in 12-hour format (e.g., "2:00 PM")
 * 
 * @param {Object} event - Google Calendar event
 * @returns {string} Formatted time string
 */
export const formatEventTime = (event) => {
    if (event.start?.dateTime) {
        const date = parseISO(event.start.dateTime);
        return format(date, 'h:mm a'); // e.g., "2:00 PM"
    }
    return 'All day';
};

/**
 * Formats a date for display in the calendar header
 * 
 * @param {Date} date - Date to format
 * @returns {string} Formatted date (e.g., "January 15, 2024")
 */
export const formatCalendarHeader = (date) => {
    return format(date, 'MMMM d, yyyy');
};

/**
 * Formats a date for display in the month view
 * 
 * @param {Date} date - Date to format
 * @returns {string} Formatted date (e.g., "Jan 15")
 */
export const formatMonthDay = (date) => {
    return format(date, 'MMM d');
};

/**
 * Formats time for display (24-hour or 12-hour)
 * 
 * @param {Date} date - Date to format
 * @param {boolean} use24Hour - Whether to use 24-hour format
 * @returns {string} Formatted time
 */
export const formatTime = (date, use24Hour = false) => {
    return format(date, use24Hour ? 'HH:mm' : 'h:mm a');
};

// ============================================================================
// DATE RANGE CALCULATIONS
// ============================================================================

/**
 * Gets the start and end of the week for a given date
 * 
 * WHAT IT DOES:
 * Returns the first and last day of the week containing the given date.
 * 
 * WHY WE NEED IT:
 * For the weekly calendar view, we need to know which 7 days to display.
 * 
 * @param {Date} date - Any date in the week
 * @returns {Object} { start: Date, end: Date }
 * 
 * @example
 * getWeekRange(new Date(2024, 0, 15)) // Monday Jan 15
 * // Returns: { start: Sun Jan 14, end: Sat Jan 20 }
 */
export const getWeekRange = (date) => {
    return {
        start: startOfWeek(date),
        end: endOfWeek(date),
    };
};

/**
 * Gets the start and end of the month for a given date
 * 
 * @param {Date} date - Any date in the month
 * @returns {Object} { start: Date, end: Date }
 */
export const getMonthRange = (date) => {
    return {
        start: startOfMonth(date),
        end: endOfMonth(date),
    };
};

/**
 * Gets an array of dates for the current week
 * 
 * WHAT IT DOES:
 * Returns an array of 7 Date objects, one for each day of the week.
 * 
 * WHY WE NEED IT:
 * For rendering the weekly calendar grid, we need to iterate over each day.
 * 
 * @param {Date} date - Any date in the week
 * @returns {Date[]} Array of 7 dates
 * 
 * @example
 * getWeekDays(new Date(2024, 0, 15))
 * // Returns: [Sun Jan 14, Mon Jan 15, ..., Sat Jan 20]
 */
export const getWeekDays = (date) => {
    const start = startOfWeek(date);
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
};

// ============================================================================
// DATE NAVIGATION
// ============================================================================

/**
 * Navigation helpers for moving between time periods
 * 
 * JUNIOR DEV NOTE: Why create these wrappers?
 * They make the code more readable. Compare:
 * - setDate(addDays(date, 1))  vs  setDate(nextDay(date))
 * - setDate(subWeeks(date, 1)) vs  setDate(previousWeek(date))
 */

export const nextDay = (date) => addDays(date, 1);
export const previousDay = (date) => subDays(date, 1);

export const nextWeek = (date) => addWeeks(date, 1);
export const previousWeek = (date) => subWeeks(date, 1);

export const nextMonth = (date) => addMonths(date, 1);
export const previousMonth = (date) => subMonths(date, 1);

// ============================================================================
// RECURRENCE RULE GENERATION
// ============================================================================

/**
 * Generates an iCalendar RRULE for recurring events
 * 
 * WHAT IT DOES:
 * Converts a human-readable repeat type ("Daily", "Weekly", etc.)
 * into an RRULE string that Google Calendar understands.
 * 
 * WHY WE NEED IT:
 * Google Calendar uses the iCalendar standard for recurring events.
 * We need to convert our UI options into that format.
 * 
 * JUNIOR DEV NOTE: What's an RRULE?
 * RRULE is a standard format for describing recurring events.
 * Example: "RRULE:FREQ=WEEKLY" means "repeat every week"
 * 
 * @param {string} repeatType - One of: "Daily", "Weekly", "Monthly", "Yearly"
 * @returns {string|null} RRULE string or null if no repeat
 * 
 * @example
 * generateRecurrenceRule("Weekly")
 * // Returns: "RRULE:FREQ=WEEKLY"
 */
export const generateRecurrenceRule = (repeatType) => {
    const ruleMap = {
        'Daily': 'RRULE:FREQ=DAILY',
        'Weekly': 'RRULE:FREQ=WEEKLY',
        'Monthly': 'RRULE:FREQ=MONTHLY',
        'Yearly': 'RRULE:FREQ=YEARLY',
    };

    return ruleMap[repeatType] || null;
};

// ============================================================================
// TIME UTILITIES
// ============================================================================

/**
 * Gets the current time rounded to the nearest 15 minutes
 * 
 * WHAT IT DOES:
 * Returns the current time, but rounded to :00, :15, :30, or :45.
 * 
 * WHY WE NEED IT:
 * When creating a new event, we want to default to a "nice" time
 * like 2:00 PM instead of 2:07 PM.
 * 
 * @returns {Date} Current time rounded to 15 minutes
 */
export const getCurrentTimeRounded = () => {
    const now = new Date();
    const minutes = now.getMinutes();
    const roundedMinutes = Math.round(minutes / 15) * 15;

    now.setMinutes(roundedMinutes);
    now.setSeconds(0);
    now.setMilliseconds(0);

    return now;
};

/**
 * Adds hours to a date
 * 
 * @param {Date} date - Starting date
 * @param {number} hours - Number of hours to add
 * @returns {Date} New date with hours added
 */
export const addHours = (date, hours) => {
    const newDate = new Date(date);
    newDate.setHours(newDate.getHours() + hours);
    return newDate;
};
