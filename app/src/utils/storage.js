/**
 * @fileoverview LocalStorage abstraction layer with type-safe operations
 * @module utils/storage
 * 
 * EDUCATIONAL NOTES FOR JUNIOR DEVELOPERS:
 * 
 * WHY THIS FILE EXISTS:
 * LocalStorage is a browser API that stores data as strings. This creates problems:
 * 1. You have to manually JSON.stringify() and JSON.parse() everywhere
 * 2. Errors aren't handled consistently
 * 3. Type safety is lost (you get strings back, not objects)
 * 
 * This utility wraps localStorage to provide:
 * - Automatic JSON serialization/deserialization
 * - Consistent error handling
 * - Type-safe operations
 * - Easy testing (we can mock this module)
 * 
 * DESIGN PATTERN: Adapter Pattern
 * We're adapting the browser's localStorage API to be more developer-friendly.
 */

import { STORAGE_KEYS } from './constants';

/**
 * Retrieves an item from localStorage and parses it as JSON
 * 
 * WHAT IT DOES:
 * Gets a value from localStorage and automatically converts it from JSON string
 * to a JavaScript object/array/primitive.
 * 
 * WHY WE NEED IT:
 * Without this, you'd write: JSON.parse(localStorage.getItem(key))
 * everywhere in your code. That's repetitive and error-prone.
 * 
 * HOW IT WORKS:
 * 1. Try to get the item from localStorage
 * 2. If it exists, parse it from JSON
 * 3. If parsing fails or item doesn't exist, return the default value
 * 4. Catch any errors and return default value
 * 
 * @param {string} key - The localStorage key to retrieve
 * @param {*} defaultValue - Value to return if key doesn't exist or parsing fails
 * @returns {*} The parsed value or defaultValue
 * 
 * @example
 * const users = getItem(STORAGE_KEYS.USERS, []);
 * // Returns parsed array of users, or empty array if not found
 */
export const getItem = (key, defaultValue = null) => {
    try {
        const item = localStorage.getItem(key);

        // JUNIOR DEV NOTE: Why check for null explicitly?
        // localStorage.getItem() returns null if the key doesn't exist.
        // We want to distinguish between "key doesn't exist" and "key exists but is empty"
        if (item === null) {
            return defaultValue;
        }

        // JUNIOR DEV NOTE: Why try/catch around JSON.parse?
        // If someone manually edited localStorage and put invalid JSON,
        // JSON.parse() will throw an error. We catch it and return default.
        return JSON.parse(item);
    } catch (error) {
        console.warn(`Failed to get item "${key}" from localStorage:`, error);
        return defaultValue;
    }
};

/**
 * Stores an item in localStorage as a JSON string
 * 
 * WHAT IT DOES:
 * Converts a JavaScript value to JSON and stores it in localStorage.
 * 
 * WHY WE NEED IT:
 * Prevents you from having to write JSON.stringify() everywhere.
 * Also provides consistent error handling.
 * 
 * @param {string} key - The localStorage key to set
 * @param {*} value - The value to store (will be JSON stringified)
 * @returns {boolean} True if successful, false if failed
 * 
 * @example
 * setItem(STORAGE_KEYS.USERS, [{ id: 1, name: 'Alice' }]);
 */
export const setItem = (key, value) => {
    try {
        // JUNIOR DEV NOTE: Why JSON.stringify?
        // localStorage only stores strings. JSON.stringify converts
        // objects/arrays to strings. JSON.parse (in getItem) converts back.
        const serialized = JSON.stringify(value);
        localStorage.setItem(key, serialized);
        return true;
    } catch (error) {
        // JUNIOR DEV NOTE: When does this fail?
        // 1. localStorage is full (usually 5-10MB limit)
        // 2. Private browsing mode in some browsers
        // 3. Value contains circular references (can't be JSON stringified)
        console.error(`Failed to set item "${key}" in localStorage:`, error);
        return false;
    }
};

