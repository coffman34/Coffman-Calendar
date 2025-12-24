/**
 * @fileoverview Token management utilities for Google OAuth
 * @module services/utils/tokenManager
 * 
 * EDUCATIONAL NOTES FOR JUNIOR DEVELOPERS:
 * 
 * WHY THIS FILE EXISTS:
 * OAuth tokens are sensitive and need special handling:
 * 1. Secure storage (localStorage in our case)
 * 2. Expiration checking
 * 3. Automatic refresh (when possible)
 * 4. Multi-user support (different tokens for different users)
 * 
 * Centralizing token management prevents security bugs and makes
 * it easy to change storage mechanisms later (e.g., move to a backend).
 * 
 * DESIGN PATTERN: Repository Pattern
 * We abstract the storage mechanism so the rest of the app doesn't
 * need to know WHERE or HOW tokens are stored.
 */

import { getGoogleToken, setGoogleToken, removeGoogleToken, getAllGoogleTokens } from '../../utils/storage';

/**
 * Stores a Google OAuth token for a user
 * 
 * WHAT IT DOES:
 * Saves an access token to localStorage, associated with a user ID.
 * 
 * WHY WE NEED IT:
 * Each family member has their own Google account and token.
 * We need to store multiple tokens and retrieve the right one.
 * 
 * @param {number} userId - User ID
 * @param {string} accessToken - OAuth2 access token
 * @returns {boolean} True if successful
 * 
 * @example
 * storeToken(1, 'ya29.a0AfH6SMB...')
 */
export const storeToken = (userId, accessToken) => {
    if (!userId || !accessToken) {
        console.error('User ID and access token are required');
        return false;
    }

    return setGoogleToken(userId, accessToken);
};

/**
 * Retrieves a Google OAuth token for a user
 * 
 * @param {number} userId - User ID
 * @returns {string|null} Access token or null if not found
 */
export const getToken = (userId) => {
    if (!userId) {
        console.error('User ID is required');
        return null;
    }

    return getGoogleToken(userId);
};

/**
 * Removes a Google OAuth token for a user
 * 
 * WHAT IT DOES:
 * Deletes the stored token (used when user disconnects their account).
 * 
 * @param {number} userId - User ID
 * @returns {boolean} True if successful
 */
export const clearToken = (userId) => {
    if (!userId) {
        console.error('User ID is required');
        return false;
    }

    return removeGoogleToken(userId);
};

/**
 * Checks if a user has a stored token
 * 
 * @param {number} userId - User ID
 * @returns {boolean} True if user has a token
 */
export const hasToken = (userId) => {
    return getToken(userId) !== null;
};

/**
 * Gets all stored tokens
 * 
 * WHAT IT DOES:
 * Returns an object mapping user IDs to their tokens.
 * 
 * WHY WE NEED IT:
 * Useful for initializing the app state with all connected users.
 * 
 * @returns {Object} { userId: token, ... }
 */
export const getAllTokens = () => {
    return getAllGoogleTokens();
};

/**
 * Validates that a token exists and is a non-empty string
 * 
 * JUNIOR DEV NOTE: This is basic validation.
 * We can't check if the token is actually valid without making an API call.
 * 
 * @param {string} token - Token to validate
 * @returns {boolean} True if token appears valid
 */
export const isValidToken = (token) => {
    return typeof token === 'string' && token.length > 0;
};

/**
 * Extracts user ID from OAuth callback URL
 * 
 * WHAT IT DOES:
 * After Google OAuth redirect, the URL contains the access token and state.
 * The state parameter contains our user ID.
 * 
 * HOW IT WORKS:
 * OAuth callback URL looks like:
 * http://localhost/#access_token=ya29...&state=userId_1
 * 
 * We parse the hash fragment to extract the token and user ID.
 * 
 * @returns {Object|null} { userId, accessToken } or null if not a callback
 */
export const parseOAuthCallback = () => {
    // JUNIOR DEV NOTE: Why check window.location.hash?
    // Google OAuth uses the "implicit flow" which returns tokens in the URL hash.
    // The hash is everything after the # in the URL.
    const hash = window.location.hash;

    if (!hash || !hash.includes('access_token')) {
        return null; // Not an OAuth callback
    }

    // Parse hash into key-value pairs
    const params = new URLSearchParams(hash.substring(1)); // Remove leading #
    const accessToken = params.get('access_token');
    const state = params.get('state');

    if (!accessToken || !state) {
        console.error('Invalid OAuth callback: missing token or state');
        return null;
    }

    // Extract user ID from state parameter
    // State format: "userId_123"
    const userId = state.replace('userId_', '');

    if (!userId) {
        console.error('Invalid OAuth callback: could not extract user ID');
        return null;
    }

    return {
        userId: Number(userId),
        accessToken,
    };
};

/**
 * Clears OAuth callback parameters from URL
 * 
 * WHAT IT DOES:
 * After processing the OAuth callback, we remove the token from the URL.
 * 
 * WHY WE NEED IT:
 * 1. Security: Don't leave tokens visible in the URL
 * 2. UX: Clean URL looks better
 * 3. Functionality: Prevents re-processing the callback on refresh
 * 
 * @returns {void}
 */
export const clearOAuthCallback = () => {
    // JUNIOR DEV NOTE: Why use replaceState instead of pushState?
    // replaceState modifies the current history entry instead of creating a new one.
    // This prevents the back button from going back to the callback URL.
    if (window.location.hash) {
        window.history.replaceState(null, '', window.location.pathname);
    }
};

/**
 * Handles the complete OAuth callback flow
 * 
 * WHAT IT DOES:
 * 1. Parse the callback URL
 * 2. Store the token
 * 3. Clean up the URL
 * 
 * WHY WE NEED IT:
 * Combines all callback handling logic in one convenient function.
 * 
 * @returns {Object|null} { userId, accessToken } or null if not a callback
 */
export const handleOAuthCallback = () => {
    const result = parseOAuthCallback();

    if (!result) {
        return null;
    }

    // Store the token
    storeToken(result.userId, result.accessToken);

    // Clean up URL
    clearOAuthCallback();

    return result;
};
