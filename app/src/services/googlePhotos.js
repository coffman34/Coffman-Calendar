/**
 * @fileoverview Google Photos Picker API service
 * @module services/googlePhotos
 * 
 * EDUCATIONAL NOTES FOR JUNIOR DEVELOPERS:
 * 
 * WHY THIS FILE EXISTS:
 * Google Photos has a special "Picker API" that lets users select photos
 * from their library. Unlike other Google APIs, this one requires:
 * 1. Creating a "session" (temporary workspace)
 * 2. Opening the picker UI (Google's photo selector)
 * 3. Polling to check when user is done selecting
 * 4. Downloading selected photos to our local server
 * 
 * This file handles the entire photo selection and download workflow.
 * 
 * DESIGN PATTERN: Service Layer + Async Workflow Pattern
 * We manage a multi-step asynchronous process (session → pick → download).
 */

import { createGoogleApiClient } from './api/GoogleApiClient';
import { API_ENDPOINTS } from '../utils/constants';

// Google Photos Picker API endpoint
const PICKER_API = 'https://photospicker.googleapis.com/v1';

/**
 * Creates a Google Photos Picker session
 * 
 * WHAT IT DOES:
 * Initializes a temporary "session" for photo picking.
 * 
 * WHY WE NEED IT:
 * The Photos Picker API requires a session ID to track the user's selection.
 * Think of it like opening a shopping cart before adding items.
 * 
 * HOW IT WORKS:
 * 1. Make POST request to create session
 * 2. Google returns a session ID and picker URL
 * 3. We use the session ID to poll for results later
 * 
 * @param {string} accessToken - OAuth2 access token
 * @returns {Promise<Object>} Session data with ID and picker URL
 * 
 * @example
 * const session = await createPickerSession(userToken);
 * // Returns: { id: "session123", pickerUri: "https://..." }
 */
export const createPickerSession = async (accessToken) => {
    const client = createGoogleApiClient(accessToken);

    try {
        const data = await client.post(`${PICKER_API}/sessions`, {});
        return data;
    } catch (error) {
        console.error('Failed to create picker session:', error);
        throw new Error('Could not start photo picker. Please try again.');
    }
};

/**
 * Polls a picker session to check if user finished selecting
 * 
 * WHAT IT DOES:
 * Checks if the user has finished selecting photos in the picker UI.
 * 
 * WHY WE NEED IT:
 * The picker opens in a popup/iframe. We need to poll (repeatedly check)
 * to know when the user clicks "Done" or "Cancel".
 * 
 * HOW IT WORKS:
 * 1. Make GET request to session endpoint
 * 2. Check the session state
 * 3. If state is "PICKED", user is done
 * 4. If state is "ACTIVE", user is still selecting
 * 5. If state is "CANCELLED", user cancelled
 * 
 * JUNIOR DEV NOTE: Why polling instead of callbacks?
 * The picker runs in a separate window/iframe. We can't get a direct callback.
 * Polling is the standard approach for this API.
 * 
 * @param {string} accessToken - OAuth2 access token
 * @param {string} sessionId - Session ID from createPickerSession
 * @returns {Promise<Object>} Session status
 * 
 * @example
 * const status = await pollPickerSession(userToken, sessionId);
 * if (status.pickerState === 'PICKED') {
 *   // User finished selecting!
 * }
 */
export const pollPickerSession = async (accessToken, sessionId) => {
    const client = createGoogleApiClient(accessToken);

    try {
        const data = await client.get(`${PICKER_API}/sessions/${sessionId}`);
        return data;
    } catch (error) {
        console.error('Failed to poll picker session:', error);
        throw new Error('Could not check picker status.');
    }
};

/**
 * Gets selected media items and downloads them to local disk
 * 
 * WHAT IT DOES:
 * After user selects photos, this function:
 * 1. Fetches the list of selected items from Google
 * 2. Downloads each photo/video to our local server
 * 3. Returns metadata about the downloaded files
 * 
 * WHY WE NEED IT:
 * Google Photos URLs expire after a few hours. We need to download
 * the actual files to our server for permanent storage.
 * 
 * HOW IT WORKS:
 * 1. Get list of selected media items from session
 * 2. For each item:
 *    a. Build download URL (with size parameters)
 *    b. Send to our backend to download
 *    c. For videos, also download a thumbnail image
 * 3. Return array of downloaded file metadata
 * 
 * JUNIOR DEV NOTE: Why download to backend instead of directly?
 * - CORS: Google's servers don't allow direct browser downloads
 * - Storage: Files need to be saved to disk, which browsers can't do
 * - Processing: Backend can resize, optimize, etc.
 * 
 * @param {string} accessToken - OAuth2 access token
 * @param {string} sessionId - Session ID
 * @param {number} ownerId - User ID who owns these photos
 * @returns {Promise<Array>} Array of downloaded media items
 * 
 * @example
 * const items = await getPickedMediaItems(token, sessionId, userId);
 * // Returns: [{ id, type, url, thumbnail, mimeType, filename }, ...]
 */
