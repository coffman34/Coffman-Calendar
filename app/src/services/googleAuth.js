/**
 * @fileoverview Google OAuth 2.0 authentication service
 * @module services/googleAuth
 * 
 * EDUCATIONAL NOTES FOR JUNIOR DEVELOPERS:
 * 
 * WHY THIS FILE EXISTS:
 * Google APIs require OAuth 2.0 authentication. This is a standard protocol where:
 * 1. User clicks "Connect Google Account"
 * 2. We redirect them to Google's login page
 * 3. User grants permission
 * 4. Google redirects back with an access token
 * 5. We use that token to make API requests
 * 
 * This file handles the OAuth flow and token management.
 * 
 * DESIGN PATTERN: Service Layer Pattern
 * This is a service that other parts of the app use to handle authentication.
 * It doesn't know about React components or UI - just authentication logic.
 * 
 * SECURITY NOTE:
 * We use the "Implicit Flow" (token in URL hash) because this is a client-side app.
 * For apps with backends, you'd use the "Authorization Code Flow" which is more secure.
 */

import { OAUTH_SCOPES } from '../utils/constants';
import { storeToken, getToken, clearToken, handleOAuthCallback as _handleTokenCallback } from './utils/tokenManager';

// ============================================================================
// CONFIGURATION
// ============================================================================

/**
 * Google OAuth Client ID
 * 
 * JUNIOR DEV NOTE: What is a Client ID?
 * It's like a username for your app. You get it from Google Cloud Console.
 * It identifies your app to Google's servers.
 * 
 * SECURITY NOTE: Client IDs are public and safe to expose in client-side code.
 * Client SECRETS are private and should NEVER be in client-side code.
 */
const CLIENT_ID = '598776103004-5hfkmr1p2ht8pp1urasdqp4501p0ahvf.apps.googleusercontent.com';

/**
 * OAuth redirect URI
 * 
 * JUNIOR DEV NOTE: Why use window.location.origin?
 * This makes the code work in development (localhost) and production.
 * Google will redirect back to wherever the app is running.
 */
const REDIRECT_URI = window.location.origin;

/**
 * OAuth scopes (permissions) we're requesting
 * 
 * JUNIOR DEV NOTE: What are scopes?
 * They're like permission checkboxes. We're asking for:
 * - Calendar: Read/write calendar events
 * - Tasks: Read/write tasks
 * - Photos: Read photos
 * - Profile: Get user's name and picture
 */
const SCOPES = OAUTH_SCOPES.join(' ');

// ============================================================================
// STATE MANAGEMENT
// ============================================================================

/**
 * Generates a random state string for CSRF protection
 * 
 * WHAT IT DOES:
 * Creates a random string to prevent Cross-Site Request Forgery attacks.
 * 
 * WHY WE NEED IT:
 * Without this, a malicious website could trick users into connecting
 * their Google account to the attacker's app instead of yours.
 * 
 * HOW IT WORKS:
 * 1. We generate a random string and save it
 * 2. We send it to Google in the OAuth URL
 * 3. Google sends it back in the callback
 * 4. We verify it matches what we saved
 * 5. If it doesn't match, someone is trying to attack us
 * 
 * JUNIOR DEV NOTE: Why Math.random().toString(36)?
 * - Math.random() gives us a number like 0.123456
 * - .toString(36) converts it to base-36 (0-9, a-z)
 * - .substring(2, 15) removes "0." and takes 13 characters
 * - Result: a random string like "k3j5h2g9d4f1m"
 * 
 * @returns {string} Random state string
 */
const generateState = () => {
    return Math.random().toString(36).substring(2, 15) +
        Math.random().toString(36).substring(2, 15); // Extra randomness
};

/**
 * Gets the session storage key for OAuth state
 * 
 * @returns {string} Storage key
 */
const getStateKey = () => 'google_oauth_state';

// ============================================================================
// OAUTH FLOW
// ============================================================================

