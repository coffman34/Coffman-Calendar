/**
 * @fileoverview Google OAuth 2.0 authentication service (Authorization Code Flow)
 * @module services/googleAuth
 * 
 * EDUCATIONAL NOTES FOR JUNIOR DEVELOPERS:
 * 
 * MAJOR REFACTOR:
 * We switched from "Implicit Flow" (unsafe, no refresh tokens) to 
 * "Authorization Code Flow" (safe, supports refresh tokens).
 * 
 * HOW IT NOW WORKS:
 * 1. User logs in -> Google gives us a "code" (one-time use password)
 * 2. We send "code" to OUR backend
 * 3. Backend exchanges "code" for Access + Refresh Tokens
 * 4. Backend saves Refresh Token securely
 * 5. Backend sends Access Token back to us
 */

import { OAUTH_SCOPES } from '../utils/constants';
import { storeToken, getToken, clearToken, handleOAuthCallback as _handleTokenCallback } from './utils/tokenManager';

// ============================================================================
// CONFIGURATION
// ============================================================================

const CLIENT_ID = '598776103004-5hfkmr1p2ht8pp1urasdqp4501p0ahvf.apps.googleusercontent.com';
const REDIRECT_URI = window.location.origin;
const SCOPES = OAUTH_SCOPES.join(' ');
// JUNIOR DEV NOTE: Use relative path so nginx proxy works in production.
// In dev, Vite's proxy config (vite.config.js) forwards /api to localhost:3001.
const BACKEND_URL = '/api/auth';

// ============================================================================
// STATE MANAGEMENT
// ============================================================================

const generateState = () => {
    return Math.random().toString(36).substring(2, 15) +
        Math.random().toString(36).substring(2, 15);
};

const getStateKey = () => 'google_oauth_state';

// ============================================================================
// OAUTH FLOW
// ============================================================================

/**
 * Initiates the Google OAuth login flow for a user
 */
export const initiateGoogleLogin = (userId) => {
    const nonce = generateState();
    const state = JSON.stringify({ userId, nonce });
    sessionStorage.setItem(getStateKey(), state);

    const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');

    authUrl.searchParams.set('client_id', CLIENT_ID);
    authUrl.searchParams.set('redirect_uri', REDIRECT_URI);

    // * CRITICAL CHANGE *
    // "code" = Authorization Code Flow (Server-side)
    // "offline" = Request Refresh Token (so we can stay logged in forever)
    // "consent" = Force Google to show the allow screen (needed to get refresh token)
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('access_type', 'offline');
    authUrl.searchParams.set('scope', SCOPES);
    authUrl.searchParams.set('state', state);
    authUrl.searchParams.set('prompt', 'consent');

    window.location.href = authUrl.toString();
};

/**
 * Handles the OAuth callback after Google redirects back
 */
export const handleAuthCallback = async () => {
    // Check for "code" query param (Auth Code Flow) 
    // instead of hash (Implicit Flow)
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const state = params.get('state');

    if (!code || !state) return null;

    // SECURITY CHECK: Verify state matches
    const savedState = sessionStorage.getItem(getStateKey());
    if (state !== savedState) {
        console.error('OAuth state mismatch - possible CSRF attack!');
        return null;
    }

    let userId;
    try {
        const stateData = JSON.parse(state);
        userId = stateData.userId;
    } catch (error) {
        console.error('Failed to parse OAuth state:', error);
        return null;
    }

    console.log('🔄 Exchanging auth code for tokens with backend...');

    try {
        // Exchange code for tokens via OUR backend
        const response = await fetch(`${BACKEND_URL}/callback`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                code,
                userId,
                redirect_uri: REDIRECT_URI // Tell backend which URI we used
            })
        });

        if (!response.ok) {
            throw new Error(`Backend exchange failed: ${response.statusText}`);
        }

        const data = await response.json();

        // Save the ACCESS token locally
        // (The Refresh token is safely stored on the backend)
        const tokenData = {
            accessToken: data.tokens.access_token,
            expiresAt: data.tokens.expiry_date
        };

        storeToken(userId, JSON.stringify(tokenData));

        // Clean up
        sessionStorage.removeItem(getStateKey());
        window.history.replaceState(null, '', window.location.pathname);

        return {
            userId,
            accessToken: data.tokens.access_token,
            expiresAt: data.tokens.expiry_date
        };

    } catch (error) {
        console.error('❌ Failed to complete auth flow:', error);
        return null;
    }
};

// ============================================================================
// TOKEN MANAGEMENT
// ============================================================================

/**
 * Gets a stored access token for a user, attempting refresh if needed
 */
export const getStoredToken = async (userId) => {
    const stored = getToken(userId);
    if (!stored) return null;

    try {
        let tokenData = JSON.parse(stored);

        // 1. Check if token is valid
        if (Date.now() < tokenData.expiresAt) {
            return tokenData.accessToken;
        }

        // 2. Token is expired! Try to refresh via backend
        console.log(`⏰ Token expired for user ${userId}, refreshing...`);

        try {
            const response = await fetch(`${BACKEND_URL}/refresh/${userId}`);

            if (!response.ok) {
                if (response.status === 401) {
                    console.warn(`Refresh failed - user ${userId} must re-login`);
                    clearToken(userId);
                    return null;
                }
                throw new Error('Refresh request failed');
            }

            const freshData = await response.json();

            // Save new access token
            tokenData = {
                accessToken: freshData.access_token,
                expiresAt: freshData.expiry_date
            };
            storeToken(userId, JSON.stringify(tokenData));

            console.log(`✅ Token refreshed successfully for user ${userId}`);
            return freshData.access_token;

        } catch (refreshError) {
            console.error('Critical refresh failure:', refreshError);
            // Don't clear token immediately on network error, only on 401
            return null;
        }

    } catch (error) {
        console.error('Failed to parse stored token:', error);
        clearToken(userId);
        return null;
    }
};

export const hasValidToken = (userId) => {
    // Note: This is synchronous/naive. Use getStoredToken for actual api calls.
    return getToken(userId) !== null;
};

export const disconnectGoogle = (userId) => {
    clearToken(userId);
};
