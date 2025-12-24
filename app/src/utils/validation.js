/**
 * @fileoverview Input validation utilities
 * @module utils/validation
 * 
 * EDUCATIONAL NOTES FOR JUNIOR DEVELOPERS:
 * 
 * WHY THIS FILE EXISTS:
 * User input can never be trusted. Common problems:
 * 1. Empty strings when you expect content
 * 2. Invalid email formats
 * 3. Dates in the past when you need future dates
 * 4. SQL injection, XSS attacks (though we don't have a database here)
 * 
 * Centralizing validation:
 * - Ensures consistent validation rules across the app
 * - Makes it easy to update validation logic
 * - Provides helpful error messages to users
 * 
 * DESIGN PATTERN: Validator Pattern
 * Each function validates one specific thing and returns true/false or an error message.
 */

/**
 * Validates that a string is not empty
 * 
 * WHAT IT DOES:
 * Checks if a string has actual content (not just whitespace).
 * 
 * WHY WE NEED IT:
 * Users might enter "   " (spaces) which looks empty but isn't technically empty.
 * We need to trim whitespace before checking.
 * 
 * @param {string} value - String to validate
 * @returns {boolean} True if string has content
 * 
 * @example
 * isNotEmpty("Hello") // true
 * isNotEmpty("   ")   // false
 * isNotEmpty("")      // false
 */
export const isNotEmpty = (value) => {
    return typeof value === 'string' && value.trim().length > 0;
};

/**
 * Validates an email address format
 * 
 * JUNIOR DEV NOTE: Email validation is surprisingly complex!
 * This is a simple regex that catches most common cases.
 * For production apps, you'd want a more robust solution.
 * 
 * @param {string} email - Email to validate
 * @returns {boolean} True if email format is valid
 */
export const isValidEmail = (email) => {
    if (!isNotEmpty(email)) return false;

    // Simple email regex - matches most common formats
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
};

/**
 * Validates that a date is in the future
 * 
 * @param {Date} date - Date to validate
 * @returns {boolean} True if date is in the future
 */
export const isFutureDate = (date) => {
    return date > new Date();
};

/**
 * Validates that a date is valid
 * 
 * JUNIOR DEV NOTE: Why is this needed?
 * `new Date("invalid")` creates a Date object, but it's "Invalid Date".
 * We need to check if the date is actually valid.
 * 
 * @param {Date} date - Date to validate
 * @returns {boolean} True if date is valid
 */
export const isValidDate = (date) => {
    return date instanceof Date && !isNaN(date.getTime());
};

/**
 * Validates a hex color code
 * 
 * @param {string} color - Color to validate (e.g., "#FF5733")
 * @returns {boolean} True if valid hex color
 */
export const isValidHexColor = (color) => {
    if (!isNotEmpty(color)) return false;
    const hexRegex = /^#[0-9A-F]{6}$/i;
    return hexRegex.test(color);
};

/**
 * Validates a user name
 * 
 * WHAT IT DOES:
 * Checks if a name is valid for a user profile.
 * 
 * RULES:
 * - Must not be empty
 * - Must be 1-50 characters
 * - Can contain letters, numbers, spaces, and common punctuation
 * 
 * @param {string} name - Name to validate
 * @returns {Object} { valid: boolean, error: string }
 */
export const validateUserName = (name) => {
    if (!isNotEmpty(name)) {
        return { valid: false, error: 'Name cannot be empty' };
    }

    if (name.trim().length > 50) {
        return { valid: false, error: 'Name must be 50 characters or less' };
    }

    return { valid: true, error: null };
};

/**
 * Validates event data before saving
 * 
 * @param {Object} eventData - Event data to validate
 * @returns {Object} { valid: boolean, errors: string[] }
 */
export const validateEventData = (eventData) => {
    const errors = [];

    if (!isNotEmpty(eventData.summary)) {
        errors.push('Event title is required');
    }

    if (!isValidDate(eventData.date)) {
        errors.push('Invalid event date');
    }

    if (eventData.endDate && !isValidDate(eventData.endDate)) {
        errors.push('Invalid end date');
    }

    if (eventData.endDate && eventData.date && eventData.endDate < eventData.date) {
        errors.push('End date must be after start date');
    }

    return {
        valid: errors.length === 0,
        errors,
    };
};

/**
 * Sanitizes user input to prevent XSS attacks
 * 
 * WHAT IT DOES:
 * Removes potentially dangerous HTML/JavaScript from user input.
 * 
 * WHY WE NEED IT:
 * If a user enters "<script>alert('hack')</script>" as their name,
 * we don't want that to execute when we display it.
 * 
 * JUNIOR DEV NOTE: This is a simple sanitizer for basic protection.
 * For production apps handling sensitive data, use a library like DOMPurify.
 * 
 * @param {string} input - User input to sanitize
 * @returns {string} Sanitized input
 */
export const sanitizeInput = (input) => {
    if (typeof input !== 'string') return '';

    return input
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
};
