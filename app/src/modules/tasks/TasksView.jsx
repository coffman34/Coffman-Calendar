/**
 * @fileoverview Family Tasks View - Single Gamified Task List
 * @module modules/tasks/TasksView
 * 
 * EDUCATIONAL NOTES FOR JUNIOR DEVELOPERS:
 * 
 * WHY THIS FILE EXISTS:
 * This is a SINGLE unified task list for the entire family.
 * Tasks here are gamified - completing them earns XP and Gold.
 * The list is stored locally, but can be synced to a user's Google Tasks.
 * 
 * KEY DIFFERENCE FROM LISTS MODULE:
 * - Tasks module = ONE list, shared by family, gamified
 * - Lists module = MULTIPLE lists (Shopping, Google), not gamified
 */

import React, { useState } from 'react';
import {
    Box, Typography, Paper, List, CircularProgress, Alert,
    Button, IconButton, Dialog, DialogContent
} from '@mui/material';
import AppCard from '../../components/AppCard';
import AddIcon from '@mui/icons-material/Add';
import SettingsIcon from '@mui/icons-material/Settings';
import { useUser } from '../../modules/users/useUser';
import { useUI } from '../ui/useUI';
import { useLocalTasks } from './hooks/useLocalTasks';
import LocalTaskItem from './components/LocalTaskItem';
import AddTaskModal from './components/AddTaskModal';
import UserSelector from '../users/UserSelector';
import PinDialog from '../../components/PinDialog';

const TasksView = () => {
    // ========================================================================
    // HOOKS & STATE
    // ========================================================================

    const { currentUser } = useUser();
    const { showNotification } = useUI();

    // JUNIOR DEV NOTE:
    // We pass null for userId because this is a FAMILY task list, not per-user.
    // The gamification happens when ANY user completes a task.
    const {
        localTasks,
        loading,
        error,
        toggleLocalTask,
        addLocalTask,
        deleteLocalTask
    } = useLocalTasks(null, showNotification); // null = family-wide tasks

    // Modal state
    const [addModalOpen, setAddModalOpen] = useState(false);

    // Settings/Sync flow state
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [settingsStep, setSettingsStep] = useState('USER'); // 'USER' | 'PIN' | 'OPTIONS'
    const [selectedUser, setSelectedUser] = useState(null);

    // ========================================================================
    // HANDLERS
    // ========================================================================

    const handleAddTask = async (taskData) => {
        await addLocalTask(taskData);
    };

    // --- Settings/Sync Flow ---

    const handleGearClick = () => {
        setSettingsStep('USER');
        setSelectedUser(null);
        setSettingsOpen(true);
    };

    const handleUserSelect = (user) => {
        setSelectedUser(user);
        if (user.isParent && user.pin) {
            setSettingsStep('PIN');
        } else {
            setSettingsStep('OPTIONS');
        }
    };

    const handlePinSuccess = () => {
        setSettingsStep('OPTIONS');
        return true;
    };

    const handleSync = () => {
        // TODO: Implement actual sync to Google Tasks
        showNotification(`Syncing tasks to ${selectedUser.name}'s Google account...`, 'info');
        setSettingsOpen(false);
    };

    // ========================================================================
    // RENDER
    // ========================================================================

    const HeaderActions = (
        <Box display="flex" gap={1}>
            <IconButton onClick={handleGearClick}>
                <SettingsIcon />
            </IconButton>
            <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setAddModalOpen(true)}
                size="small"
            >
                Add Task
            </Button>
        </Box>
    );

    return (
        <AppCard
            title="Family Tasks"
            action={HeaderActions}
            sx={{ height: '100%' }}
        >
            <Box sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
                {/* Error Alert */}
                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                {/* Main Task List */}
                <Paper
                    elevation={1}
                    sx={{
                        flexGrow: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden',
                        bgcolor: '#FFFFFF',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                        borderRadius: 2
                    }}
                >
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
            </Box>

            {/* Add Task Modal */}
            <AddTaskModal
                open={addModalOpen}
                onClose={() => setAddModalOpen(false)}
                onSave={handleAddTask}
                currentUserId={currentUser?.id}
            />

            {/* Settings Dialog - Profile Selection → PIN → Sync Options */}
            <Dialog
                open={settingsOpen}
                onClose={() => setSettingsOpen(false)}
                fullWidth
                maxWidth="sm"
                PaperProps={{ sx: { borderRadius: 3, p: 2, minHeight: '50vh' } }}
            >
                <DialogContent>
                    {settingsStep === 'USER' && (
                        <UserSelector
                            title="Who is syncing tasks?"
                            onSelect={handleUserSelect}
                            showGoogle={false}
                        />
                    )}

                    {settingsStep === 'PIN' && (
                        <PinDialog
                            title={`Enter PIN for ${selectedUser?.name}`}
                            onSuccess={handlePinSuccess}
                            autoSubmit={true}
                        />
                    )}

                    {settingsStep === 'OPTIONS' && (
                        <Box textAlign="center" py={4}>
                            <Typography variant="h6" gutterBottom>
                                Sync Settings
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                                Sync the family task list to {selectedUser?.name}'s Google Tasks?
                            </Typography>
                            <Button
                                variant="contained"
                                onClick={handleSync}
                                sx={{ mr: 2 }}
                            >
                                Sync to Google
                            </Button>
                            <Button
                                variant="outlined"
                                onClick={() => setSettingsOpen(false)}
                            >
                                Cancel
                            </Button>
                        </Box>
                    )}
                </DialogContent>
            </Dialog>
        </AppCard>
    );
};

export default TasksView;