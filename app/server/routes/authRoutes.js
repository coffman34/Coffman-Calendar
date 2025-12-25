/**
 * @fileoverview Backend routes for Google OAuth authentication
 * @module routes/authRoutes
 * 
 * EDUCATIONAL NOTES FOR JUNIOR DEVELOPERS:
 * 
 * WHY THIS FILE EXISTS:
 * This handles the "Authorization Code Flow" which is more secure than the "Implicit Flow"
 * we were using on the frontend.
 * 
 * HOW IT WORKS:
 * 1. Frontend sends an "Auth Code" to POST /callback
 * 2. We exchange that code for an Access Token and a Refresh Token
 * 3. We save the Refresh Token securely (in a file here, but DB in pro apps)
 * 4. When Access Token expires, Frontend calls GET /refresh/:userId
 * 5. We use the saved Refresh Token to get a fresh Access Token
 */

import express from 'express';
import { google } from 'googleapis';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Storage path for tokens (secured in .gitignore)
const TOKENS_FILE = path.join(__dirname, '../storage/auth_tokens.json');

// Ensure storage file exists
fs.ensureFileSync(TOKENS_FILE);
if (fs.readFileSync(TOKENS_FILE, 'utf8').length === 0) {
    fs.writeJsonSync(TOKENS_FILE, {});
}

/**
 * Helper to get OAuth2 Client
 * 
 * JUNIOR DEV NOTE: We recreate this for every request to ensure
 * clean state, but you could also cache it.
 */
const getOAuthClient = (redirectUriOverride) => {
    // Load secrets dynamically
    const secretsPath = path.join(__dirname, '../client_secret.json');
    if (!fs.existsSync(secretsPath)) {
        throw new Error('client_secret.json is missing on server!');
    }

    const secrets = fs.readJsonSync(secretsPath);
    const { client_id, client_secret, redirect_uris } = secrets.web || secrets.installed;

    // Use provided URI, or find localhost:5173, or fallback to first one
    let redirectUri = redirectUriOverride;

    if (!redirectUri) {
        redirectUri = redirect_uris?.find(u => u.includes('5173')) || (redirect_uris ? redirect_uris[0] : 'http://localhost:5173');
    }

    return new google.auth.OAuth2(
        client_id,
        client_secret,
        redirectUri
    );
};

// ============================================================================
// ROUTES
// ============================================================================

/**
 * POST /api/auth/callback
 * Exchanges auth code for tokens
 */
router.post('/callback', async (req, res) => {
    try {
        const { code, userId, redirect_uri } = req.body;

        if (!code || !userId) {
            return res.status(400).json({ error: 'Missing code or userId' });
        }

        const oauth2Client = getOAuthClient(redirect_uri); // Pass the URI used by frontend

        // Exchange code for tokens
        const { tokens } = await oauth2Client.getToken(code);

        // Load existing tokens
        const allTokens = fs.readJsonSync(TOKENS_FILE);

        // JUNIOR DEV NOTE: We MUST save the refresh_token.
        // Google only sends it ONCE (first time user consents).
        // If it's missing in this response (user re-connected without revoking),
        // we try to keep the old one if it exists.
        const refreshToken = tokens.refresh_token || (allTokens[userId] ? allTokens[userId].refresh_token : null);

        // Save to reliable storage
        allTokens[userId] = {
            ...tokens,
            refresh_token: refreshToken, // Ensure we persist it
            updated_at: new Date().toISOString()
        };

        fs.writeJsonSync(TOKENS_FILE, allTokens, { spaces: 2 });

        console.log(`✅ Tokens saved for user ${userId}`);

        res.json({
            success: true,
            tokens: {
                access_token: tokens.access_token,
                expiry_date: tokens.expiry_date
            }
        });

    } catch (error) {
        console.error('❌ Auth Callback Error:', error);

        // Log to file for debugging
        try {
            const logPath = path.join(__dirname, '../server_error.log');
            const logMsg = `${new Date().toISOString()} - Auth Error: ${error.message}\nStack: ${error.stack}\nDetails: ${JSON.stringify(error.response?.data || {})}\n\n`;
            fs.appendFileSync(logPath, logMsg);
        } catch (logErr) {
            console.error('Failed to write to error log:', logErr);
        }

        res.status(500).json({
            error: 'Failed to exchange token',
            details: error.message
        });
    }
});

/**
 * GET /api/auth/refresh/:userId
 * Uses stored refresh token to get a new access token
 */
router.get('/refresh/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        const allTokens = fs.readJsonSync(TOKENS_FILE);
        const userTokens = allTokens[userId];

        if (!userTokens || !userTokens.refresh_token) {
            return res.status(401).json({ error: 'No refresh token found. Please reconnect account.' });
        }

        const oauth2Client = getOAuthClient();

        // Set the refresh token on the client
        oauth2Client.setCredentials({
            refresh_token: userTokens.refresh_token
        });

        // Request new access token
        const { credentials } = await oauth2Client.refreshAccessToken();

        // Update stored tokens with new access token (and new expiry)
        allTokens[userId] = {
            ...userTokens,
            ...credentials, // Merges in new access_token & expiry_date
            updated_at: new Date().toISOString()
        };

        fs.writeJsonSync(TOKENS_FILE, allTokens, { spaces: 2 });

        console.log(`🔄 Token refreshed for user ${userId}`);

        res.json({
            access_token: credentials.access_token,
            expiry_date: credentials.expiry_date
        });

    } catch (error) {
        console.error('❌ Token Refresh Error:', error);
        res.status(401).json({
            error: 'Failed to refresh token',
            details: error.message
        });
    }
});

export default router;