/**
 * Initiates the Google OAuth login flow for a user
 * 
 * WHAT IT DOES:
 * Redirects the user to Google's login page to grant permissions.
 * 
 * WHY WE NEED IT:
 * We can't access Google APIs without the user's permission.
 * This starts the process of getting that permission.
 * 
 * HOW IT WORKS:
 * 1. Generate a random state for security
 * 2. Save state and user ID to sessionStorage
 * 3. Build the Google OAuth URL with all required parameters
 * 4. Redirect the browser to that URL
 * 5. User logs in and grants permissions on Google's site
 * 6. Google redirects back to our app with an access token
 * 
 * @param {number} userId - ID of the user connecting their account
 * 
 * @example
 * // User clicks "Connect Google Account" button
 * initiateGoogleLogin(currentUser.id);
 * // Browser redirects to Google login page
 */
export const initiateGoogleLogin = (userId) => {
    // Generate and save state for CSRF protection
    const nonce = generateState();
    const state = JSON.stringify({ userId, nonce });
    sessionStorage.setItem(getStateKey(), state);

    // Build OAuth URL
    // JUNIOR DEV NOTE: Why use URL and searchParams?
    // It's safer than string concatenation and handles URL encoding automatically.
    const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');

    authUrl.searchParams.set('client_id', CLIENT_ID);
    authUrl.searchParams.set('redirect_uri', REDIRECT_URI);
    authUrl.searchParams.set('response_type', 'token'); // Implicit flow
    authUrl.searchParams.set('scope', SCOPES);
    authUrl.searchParams.set('state', state);
    authUrl.searchParams.set('prompt', 'consent'); // Always show consent screen

    // Redirect to Google
    window.location.href = authUrl.toString();
};

/**
 * Handles the OAuth callback after Google redirects back
 * 
 * WHAT IT DOES:
 * Processes the access token that Google sends back after login.
 * 
 * WHY WE NEED IT:
 * After the user logs in, Google redirects back to our app with the token
 * in the URL hash. We need to extract it, validate it, and save it.
 * 
 * HOW IT WORKS:
 * 1. Check if URL contains OAuth callback parameters
 * 2. Extract access token and state from URL hash
 * 3. Verify state matches what we saved (CSRF protection)
 * 4. Parse user ID from state
 * 5. Save token to localStorage
 * 6. Clean up URL and sessionStorage
 * 
 * SECURITY NOTE: State verification is critical!
 * If we skip this, attackers could trick users into connecting the wrong account.
 * 
 * @returns {Object|null} { userId, accessToken, expiresAt } or null if not a callback
 * 
 * @example
 * // In App.jsx useEffect:
 * const result = handleAuthCallback();
 * if (result) {
 *   console.log(`User ${result.userId} connected their Google account!`);
 * }
 */
export const handleAuthCallback = () => {
    // Check if this is an OAuth callback
    const hash = window.location.hash.substring(1); // Remove leading #
    if (!hash) return null;

    // Parse URL hash parameters
    const params = new URLSearchParams(hash);
    const accessToken = params.get('access_token');
    const state = params.get('state');
    const expiresIn = params.get('expires_in'); // Seconds until expiration

    // Validate required parameters
    if (!accessToken || !state) {
        console.error('OAuth callback missing required parameters');
        return null;
    }

    // SECURITY CHECK: Verify state matches
    // JUNIOR DEV NOTE: This prevents CSRF attacks!
    const savedState = sessionStorage.getItem(getStateKey());
    if (state !== savedState) {
        console.error('OAuth state mismatch - possible CSRF attack!');
        return null;
    }

    // Parse state to get user ID
    let userId;
    try {
        const stateData = JSON.parse(state);
        userId = stateData.userId;
    } catch (error) {
        console.error('Failed to parse OAuth state:', error);
        return null;
    }

    // Calculate token expiration time
    // JUNIOR DEV NOTE: Why calculate expiresAt?
    // Google tells us how long the token is valid (usually 3600 seconds = 1 hour).
    // We save when it expires so we can check later if it's still valid.
    const expiresAt = Date.now() + (parseInt(expiresIn || 3600) * 1000);

    // Save token
    const tokenData = {
        accessToken,
        expiresAt,
    };

    // Store using our token manager utility
    storeToken(userId, JSON.stringify(tokenData));

    // Clean up
    sessionStorage.removeItem(getStateKey());
    window.history.replaceState(null, '', window.location.pathname);

    return {
        userId,
        accessToken,
        expiresAt,
    };
};

