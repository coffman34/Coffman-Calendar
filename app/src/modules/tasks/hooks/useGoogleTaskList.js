/**
 * @fileoverview Hook to manage a single Google Task list
 * @module modules/tasks/hooks/useGoogleTaskList
 * 
 * JUNIOR DEV NOTE:
 * Unlike useTasks.js which tries to manage everything, this hook 
 * focuses on ONE specific list. This allows us to render multiple
 * lists on the screen at once.
 */

import { useState, useEffect, useCallback } from 'react';
import { useGoogleAuth } from '../../users/contexts/useGoogleAuth';
import { fetchTasks, createTask, updateTask, deleteTask } from '../../../services/googleTasks';

export const useGoogleTaskList = (listId, userId) => {
    const { getFreshToken } = useGoogleAuth();

    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const loadTasks = useCallback(async () => {
        if (!listId || !userId) return;

        setLoading(true);
        try {
            const token = await getFreshToken(userId);
            if (!token) {
                // Silent fail if not connected, or maybe clear tasks
                setTasks([]);
                return;
            }

            const fetched = await fetchTasks(token, listId);
            setTasks(fetched || []);
        } catch (err) {
            console.error(`Failed to load tasks for list ${listId}:`, err);
            setError('Failed to load tasks');
        } finally {
            setLoading(false);
        }
    }, [listId, userId, getFreshToken]);

    useEffect(() => {
        loadTasks();
    }, [loadTasks]);

    const addTask = async (title) => {
        try {
            const token = await getFreshToken(userId);
            const newTask = await createTask(token, listId, { title });
            setTasks(prev => [newTask, ...prev]);
            return true;
        } catch (err) {
            console.error('Add task failed:', err);
            return false;
        }
    };

    const toggleTask = async (task) => {
        // Optimistic update
        const originalStatus = task.status;
        const newStatus = task.status === 'completed' ? 'needsAction' : 'completed';

        setTasks(prev => prev.map(t =>
            t.id === task.id ? { ...t, status: newStatus } : t
        ));

        try {
            const token = await getFreshToken(userId);
            await updateTask(token, listId, task.id, {
                status: newStatus,
                title: task.title
            });
        } catch (err) {
            // Revert on fail
            setTasks(prev => prev.map(t =>
                t.id === task.id ? { ...t, status: originalStatus } : t
            ));
        }
    };

    const removeTask = async (taskId) => {
        const prevTasks = [...tasks];
        setTasks(prev => prev.filter(t => t.id !== taskId));

        try {
            const token = await getFreshToken(userId);
            await deleteTask(token, listId, taskId);
        } catch (err) {
            setTasks(prevTasks);
        }
    };

    return {
        tasks,
        loading,
        error,
        addTask,
        toggleTask,
        removeTask,
        title: null // We don't fetch title here, passed from parent
    };
};
