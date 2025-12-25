/**
 * @fileoverview useLocalTasks Hook - Manages local tasks with gamification
 * @module modules/tasks/hooks/useLocalTasks
 * 
 * EDUCATIONAL NOTES FOR JUNIOR DEVELOPERS:
 * 
 * WHY THIS HOOK EXISTS:
 * This hook manages "local tasks" - tasks stored on our backend that:
 * - Don't require Google authentication
 * - Support recurring patterns (daily, weekly)
 * - Award XP and Gold when completed
 * 
 * DESIGN PATTERN: Separation of Concerns
 * Local tasks and Google tasks are handled separately, then merged in TasksView.
 */

import { useState, useEffect, useCallback } from 'react';

/**
 * useLocalTasks Hook
 * 
 * @param {string|number} userId - Current user's ID
 * @param {function} showNotification - Function to show UI notifications
 * @returns {Object} - Local tasks state and handlers
 */
export const useLocalTasks = (userId, showNotification) => {
    // ========================================================================
    // STATE
    // ========================================================================

    const [localTasks, setLocalTasks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // ========================================================================
    // FETCH TASKS
    // ========================================================================

    const fetchLocalTasks = useCallback(async () => {
        if (!userId) return;

        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`/api/local-tasks/user/${userId}`);
            if (!response.ok) throw new Error('Failed to fetch local tasks');

            const tasks = await response.json();
            setLocalTasks(tasks);
        } catch (err) {
            console.error('[useLocalTasks] Fetch error:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [userId]);

    // Fetch on mount and when userId changes
    useEffect(() => {
        fetchLocalTasks();
    }, [fetchLocalTasks]);

    // ========================================================================
    // TASK OPERATIONS
    // ========================================================================

    /**
     * Toggle task completion - handles XP/Gold automatically on backend
     */
    const toggleLocalTask = useCallback(async (task) => {
        // Optimistic update
        const originalTasks = [...localTasks];
        const newCompleted = !task.completed;

        setLocalTasks(prev => prev.map(t =>
            t.id === task.id ? { ...t, completed: newCompleted } : t
        ));

        try {
            const endpoint = newCompleted ? 'complete' : 'uncomplete';
            const response = await fetch(`/api/local-tasks/${task.id}/${endpoint}`, {
                method: 'POST'
            });

            if (!response.ok) throw new Error('Failed to update task');

            const result = await response.json();

            // Show notification with XP/Gold info
            if (newCompleted) {
                const xp = result.xpAwarded || task.xpReward;
                const gold = result.goldAwarded || task.goldReward;
                showNotification?.(`Task completed! +${xp} XP, +${gold} Gold`, 'success');
            } else {
                showNotification?.('Task reopened', 'info');
            }
        } catch (err) {
            console.error('[useLocalTasks] Toggle error:', err);
            setLocalTasks(originalTasks);
            showNotification?.('Failed to update task', 'error');
        }
    }, [localTasks, showNotification]);

    /**
     * Create a new local task
     */
    const addLocalTask = useCallback(async (taskData) => {
        try {
            const response = await fetch('/api/local-tasks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...taskData,
                    assignedTo: userId
                })
            });

            if (!response.ok) throw new Error('Failed to create task');

            const newTask = await response.json();
            setLocalTasks(prev => [newTask, ...prev]);
            showNotification?.('Task created', 'success');
            return newTask;
        } catch (err) {
            console.error('[useLocalTasks] Create error:', err);
            showNotification?.('Failed to create task', 'error');
            return null;
        }
    }, [userId, showNotification]);

    /**
     * Update an existing local task
     */
    const updateLocalTask = useCallback(async (taskId, updates) => {
        try {
            const response = await fetch(`/api/local-tasks/${taskId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates)
            });

            if (!response.ok) throw new Error('Failed to update task');

            const updatedTask = await response.json();
            setLocalTasks(prev => prev.map(t =>
                t.id === taskId ? updatedTask : t
            ));
            showNotification?.('Task updated', 'success');
            return updatedTask;
        } catch (err) {
            console.error('[useLocalTasks] Update error:', err);
            showNotification?.('Failed to update task', 'error');
            return null;
        }
    }, [showNotification]);

    /**
     * Delete a local task
     */
    const deleteLocalTask = useCallback(async (taskId) => {
        const previousTasks = [...localTasks];
        setLocalTasks(prev => prev.filter(t => t.id !== taskId));

        try {
            const response = await fetch(`/api/local-tasks/${taskId}`, {
                method: 'DELETE'
            });

            if (!response.ok) throw new Error('Failed to delete task');

            showNotification?.('Task deleted', 'success');
            return true;
        } catch (err) {
            console.error('[useLocalTasks] Delete error:', err);
            setLocalTasks(previousTasks);
            showNotification?.('Failed to delete task', 'error');
            return false;
        }
    }, [localTasks, showNotification]);

    // ========================================================================
    // RETURN
    // ========================================================================

    return {
        localTasks,
        loading,
        error,
        refreshLocalTasks: fetchLocalTasks,
        toggleLocalTask,
        addLocalTask,
        updateLocalTask,
        deleteLocalTask
    };
};

export default useLocalTasks;
