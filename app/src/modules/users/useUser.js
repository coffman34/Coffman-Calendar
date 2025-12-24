import { useContext } from 'react';
import { UserContext } from './UserContextCore';

/**
 * Unified user hook (for backwards compatibility)
 * 
 * WHAT IT DOES:
 * Provides access to all user-related state and functions (profile, auth, sync).
 * 
 * JUNIOR DEV NOTE: Why use this hook?
 * This is a "Facade" hook. It simplifies access by combining multiple contexts.
 * However, for better performance, consider using specific hooks like useUserProfile().
 */
export const useUser = () => {
    const context = useContext(UserContext);

    if (!context) {
        throw new Error('useUser must be used within UserProvider');
    }

    return context;
};