export const getPickedMediaItems = async (accessToken, sessionId, ownerId) => {
    const client = createGoogleApiClient(accessToken);

    // Fetch selected media items
    let items;
    try {
        const data = await client.get(`${PICKER_API}/mediaItems`, { sessionId });
        items = data.mediaItems || [];
    } catch (error) {
        console.error('Failed to fetch picked media items:', error);
        throw new Error('Could not retrieve selected photos.');
    }

    // Download each item to local storage
    const processedItems = await Promise.all(items.map(async (item) => {
        try {
            return await downloadMediaItem(item, accessToken, ownerId);
        } catch (error) {
            console.error(`Failed to download item ${item.id}:`, error);
            return null; // Skip failed downloads
        }
    }));

    // Filter out failed downloads
    return processedItems.filter(Boolean);
};

/**
 * Downloads a single media item to local storage
 * 
 * WHAT IT DOES:
 * Downloads a photo or video from Google Photos to our local server.
 * 
 * HOW IT WORKS:
 * 1. Extract base URL from Google Photos item
 * 2. Add size/quality parameters to URL
 * 3. Send download request to our backend
 * 4. For videos, also download a thumbnail
 * 5. Return metadata about the downloaded file
 * 
 * JUNIOR DEV NOTE: What are those =w1920-h1080 parameters?
 * Google Photos lets you request specific sizes by adding parameters:
 * - =w1920-h1080: Photo at 1920x1080 resolution
 * - =dv: Video download
 * - =w400-h400: Small thumbnail
 * 
 * @param {Object} item - Media item from Google Photos API
 * @param {string} accessToken - OAuth2 access token
 * @param {number} ownerId - User ID
 * @returns {Promise<Object>} Downloaded item metadata
 * @private
 */
const downloadMediaItem = async (item, accessToken, ownerId) => {
    // Extract and normalize base URL
    let baseUrl = item.mediaFile?.baseUrl || '';
    if (baseUrl && !baseUrl.startsWith('http')) {
        baseUrl = `https://lh3.googleusercontent.com/${baseUrl}`;
    }

    // Determine file type
    const mimeType = item.mediaFile?.mimeType || 'image/jpeg';
    const isVideo = mimeType.startsWith('video/');

    // Build filename
    const ext = isVideo ? 'mp4' : 'jpg';
    const filename = `${item.id}.${ext}`;

    // Build download URL with size parameters
    const downloadUrl = isVideo
        ? `${baseUrl}=dv` // Video download
        : `${baseUrl}=w1920-h1080`; // High-res photo

    // Download main file via backend
    const downloadRes = await fetch('/api/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            url: downloadUrl,
            filename: filename,
            ownerId: ownerId,
            mimeType: mimeType,
            accessToken: accessToken,
        }),
    });

    if (!downloadRes.ok) {
        throw new Error(`Download failed: ${await downloadRes.text()}`);
    }

    const result = await downloadRes.json();
    let thumbnail = result.url; // For photos, thumbnail is same as main

    // For videos, download separate thumbnail
    if (isVideo) {
        thumbnail = await downloadVideoThumbnail(item.id, baseUrl, accessToken, ownerId);
    }

    return {
        id: item.id,
        type: isVideo ? 'video' : 'photo',
        url: result.url,
        thumbnail: thumbnail,
        mimeType: mimeType,
        filename: filename,
        baseUrl: baseUrl,
    };
};

/**
 * Downloads a thumbnail image for a video
 * 
 * WHAT IT DOES:
 * Videos need a separate thumbnail image for display in galleries.
 * 
 * @param {string} itemId - Media item ID
 * @param {string} baseUrl - Base Google Photos URL
 * @param {string} accessToken - OAuth2 access token
 * @param {number} ownerId - User ID
 * @returns {Promise<string>} Thumbnail URL or fallback to main URL
 * @private
 */
const downloadVideoThumbnail = async (itemId, baseUrl, accessToken, ownerId) => {
    const thumbFilename = `${itemId}_thumb.jpg`;
    const thumbUrl = `${baseUrl}=w400-h400`; // Small thumbnail

    try {
        const thumbRes = await fetch('/api/download', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                url: thumbUrl,
                filename: thumbFilename,
                ownerId: ownerId,
                mimeType: 'image/jpeg',
                accessToken: accessToken,
            }),
        });

        if (thumbRes.ok) {
            const thumbResult = await thumbRes.json();
            return thumbResult.url;
        }
    } catch (error) {
        console.warn(`Failed to download thumbnail for ${itemId}:`, error);
    }

    // Fallback to main URL if thumbnail download fails
    return `${baseUrl}=w400-h400`;
};

/**
 * Refreshes an expired video URL
 * 
 * WHAT IT DOES:
 * With local disk storage, this is no longer needed.
 * Kept for backwards compatibility.
 * 
 * JUNIOR DEV NOTE: Why is this here if it's not used?
 * In the old implementation, we streamed videos directly from Google.
 * Those URLs expired, so we needed to refresh them.
 * Now we download videos to disk, so URLs don't expire.
 * 
 * @param {string} accessToken - OAuth2 access token
 * @param {string} mediaItemId - Media item ID
 * @returns {Promise<null>} Always returns null
 * @deprecated Use local disk storage instead
 */
export const refreshVideoUrl = async () => {
    // Not needed with disk storage
    return null;
};
