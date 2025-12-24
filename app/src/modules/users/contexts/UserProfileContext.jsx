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
    // 1. Initialize State
    const [users, setUsers] = useState(() => getUsersFromStorage() || DEFAULT_USERS);

    const [currentUser, setCurrentUser] = useState(() => {
        const storedId = getLastUserIdFromStorage();
        if (!storedId) return users[0];
        const foundUser = users.find(u => u.id === Number(storedId));
        return foundUser || users[0];
    });

    // 2. Operations (Wrapped in useCallback)

    const addUser = useCallback((name, color, avatar) => {
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

        if (currentUser.id === userId) {
            const remainingUser = users.find(u => u.id !== userId);
            setCurrentUser(remainingUser);
        }
        return true;
    }, [users, currentUser.id]);

    const getUserById = useCallback((userId) => {
        return users.find(u => u.id === userId) || null;
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
    };

    return (
        <UserProfileContext.Provider value={value}>
            {children}
        </UserProfileContext.Provider>
    );
}

export default UserProfileProvider;
