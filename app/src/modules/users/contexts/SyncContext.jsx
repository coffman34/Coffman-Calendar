/**
 * @fileoverview Server Sync Context Provider
 * 
 * JUNIOR DEV NOTE: This provider acts as the "Glue" between our 
 * browser's local storage and our backend server's persistence.
 * 
 * WHY USE THIS?
 * It ensures that changes made on one family kiosk (like adding a member)
 * show up on all other devices automatically.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { UI_CONFIG } from '../../../utils/constants';
import { SyncContext } from './SyncContextCore';

/**
 * SyncProvider Component
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children
 */
export function SyncProvider({ children }) {
    // 1. Core Synchronization State
    const isInitialized = useRef(false);
    const [syncStatus, setSyncStatus] = useState({
        isSyncing: false,
        lastSyncTime: null,
        error: null,
    });

    const [syncData, setSyncData] = useState({
        users: [],
        selectedCalendars: {},
        googleTokens: {},
    });

    // 2. Server Operations (Wrapped in useCallback for stability)

    const loadFromServer = useCallback(async () => {
        setSyncStatus(prev => ({ ...prev, isSyncing: true, error: null }));

        try {
            const response = await fetch('/api/data');
            if (!response.ok) throw new Error(`Server returned ${response.status}`);

            const data = await response.json();

            if (data && Object.keys(data).length > 0) {
                setSyncData(data);
                setSyncStatus({
                    isSyncing: false,
                    lastSyncTime: Date.now(), // Impure but used in async callback, not render
                    error: null,
                });
                return data;
            }

            setSyncStatus(prev => ({ ...prev, isSyncing: false }));
            return null;
        } catch (error) {
            console.warn('Failed to load from server:', error);
            setSyncStatus({
                isSyncing: false,
                lastSyncTime: null,
                error: error.message,
            });
            return null;
        }
    }, []);

    const saveToServer = useCallback(async (data) => {
        if (!isInitialized.current || !data || Object.keys(data).length === 0) {
            return false;
        }

        setSyncStatus(prev => ({ ...prev, isSyncing: true, error: null }));

        try {
            const response = await fetch('/api/data', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            if (!response.ok) throw new Error(`Server returned ${response.status}`);

            setSyncStatus({
                isSyncing: false,
                lastSyncTime: Date.now(), // Impure but used in async callback
                error: null,
            });
            return true;
        } catch (error) {
            console.warn('Failed to save to server:', error);
            setSyncStatus(prev => ({ ...prev, isSyncing: false, error: error.message }));
            return false;
        }
    }, []);

    // 3. Effects

    /** Initial data load */
    useEffect(() => {
        loadFromServer().then(() => {
            isInitialized.current = true;
        });
    }, [loadFromServer]);

    /** Auto-save with debouncing */
    useEffect(() => {
        const timeout = setTimeout(() => {
            saveToServer(syncData);
        }, UI_CONFIG.DEBOUNCE_DELAY);

        return () => clearTimeout(timeout);
    }, [syncData, saveToServer]);

    // 4. API for components

    const updateSyncData = useCallback((updates) => {
        setSyncData(prev => ({ ...prev, ...updates }));
    }, []);

    const forceSyncNow = useCallback(async () => {
        return await saveToServer(syncData);
    }, [syncData, saveToServer]);

    const refreshFromServer = useCallback(async () => {
        return await loadFromServer();
    }, [loadFromServer]);

    // 5. Context Value
    const value = {
        syncData,
        updateSyncData,
        forceSyncNow,
        refreshFromServer,
        syncStatus,
        isInitialized: isInitialized.current,
    };

    return (
        <SyncContext.Provider value={value}>
            {children}
        </SyncContext.Provider>
    );
}

export default SyncProvider;
