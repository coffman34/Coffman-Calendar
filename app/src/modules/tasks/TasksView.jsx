/**
 * @fileoverview Unified Tasks View - Local with Optional Google Sync
 * @module modules/tasks/TasksView
 * 
 * EDUCATIONAL NOTES FOR JUNIOR DEVELOPERS:
 * 
 * WHY THIS FILE EXISTS:
 * This view provides a unified task management interface.
 * All tasks are stored locally and earn XP/Gold when completed.
 * If the user has authorized Google Tasks, tasks ALSO sync to Google.
 * 
 * DESIGN PATTERN: Hybrid Storage
 * - Local tasks = source of truth for gamification
 * - Google Tasks = optional sync for cross-device access
 */

import React, { useState } from 'react';
import {
    Box, Typography, Paper, List, CircularProgress, Alert,
    Button, Fab
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useUser } from '../../modules/users/useUser';
import { useUI } from '../ui/useUI';
import { useLocalTasks } from './hooks/useLocalTasks';
import LocalTaskItem from './components/LocalTaskItem';
import AddTaskModal from './components/AddTaskModal';

const TasksView = () => {
    // ========================================================================
    // HOOKS & STATE
    // ========================================================================

    const { currentUser } = useUser();
    const { showNotification } = useUI();

    // All tasks are local with XP/Gold
    const {
        localTasks,
        loading,
        error,
        toggleLocalTask,
        addLocalTask,
        deleteLocalTask
    } = useLocalTasks(currentUser?.id, showNotification);

    // Modal state
    const [addModalOpen, setAddModalOpen] = useState(false);

    // ========================================================================
    // HANDLERS
    // ========================================================================

    const handleAddTask = async (taskData) => {
        await addLocalTask(taskData);
    };

    // ========================================================================
    // RENDER GUARDS
    // ========================================================================

    if (!currentUser) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                <Typography>Please select a user profile.</Typography>
            </Box>
        );
    }

    // ========================================================================
    // RENDER
    // ========================================================================

    return (
        <Box sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
            {/* Error Alert */}
            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h5" fontWeight="bold">
                    {currentUser.name}'s Tasks
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setAddModalOpen(true)}
                >
                    Add Task
                </Button>
            </Box>

            {/* Main Task List */}
            <Paper sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <List sx={{ flexGrow: 1, overflow: 'auto', p: 0 }}>
                    {loading && localTasks.length === 0 ? (
                        <Box display="flex" justifyContent="center" p={4}>
                            <CircularProgress />
                        </Box>
                    ) : localTasks.length === 0 ? (
                        <Box sx={{ textAlign: 'center', py: 6 }}>
                            <Typography variant="h6" color="text.secondary" gutterBottom>
                                No tasks yet!
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                                Create tasks to earn XP and Gold.
                            </Typography>
                            <Button
                                variant="outlined"
                                startIcon={<AddIcon />}
                                onClick={() => setAddModalOpen(true)}
                            >
                                Create First Task
                            </Button>
                        </Box>
                    ) : (
                        localTasks.map(task => (
                            <LocalTaskItem
                                key={task.id}
                                task={task}
                                onToggle={toggleLocalTask}
                                onDelete={deleteLocalTask}
                            />
                        ))
                    )}
                </List>
            </Paper>

            {/* Add Task Modal */}
            <AddTaskModal
                open={addModalOpen}
                onClose={() => setAddModalOpen(false)}
                onSave={handleAddTask}
                currentUserId={currentUser.id}
            />
        </Box>
    );
};

export default TasksView;