// ============================================================================
// TOKEN MANAGEMENT
// ============================================================================

/**
 * Gets a stored access token for a user
 * 
 * WHAT IT DOES:
 * Retrieves the access token from localStorage and checks if it's expired.
 * 
 * WHY WE NEED IT:
 * Before making API requests, we need to get the user's token.
 * We also need to check if it's still valid (not expired).
 * 
 * HOW IT WORKS:
 * 1. Get token data from localStorage
 * 2. Check if it exists
 * 3. Check if it's expired
 * 4. If expired, delete it and return null
 * 5. If valid, return the access token
 * 
 * @param {number} userId - User ID
 * @returns {string|null} Access token or null if not found/expired
 * 
 * @example
 * const token = getStoredToken(currentUser.id);
 * if (token) {
 *   // Make API request with token
 * } else {
 *   // Prompt user to connect their account
 * }
 */
export const getStoredToken = (userId) => {
    const stored = getToken(userId);
    if (!stored) return null;

    try {
        const tokenData = JSON.parse(stored);
        const { accessToken, expiresAt } = tokenData;

        // Check if token is expired
        // JUNIOR DEV NOTE: Why Date.now() > expiresAt?
        // Date.now() is current time in milliseconds.
        // If current time is past expiration time, token is expired.
        if (Date.now() > expiresAt) {
            // Token expired - remove it
            clearToken(userId);
            return null;
        }

        return accessToken;
    } catch (error) {
        console.error('Failed to parse stored token:', error);
        clearToken(userId); // Clear corrupted data
        return null;
    }
};

/**
 * Checks if a user has a valid (non-expired) token
 * 
 * @param {number} userId - User ID
 * @returns {boolean} True if user has a valid token
 */
export const hasValidToken = (userId) => {
    return getStoredToken(userId) !== null;
};

/**
 * Disconnects a user's Google account
 * 
 * WHAT IT DOES:
 * Removes the stored access token, effectively "logging out" the user.
 * 
 * WHY WE NEED IT:
 * Users should be able to disconnect their Google account if they want.
 * 
 * SECURITY NOTE: This only removes the token from our app.
 * To fully revoke access, you'd need to call Google's token revocation API.
 * 
 * @param {number} userId - User ID
 * 
 * @example
 * // User clicks "Disconnect Google Account" button
 * disconnectGoogle(currentUser.id);
 */
export const disconnectGoogle = (userId) => {
    clearToken(userId);

    // FUTURE ENHANCEMENT: Call Google's revocation endpoint
    // This would fully revoke the token on Google's side too.
    // For now, we just remove it from our app.
};

/**
 * Gets the OAuth authorization URL for a user
 * 
 * WHAT IT DOES:
 * Builds the Google OAuth URL without redirecting.
 * 
 * WHY WE NEED IT:
 * Useful for testing or if you want to open the OAuth page in a new tab
 * instead of redirecting the current page.
 * 
 * @param {number} userId - User ID
 * @returns {string} OAuth URL
 */
export const getAuthUrl = (userId) => {
    const nonce = generateState();
    const state = JSON.stringify({ userId, nonce });

    const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    authUrl.searchParams.set('client_id', CLIENT_ID);
    authUrl.searchParams.set('redirect_uri', REDIRECT_URI);
    authUrl.searchParams.set('response_type', 'token');
    authUrl.searchParams.set('scope', SCOPES);
    authUrl.searchParams.set('state', state);
    authUrl.searchParams.set('prompt', 'consent');

    return authUrl.toString();
};
