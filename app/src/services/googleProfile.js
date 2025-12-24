/**
 * @fileoverview Google Profile API service
 * @module services/googleProfile
 * 
 * EDUCATIONAL NOTES FOR JUNIOR DEVELOPERS:
 * 
 * WHY THIS FILE EXISTS:
 * When users connect their Google account, we want to show their name and
 * profile picture. This makes the app feel more personal and helps users
 * know which account is connected.
 * 
 * DESIGN PATTERN: Service Layer Pattern
 * Simple wrapper around Google's userinfo API.
 */

import { createGoogleApiClient } from './api/GoogleApiClient';
import { API_ENDPOINTS } from '../utils/constants';

/**
 * Fetches Google user profile information
 * 
 * WHAT IT DOES:
 * Gets the user's name, email, and profile picture from Google.
 * 
 * WHY WE NEED IT:
 * To personalize the UI and show which Google account is connected.
 * 
 * HOW IT WORKS:
 * 1. Make GET request to Google's userinfo endpoint
 * 2. Google returns user's profile data
 * 3. We extract the fields we need (name, picture, email)
 * 4. Return simplified profile object
 * 
 * SECURITY NOTE: This only works if the user granted the "userinfo.profile" scope.
 * 
 * @param {string} accessToken - OAuth2 access token
 * @returns {Promise<Object>} User profile { name, picture, email }
 * 
 * @example
 * const profile = await fetchGoogleProfile(userToken);
 * console.log(`Hello, ${profile.name}!`);
 * // Display profile.picture in an <img> tag
 */
export const fetchGoogleProfile = async (accessToken) => {
    const client = createGoogleApiClient(accessToken);

    try {
        const data = await client.get(API_ENDPOINTS.GOOGLE_PROFILE);

        // Extract and return only the fields we need
        // JUNIOR DEV NOTE: Why not return the whole data object?
        // Google returns many fields we don't use (locale, verified_email, etc.).
        // Returning only what we need makes the code clearer and uses less memory.
        return {
            name: data.name || 'Unknown User',
            picture: data.picture || null,
            email: data.email || '',
        };
    } catch (error) {
        console.error('Failed to fetch Google profile:', error);
        throw new Error('Could not load profile information.');
    }
};

/**
 * Checks if a user has granted profile access
 * 
 * WHAT IT DOES:
 * Attempts to fetch profile to verify the token has profile scope.
 * 
 * WHY WE NEED IT:
 * Sometimes tokens don't have all the scopes we need.
 * This helps us detect that and prompt for re-authentication.
 * 
 * @param {string} accessToken - OAuth2 access token
 * @returns {Promise<boolean>} True if profile access is granted
 */
export const hasProfileAccess = async (accessToken) => {
    try {
        await fetchGoogleProfile(accessToken);
        return true;
    } catch {
        return false;
    }
};
