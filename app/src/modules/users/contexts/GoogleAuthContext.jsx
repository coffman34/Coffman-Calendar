/**
 * @fileoverview Google Auth Context Provider
 * 
 * JUNIOR DEV NOTE: This provider manages Google OAuth tokens and 
 * related data (calendars/photos) for all family members.
 * 
 * WHY USE THIS?
 * It centralizes all Google API authentication logic in one place.
 * It handles the OAuth callback, token storage, and expiration checks.
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { handleAuthCallback } from '../../../services/googleAuth';
import {
    getAllGoogleTokens,
    setGoogleToken,
    removeGoogleToken,
    getCalendarsFromStorage,
    setCalendarsInStorage,
    getPhotosFromStorage,
    setPhotosInStorage
} from '../../../utils/storage';
import { GoogleAuthContext } from './GoogleAuthContextCore';

/**
 * GoogleAuthProvider Component
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children
 */
export function GoogleAuthProvider({ children }) {
    // 1. Initial State from Storage
    const [googleTokens, setGoogleTokens] = useState(() => getAllGoogleTokens());
    const [selectedCalendars, setSelectedCalendars] = useState(() => getCalendarsFromStorage());
    const [userPhotos, setUserPhotosState] = useState(() => getPhotosFromStorage());
    const hasHandledCallback = useRef(false);

    // 2. Token Operations

    /** 
     * Updates a user token in state and storage
     * JUNIOR DEV NOTE: We use useCallback because this is passed to components.
     */
    const updateUserToken = useCallback((userId, tokenData) => {
        if (tokenData) {
            setGoogleTokens(prev => ({ ...prev, [userId]: tokenData }));
            setGoogleToken(userId, tokenData);
        } else {
            setGoogleTokens(prev => {
                const newTokens = { ...prev };
                delete newTokens[userId];
                return newTokens;
            });
            removeGoogleToken(userId);
        }
    }, []);

    /** 
     * Gets a valid token for a user
     * JUNIOR DEV NOTE: We use a function here instead of a derived state
     * because token validity changes with time.
     */
    const getUserToken = useCallback((userId) => {
        const tokenData = googleTokens[userId];
        if (!tokenData) return null;

        try {
            const parsed = JSON.parse(tokenData);
            // JUNIOR DEV NOTE: We NO LONGER check expiration here.
            // We let the API client handle 401s and refresh.
            // If we returned null here, the UI would flicker to "disconnected".
            return parsed.accessToken;
        } catch (error) {
            console.error('Failed to parse token:', error);
            return null;
        }
    }, [googleTokens]);

    /**
     * Async function to get a guaranteed valid token (refreshed if needed)
     */
    const getFreshToken = useCallback(async (userId) => {
        // We import this dynamically or rely on the imported service
        // using the logic we wrote in googleAuth.js
        const { getStoredToken } = await import('../../../services/googleAuth');
        const token = await getStoredToken(userId);

        // If refresh happened, update our local state so UI reflects new expiry
        if (token) {
            // We don't have the full token object here easily to update state purely,
            // but storeToken in googleAuth.js updates localStorage.
            // We should sync state from localStorage.
            const { getToken: getRawToken } = await import('../../../services/utils/tokenManager');
            const raw = getRawToken(userId);
            if (raw !== googleTokens[userId]) {
                updateUserToken(userId, raw);
            }
        } else {
            // Token is truly dead (refresh failed)
            updateUserToken(userId, null);
        }

        return token;
    }, [googleTokens, updateUserToken]);

    const isUserConnected = useCallback((userId) => {
        // Just check if we have ANY token data
        return !!googleTokens[userId];
    }, [googleTokens]);

    // 3. Data Operations

    const getUserCalendars = useCallback((userId) => selectedCalendars[userId] || [], [selectedCalendars]);

    /**
     * Updates selected calendars for a user
     * 
     * JUNIOR DEV NOTE: We dispatch a CustomEvent here so that the
     * CalendarContext can immediately filter out events from unselected
     * calendars, providing instant UI feedback instead of waiting for refetch.
     */
    const setUserCalendars = useCallback((userId, calendars) => {
        setSelectedCalendars(prev => ({ ...prev, [userId]: calendars }));
        // Notify calendar module to clear stale events immediately
        window.dispatchEvent(new CustomEvent('calendars-changed', {
            detail: { userId, calendars }
        }));
    }, []);

    const getUserPhotos = useCallback((userId) => userPhotos[userId] || [], [userPhotos]);

    const setUserPhotos = useCallback((userId, photos) => {
        const taggedPhotos = photos.map(photo => ({ ...photo, ownerId: userId }));
        setUserPhotosState(prev => ({ ...prev, [userId]: taggedPhotos }));
    }, []);

    const getAllPhotos = useCallback(() => Object.values(userPhotos).flat(), [userPhotos]);

    // 4. Effects

    /** Handle OAuth redirect callback on app load */
    useEffect(() => {
        // CRITICAL: Set flag BEFORE async call to prevent StrictMode double-invoke
        if (hasHandledCallback.current) return;

        // Check if we have auth params in URL before doing anything
        const params = new URLSearchParams(window.location.search);
        if (!params.get('code')) return;

        hasHandledCallback.current = true; // Set BEFORE async to prevent race

        const handle = async () => {
            const result = await handleAuthCallback();
            if (result) {
                const tokenJson = JSON.stringify({
                    accessToken: result.accessToken,
                    expiresAt: result.expiresAt,
                });
                updateUserToken(result.userId, tokenJson);
            }
        };
        handle();
    }, [updateUserToken]);

    /** Auto-persist data changes */
    useEffect(() => { setCalendarsInStorage(selectedCalendars); }, [selectedCalendars]);
    useEffect(() => { setPhotosInStorage(userPhotos); }, [userPhotos]);

    // 5. Context Value
    const value = {
        googleTokens,
        getUserToken,
        getFreshToken, // New async method
        isUserConnected,
        updateUserToken,
        selectedCalendars,
        getUserCalendars,
        setUserCalendars,
        userPhotos,
        getUserPhotos,
        setUserPhotos,
        getAllPhotos,
    };

    return (
        <GoogleAuthContext.Provider value={value}>
            {children}
        </GoogleAuthContext.Provider>
    );
}

export default GoogleAuthProvider;
