/**
 * @fileoverview User Profile Context Provider
 * 
 * JUNIOR DEV NOTE: This provider manages the identities (profiles) of 
 * the family members using the kiosk.
 * 
 * WHY USE THIS?
 * It keeps track of who is "Mom", "Dad", "Junior", etc. 
 * It manages their avatars, theme colors, and which profile is active.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { DEFAULT_USERS } from '../../../utils/constants';
import {
    getUsersFromStorage,
    setUsersInStorage,
    getLastUserIdFromStorage,
    setLastUserIdInStorage
} from '../../../utils/storage';
import { validateUserName } from '../../../utils/validation';
import { UserProfileContext } from './UserProfileContextCore';

/**
 * UserProfileProvider Component
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children
 */
export function UserProfileProvider({ children }) {
    // 1. Initialize State with Migration Logic
    // JUNIOR DEV NOTE: Older profiles may not have `isParent` or `pin` fields.
    // We inject defaults to ensure backwards compatibility.
    const migrateProfile = (user) => ({
        ...user,
        isParent: user.isParent ?? false,  // Default to child if missing
        pin: user.pin ?? null,             // Default to no PIN
    });

    const [users, setUsers] = useState(() => {
        const stored = getUsersFromStorage();
        // If storage returned null/undefined OR an empty array, use defaults
        const effectiveUsers = (stored && stored.length > 0) ? stored : DEFAULT_USERS;
        // Migrate all users to ensure they have new fields
        return effectiveUsers.map(migrateProfile);
    });

    const [currentUser, setCurrentUser] = useState(() => {
        const storedId = getLastUserIdFromStorage();
        // Get the user list (same logic as above for safety)
        const userList = getUsersFromStorage();
        const effectiveUsers = (userList && userList.length > 0) ? userList : DEFAULT_USERS;
        // Migrate users before selecting
        const migratedUsers = effectiveUsers.map(migrateProfile);

        if (!storedId) return migratedUsers[0];
        const foundUser = migratedUsers.find(u => u.id === Number(storedId));
        return foundUser || migratedUsers[0];
    });

    // 2. Operations (Wrapped in useCallback)

    /**
     * Add a new user profile
     * 
     * JUNIOR DEV NOTE: We now accept `isParent` to distinguish between
     * parent accounts (can set PIN) and child accounts (no PIN access).
     */
    const addUser = useCallback((name, color, avatar, isParent = false) => {
        const validation = validateUserName(name);
        if (!validation.valid) {
            console.error('Invalid user name:', validation.error);
            return null;
        }

        const newUser = {
            id: Date.now(), // Unique ID based on time
            name: name.trim(),
            color: color || '#9e9e9e',
            avatar: avatar || '👤',
            isParent,              // Parent or child profile
            pin: null,             // PIN is set later via setUserPin
        };

        setUsers(prev => [...prev, newUser]);
        return newUser;
    }, []);

    const updateUser = useCallback((userId, updates) => {
        setUsers(prev => prev.map(user =>
            user.id === userId ? { ...user, ...updates } : user
        ));

        // Sync with currentUser if necessary
        setCurrentUser(prev => prev.id === userId ? { ...prev, ...updates } : prev);
    }, []);

    const deleteUser = useCallback((userId) => {
        if (users.length <= 1) return false;

        setUsers(prev => prev.filter(user => user.id !== userId));

        if (currentUser?.id === userId) {
            const remainingUser = users.find(u => u.id !== userId);
            setCurrentUser(remainingUser);
        }
        return true;
    }, [users, currentUser?.id]);

    const getUserById = useCallback((userId) => {
        return users.find(u => u.id === userId) || null;
    }, [users]);

    /**
     * Set a PIN for a specific user (parent accounts only)
     * 
     * JUNIOR DEV NOTE: This validates the PIN format (exactly 4 digits)
     * and only allows setting on parent accounts to prevent children
     * from accidentally locking out the family.
     */
    const setUserPin = useCallback((userId, newPin) => {
        // 1. Validate PIN format (must be exactly 4 digits)
        if (!newPin || newPin.length !== 4 || !/^\d+$/.test(newPin)) {
            console.error('Invalid PIN format: must be exactly 4 digits');
            return false;
        }

        // 2. Find the user and verify they are a parent
        const user = users.find(u => u.id === userId);
        if (!user) {
            console.error('User not found:', userId);
            return false;
        }
        if (!user.isParent) {
            console.error('Cannot set PIN on child account');
            return false;
        }

        // 3. Update the user's PIN
        updateUser(userId, { pin: newPin });
        return true;
    }, [users, updateUser]);

    /**
     * Get all parent users (for PIN verification)
     * 
     * JUNIOR DEV NOTE: Used by PinContext to check if entered PIN
     * matches ANY parent's PIN - allowing shared access to settings.
     */
    const getParentUsers = useCallback(() => {
        return users.filter(u => u.isParent);
    }, [users]);

    // 3. Persistence Effects
    useEffect(() => { setUsersInStorage(users); }, [users]);
    useEffect(() => {
        if (currentUser?.id) setLastUserIdInStorage(currentUser.id);
    }, [currentUser]);

    // 4. Value
    const value = {
        users,
        currentUser,
        setCurrentUser,
        addUser,
        updateUser,
        deleteUser,
        getUserById,
        setUserPin,       // NEW: Per-user PIN management
        getParentUsers,   // NEW: Get parent accounts for PIN verification
    };

    return (
        <UserProfileContext.Provider value={value}>
            {children}
        </UserProfileContext.Provider>
    );
}

export default UserProfileProvider;
