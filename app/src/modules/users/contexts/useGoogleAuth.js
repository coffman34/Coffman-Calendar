import { useContext } from 'react';
import { GoogleAuthContext } from './GoogleAuthContextCore';

/**
 * Custom hook to use Google Auth context
 * 
 * JUNIOR DEV NOTE: Use this hook to get access to OAuth tokens,
 * selected calendars, and photo data.
 * 
 * @returns {Object} Google auth context value
 * @throws {Error} If used outside GoogleAuthProvider
 */
export const useGoogleAuth = () => {
    const context = useContext(GoogleAuthContext);

    if (!context) {
        throw new Error('useGoogleAuth must be used within GoogleAuthProvider');
    }

    return context;
};
