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
            // IMPURE CHECK FIX: We check validity at the time of call.
            // Avoid calling Date.now() in the render phase.
            if (Date.now() > parsed.expiresAt) {
                updateUserToken(userId, null);
                return null;
            }
            return parsed.accessToken;
        } catch (error) {
            console.error('Failed to parse token:', error);
            return null;
        }
    }, [googleTokens, updateUserToken]);

    /** Checks if a user has a connected account */
    const isUserConnected = useCallback((userId) => {
        return getUserToken(userId) !== null;
    }, [getUserToken]);

    // 3. Data Operations

    const getUserCalendars = useCallback((userId) => selectedCalendars[userId] || [], [selectedCalendars]);

    const setUserCalendars = useCallback((userId, calendars) => {
        setSelectedCalendars(prev => ({ ...prev, [userId]: calendars }));
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
        if (hasHandledCallback.current) return;

        const result = handleAuthCallback();
        if (result) {
            hasHandledCallback.current = true;
            const tokenJson = JSON.stringify({
                accessToken: result.accessToken,
                expiresAt: result.expiresAt,
            });
            updateUserToken(result.userId, tokenJson);
        }
    }, [updateUserToken]);

    /** Auto-persist data changes */
    useEffect(() => { setCalendarsInStorage(selectedCalendars); }, [selectedCalendars]);
    useEffect(() => { setPhotosInStorage(userPhotos); }, [userPhotos]);

    // 5. Context Value
    const value = {
        googleTokens,
        getUserToken,
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