/**
 * Removes an item from localStorage
 * 
 * @param {string} key - The localStorage key to remove
 * @returns {boolean} True if successful, false if failed
 */
export const removeItem = (key) => {
    try {
        localStorage.removeItem(key);
        return true;
    } catch (error) {
        console.error(`Failed to remove item "${key}" from localStorage:`, error);
        return false;
    }
};

/**
 * Clears all items from localStorage
 * 
 * JUNIOR DEV NOTE: Use with caution!
 * This removes EVERYTHING from localStorage, including data from other
 * apps on the same domain. Usually you want to remove specific keys instead.
 * 
 * @returns {boolean} True if successful, false if failed
 */
export const clearAll = () => {
    try {
        localStorage.clear();
        return true;
    } catch (error) {
        console.error('Failed to clear localStorage:', error);
        return false;
    }
};

/**
 * Checks if a key exists in localStorage
 * 
 * WHAT IT DOES:
 * Returns true if the key exists, false otherwise.
 * 
 * WHY WE NEED IT:
 * Sometimes you need to know if a key exists without retrieving its value.
 * For example, to show a "first time user" tutorial.
 * 
 * @param {string} key - The localStorage key to check
 * @returns {boolean} True if key exists, false otherwise
 */
export const hasItem = (key) => {
    return localStorage.getItem(key) !== null;
};

/**
 * Gets all keys in localStorage that match a prefix
 * 
 * WHAT IT DOES:
 * Returns an array of all localStorage keys that start with the given prefix.
 * 
 * WHY WE NEED IT:
 * Useful for finding all user tokens (which are stored as "google_token_1", 
 * "google_token_2", etc.) or cleaning up old data.
 * 
 * HOW IT WORKS:
 * 1. Get all keys from localStorage (it's like a big key-value store)
 * 2. Filter to only keys that start with our prefix
 * 3. Return the filtered list
 * 
 * @param {string} prefix - The prefix to search for
 * @returns {string[]} Array of matching keys
 * 
 * @example
 * const tokenKeys = getKeysByPrefix('google_token_');
 * // Returns: ['google_token_1', 'google_token_2', 'google_token_3']
 */
export const getKeysByPrefix = (prefix) => {
    const keys = [];

    // JUNIOR DEV NOTE: Why this loop syntax?
    // localStorage doesn't have a .forEach() method. It's array-like but not
    // a real array. We use a for loop with localStorage.length to iterate.
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(prefix)) {
            keys.push(key);
        }
    }

    return keys;
};

/**
 * Gets the size of localStorage in bytes
 * 
 * WHAT IT DOES:
 * Calculates how much space localStorage is using.
 * 
 * WHY WE NEED IT:
 * LocalStorage has a size limit (usually 5-10MB). This helps debug
 * "quota exceeded" errors by showing how much space you're using.
 * 
 * HOW IT WORKS:
 * 1. Loop through all keys in localStorage
 * 2. Add up the length of each key + value
 * 3. Multiply by 2 (JavaScript strings are UTF-16, 2 bytes per character)
 * 
 * @returns {number} Size in bytes
 */
export const getStorageSize = () => {
    let totalSize = 0;

    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
            const value = localStorage.getItem(key) || '';
            // JUNIOR DEV NOTE: Why multiply by 2?
            // JavaScript uses UTF-16 encoding where each character is 2 bytes.
            // So a 10-character string takes 20 bytes.
            totalSize += (key.length + value.length) * 2;
        }
    }

    return totalSize;
};

/**
 * Gets storage size in a human-readable format
 * 
 * @returns {string} Size formatted as "X KB" or "X MB"
 * 
 * @example
 * getStorageSizeFormatted() // Returns: "2.5 MB"
 */
