/**
 * @fileoverview Unified User Context Provider
 * 
 * JUNIOR DEV NOTE: This is a "Facade" provider. It doesn't hold its own state;
 * instead, it combines three specialized contexts into one unified interface.
 * 
 * CONTEXTS COMBINED:
 * 1. UserProfileContext: Handles user accounts (adding/deleting family members)
 * 2. GoogleAuthContext: Handles OAuth2 tokens and Google API data
 * 3. SyncContext: Handles background synchronization with the server
 */

import React from 'react';
import GoogleAuthProvider from './contexts/GoogleAuthContext';
import SyncProvider from './contexts/SyncContext';
import UserProfileProvider from './contexts/UserProfileContext';
import { UserContext } from './UserContextCore';
import { useGoogleAuth } from './contexts/useGoogleAuth';
import { useSync } from './contexts/useSync';
import { useUserProfile } from './contexts/useUserProfile';

/**
 * Unified User Provider
 * 
 * WHAT IT DOES:
 * Wraps the application with all user-related state.
 * 
 * DESIGN PATTERN: The "Matryoshka" (Nested) Provider Pattern
 * We nest providers so that the inner ones can access the outer ones.
 * For example, SyncProvider might need the token from GoogleAuthProvider.
 */
export default function UserProvider({ children }) {
    return (
        <UserProfileProvider>
            <GoogleAuthProvider>
                <SyncProvider>
                    <UnifiedContextProvider>
                        {children}
                    </UnifiedContextProvider>
                </SyncProvider>
            </GoogleAuthProvider>
        </UserProfileProvider>
    );
}

/**
 * Internal bridge component to merge context values
 * 
 * JUNIOR DEV NOTE: Why separate this from UserProvider?
 * Hooks like useUserProfile() only work INSIDE the Provider. 
 * By using this internal component, we can "consume" the nested 
 * contexts and merge them into the unified UserContext.
 */
const UnifiedContextProvider = ({ children }) => {
    // 1. Consume the specific contexts
    const profileContext = useUserProfile();
    const authContext = useGoogleAuth();
    const syncContext = useSync();

    // 2. Merge them into a single facade object
    // JUNIOR DEV NOTE: We use the spread operator (...) to combine objects.
    // If multiple contexts have the same key, the last one wins.
    const value = {
        ...profileContext,
        ...authContext,
        ...syncContext,

        // 3. Add helper functions for legacy compatibility
        // Some older components expect specifically named functions.
        getCurrentUserToken: () => authContext.getUserToken(profileContext.currentUser?.id),
        getFreshCurrentUserToken: () => authContext.getFreshToken(profileContext.currentUser?.id),
        isUserConnected: (userId) => authContext.isUserConnected(userId),
        updateUserToken: authContext.updateUserToken,
        getUserCalendars: authContext.getUserCalendars,
        setUserCalendars: authContext.setUserCalendars,
        getUserPhotos: authContext.getUserPhotos,
        setUserPhotos: authContext.setUserPhotos,
        allPhotos: authContext.getAllPhotos(),
    };

    return (
        <UserContext.Provider value={value}>
            {children}
        </UserContext.Provider>
    );
};
