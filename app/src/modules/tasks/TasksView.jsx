/**
 * @fileoverview Tasks view component for Google Tasks management
 * @module modules/tasks/TasksView
 * 
 * EDUCATIONAL NOTES FOR JUNIOR DEVELOPERS:
 * 
 * WHY THIS FILE EXISTS:
 * This view provides a to-do list interface integrated with Google Tasks.
 * Users can view, add, complete, and delete tasks from their Google account.
 * 
 * DESIGN PATTERN: Container Component + Custom Hook
 * - Component handles presentation and user interactions
 * - useTasks hook handles all business logic and API calls
 * 
 * FEATURES:
 * - Google Tasks integration
 * - Multiple task lists support
 * - Add/complete/delete tasks
 * - Real-time sync with Google
 * - Loading and error states
 */

import React, { useState } from 'react';
import { Box, Typography, Paper, List, CircularProgress, Alert } from '@mui/material';
import { useUser } from '../../modules/users/useUser';
import { useUI } from '../ui/useUI';
import { useTasks } from './hooks/useTasks';
import GoogleConnectButton from '../../components/GoogleConnectButton';
import TaskHeader from './components/TaskHeader';
import TaskInput from './components/TaskInput';
import TaskItem from './components/TaskItem';

const TasksView = () => {
    const { currentUser, getCurrentUserToken, isUserConnected, updateUserToken } = useUser();
    const { showNotification } = useUI();
    const connected = isUserConnected(currentUser?.id);

    const {
        taskLists, selectedListId, setSelectedListId, tasks, loading, error, setError,
        setRefreshTrigger, handleAddTask, handleToggleTask, handleDeleteTask
    } = useTasks(currentUser, getCurrentUserToken, connected, updateUserToken, showNotification);

    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [addingTask, setAddingTask] = useState(false);

    const onAddTask = async (e) => {
        e.preventDefault();
        if (!newTaskTitle.trim()) return;
        setAddingTask(true);
        if (await handleAddTask(newTaskTitle)) setNewTaskTitle('');
        setAddingTask(false);
    };

    if (!currentUser) return <Box display="flex" justifyContent="center" alignItems="center" height="100%"><Typography>Please select a user profile.</Typography></Box>;

    if (!connected) {
        return (
            <Paper sx={{ p: 4, m: 2, textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                <Typography variant="h5" gutterBottom>Google Tasks</Typography>
                <Typography color="text.secondary" paragraph>Connect your Google account to manage your tasks here.</Typography>
                <GoogleConnectButton userId={currentUser.id} />
            </Paper>
        );
    }

    return (
        <Box sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
            {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>{error}</Alert>}
            <TaskHeader currentUser={currentUser} selectedListId={selectedListId} setSelectedListId={setSelectedListId} taskLists={taskLists} loading={loading} onRefresh={() => setRefreshTrigger(t => t + 1)} />
            <Paper sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <TaskInput newTaskTitle={newTaskTitle} setNewTaskTitle={setNewTaskTitle} handleAddTask={onAddTask} addingTask={addingTask} disabled={!selectedListId} />
                <List sx={{ flexGrow: 1, overflow: 'auto' }}>
                    {loading && tasks.length === 0 ? (
                        <Box display="flex" justifyContent="center" p={4}><CircularProgress /></Box>
                    ) : tasks.length === 0 ? (
                        <Typography align="center" color="text.secondary" sx={{ mt: 4 }}>No tasks found in this list.</Typography>
                    ) : (
                        tasks.map(task => <TaskItem key={task.id} task={task} onToggle={handleToggleTask} onDelete={handleDeleteTask} />)
                    )}
                </List>
            </Paper>
        </Box>
    );
};

export default TasksView;