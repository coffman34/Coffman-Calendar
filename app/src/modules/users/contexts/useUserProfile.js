import { useContext } from 'react';
import { UserProfileContext } from './UserProfileContextCore';

/**
 * Custom hook to use User Profile context
 * 
 * JUNIOR DEV NOTE: Use this hook to access the family member list,
 * manage users, and get the currently selected user.
 * 
 * @returns {Object} User profile context value
 * @throws {Error} If used outside UserProfileProvider
 */
export const useUserProfile = () => {
    const context = useContext(UserProfileContext);

    if (!context) {
        throw new Error('useUserProfile must be used within UserProfileProvider');
    }

    return context;
};