export const getStorageSizeFormatted = () => {
    const bytes = getStorageSize();
    const kb = bytes / 1024;
    const mb = kb / 1024;

    if (mb >= 1) {
        return `${mb.toFixed(2)} MB`;
    } else {
        return `${kb.toFixed(2)} KB`;
    }
};

// ============================================================================
// TYPED STORAGE HELPERS
// ============================================================================
/**
 * These functions provide type-safe access to specific storage keys.
 * They use the generic getItem/setItem functions but with predefined keys.
 * 
 * JUNIOR DEV NOTE: Why create these wrapper functions?
 * 1. Prevents typos in storage keys (you can't mistype a function name)
 * 2. Provides better autocomplete in your IDE
 * 3. Makes it clear what data is stored where
 * 4. Easier to refactor (change the key in one place)
 */

export const getUsersFromStorage = () => getItem(STORAGE_KEYS.USERS, []);
export const setUsersInStorage = (users) => setItem(STORAGE_KEYS.USERS, users);

export const getCalendarsFromStorage = () => getItem(STORAGE_KEYS.CALENDARS, {});
export const setCalendarsInStorage = (calendars) => setItem(STORAGE_KEYS.CALENDARS, calendars);

export const getPhotosFromStorage = () => getItem(STORAGE_KEYS.PHOTOS, {});
export const setPhotosInStorage = (photos) => setItem(STORAGE_KEYS.PHOTOS, photos);

export const getLastUserIdFromStorage = () => getItem(STORAGE_KEYS.LAST_USER_ID, null);
export const setLastUserIdInStorage = (userId) => setItem(STORAGE_KEYS.LAST_USER_ID, userId);

/**
 * Gets a Google token for a specific user
 * 
 * JUNIOR DEV NOTE: Why a separate function for tokens?
 * Tokens are stored with dynamic keys: "google_token_1", "google_token_2", etc.
 * This function builds the key dynamically based on the user ID.
 * 
 * @param {number} userId - The user ID
 * @returns {string|null} The access token or null if not found
 */
export const getGoogleToken = (userId) => {
    const key = `${STORAGE_KEYS.GOOGLE_TOKEN_PREFIX}${userId}`;
    return getItem(key, null);
};

/**
 * Sets a Google token for a specific user
 * 
 * @param {number} userId - The user ID
 * @param {string} token - The access token to store
 * @returns {boolean} True if successful
 */
export const setGoogleToken = (userId, token) => {
    const key = `${STORAGE_KEYS.GOOGLE_TOKEN_PREFIX}${userId}`;
    return setItem(key, token);
};

/**
 * Removes a Google token for a specific user
 * 
 * @param {number} userId - The user ID
 * @returns {boolean} True if successful
 */
export const removeGoogleToken = (userId) => {
    const key = `${STORAGE_KEYS.GOOGLE_TOKEN_PREFIX}${userId}`;
    return removeItem(key);
};

/**
 * Gets all Google tokens for all users
 * 
 * WHAT IT DOES:
 * Finds all stored Google tokens and returns them as an object
 * where keys are user IDs and values are tokens.
 * 
 * HOW IT WORKS:
 * 1. Find all keys that start with "google_token_"
 * 2. Extract the user ID from each key
 * 3. Get the token value for each key
 * 4. Build an object: { userId: token }
 * 
 * @returns {Object} Object mapping user IDs to tokens
 * 
 * @example
 * getAllGoogleTokens()
 * // Returns: { "1": "token123", "2": "token456" }
 */
export const getAllGoogleTokens = () => {
    const tokenKeys = getKeysByPrefix(STORAGE_KEYS.GOOGLE_TOKEN_PREFIX);
    const tokens = {};

    tokenKeys.forEach(key => {
        // Extract user ID from key (e.g., "google_token_1" -> "1")
        const userId = key.replace(STORAGE_KEYS.GOOGLE_TOKEN_PREFIX, '');
        const token = getItem(key, null);
        if (token) {
            tokens[userId] = token;
        }
    });

    return tokens;
};
