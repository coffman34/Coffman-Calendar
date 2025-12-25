import { useState, useEffect } from 'react';
import { fetchTaskLists, fetchTasks, createTask, updateTask, deleteTask } from '../../../services/googleTasks';

export const useTasks = (currentUser, getToken, connected, updateUserToken, showNotification) => {
    const [taskLists, setTaskLists] = useState([]);
    const [selectedListId, setSelectedListId] = useState('');
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    // JUNIOR DEV NOTE: We removed the sync call `const token = getToken()` 
    // because now getToken is async!

    useEffect(() => {
        if (!connected) {
            setTaskLists([]);
            setTasks([]);
            return;
        }
        const loadLists = async () => {
            setLoading(true);
            setError(null);
            try {
                // Async token fetch
                const token = await getToken();
                if (!token) {
                    setLoading(false);
                    return;
                }

                const lists = await fetchTaskLists(token);
                setTaskLists(lists);
                if (lists.length > 0 && !selectedListId) setSelectedListId(lists[0].id);
            } catch (err) {
                if (err.message === 'TOKEN_EXPIRED') updateUserToken(currentUser.id, null);
                else setError("Failed to load task lists.");
            } finally {
                setLoading(false);
            }
        };
        loadLists();
    }, [connected, refreshTrigger, currentUser?.id, setSelectedListId, updateUserToken, getToken]); // Added getToken

    useEffect(() => {
        if (!selectedListId || !connected) return;

        const loadTasks = async () => {
            setLoading(true);
            setError(null);
            try {
                const token = await getToken();
                if (!token) return;

                const fetchedTasks = await fetchTasks(token, selectedListId);
                setTasks(fetchedTasks || []);
            } catch (err) {
                if (err.message === 'TOKEN_EXPIRED') updateUserToken(currentUser.id, null);
                else setError("Failed to load tasks.");
            } finally {
                setLoading(false);
            }
        };
        loadTasks();
    }, [selectedListId, connected, refreshTrigger, currentUser?.id, updateUserToken, getToken]);

    const handleAddTask = async (title) => {
        try {
            const token = await getToken();
            if (!token) throw new Error('No token');

            const newTask = await createTask(token, selectedListId, { title });
            setTasks(prev => [newTask, ...prev]);
            showNotification('Task added', 'success');
            return true;
        } catch (err) {
            if (err.message === 'TOKEN_EXPIRED') updateUserToken(currentUser.id, null);
            else showNotification('Could not add task', 'error');
            return false;
        }
    };

    const handleToggleTask = async (task) => {
        const originalStatus = task.status;
        const newStatus = task.status === 'completed' ? 'needsAction' : 'completed';
        setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: newStatus } : t));
        try {
            const token = await getToken();
            if (!token) throw new Error('No token');

            await updateTask(token, selectedListId, task.id, { status: newStatus, title: task.title });

            // GAMIFICATION: Award or revoke XP/Gold based on completion direction
            // ANTI-ABUSE: Completing = +XP/+Gold, Uncompleting = -XP/-Gold
            if (currentUser?.id) {
                const xpAmount = newStatus === 'completed' ? 10 : -10;
                const goldAmount = newStatus === 'completed' ? 5 : -5;

                try {
                    // Update XP
                    const xpResult = await fetch(`/api/stats/${currentUser.id}/xp`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ amount: xpAmount })
                    }).then(r => r.json());

                    // Update Gold
                    await fetch(`/api/stats/${currentUser.id}/gold`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ amount: goldAmount })
                    });

                    // Show appropriate notification
                    if (newStatus === 'completed') {
                        if (xpResult.leveledUp) {
                            showNotification(`🎉 Level Up! You're now Level ${xpResult.level}!`, 'success');
                        } else {
                            showNotification(`Task completed! +10 XP, +5 Gold`, 'success');
                        }
                    } else {
                        showNotification('Task reopened', 'info');
                    }
                } catch (xpErr) {
                    console.error('[useTasks] XP/Gold update failed:', xpErr);
                    // Non-critical, still show basic notification
                    showNotification(newStatus === 'completed' ? 'Task completed' : 'Task reopened', 'info');
                }
            } else {
                showNotification(newStatus === 'completed' ? 'Task completed' : 'Task reopened', 'info');
            }
        } catch (err) {
            if (err.message === 'TOKEN_EXPIRED') updateUserToken(currentUser.id, null);
            else showNotification('Failed to update task', 'error');
            setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: originalStatus } : t));
        }
    };

    const handleDeleteTask = async (taskId) => {
        const previousTasks = [...tasks];
        setTasks(prev => prev.filter(t => t.id !== taskId));
        try {
            const token = await getToken();
            if (!token) throw new Error('No token');

            await deleteTask(token, selectedListId, taskId);
            showNotification('Task deleted', 'success');
        } catch (err) {
            if (err.message === 'TOKEN_EXPIRED') updateUserToken(currentUser.id, null);
            else showNotification('Failed to delete task', 'error');
            setTasks(previousTasks);
        }
    };

    return {
        taskLists, selectedListId, setSelectedListId, tasks, loading, error, setError,
        setRefreshTrigger, handleAddTask, handleToggleTask, handleDeleteTask
    };
};
