import { useContext } from 'react';
import { SyncContext } from './SyncContextCore';

/**
 * Custom hook to use Sync context
 * 
 * JUNIOR DEV NOTE: Use this hook to get access to synchronization state,
 * triggers, and status.
 * 
 * @returns {Object} Sync context value
 * @throws {Error} If used outside SyncProvider
 */
export const useSync = () => {
    const context = useContext(SyncContext);

    if (!context) {
        throw new Error('useSync must be used within SyncProvider');
    }

    return context;
};
