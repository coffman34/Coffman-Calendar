/**
 * @fileoverview Google Task List Section
 * @module modules/tasks/components/GoogleTaskList
 */

import React, { useState } from 'react';
import {
    Paper, List, Typography, Box, Alert, CircularProgress,
    Button, IconButton, Collapse
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RefreshIcon from '@mui/icons-material/Refresh';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import LocalTaskItem from './LocalTaskItem'; // Reuse the item component
import { useGoogleTaskList } from '../hooks/useGoogleTaskList';
import AddTaskModal from './AddTaskModal';

const GoogleTaskList = ({ list, userId }) => {
    const {
        tasks, loading, error,
        addTask, toggleTask, removeTask
    } = useGoogleTaskList(list.id, userId);

    const [addModalOpen, setAddModalOpen] = useState(false);
    const [expanded, setExpanded] = useState(true);

    const handleAddTask = async (taskData) => {
        await addTask(taskData.title);
        // AddTaskModal expects taskData object, we just need title for Google
    };

    return (
        <Paper
            elevation={1}
            sx={{
                mt: 2,
                bgcolor: '#FFFFFF',
                borderRadius: 2,
                overflow: 'hidden'
            }}
        >
            {/* Header */}
            <Box
                sx={{
                    p: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    bgcolor: 'rgba(0,0,0,0.02)',
                    cursor: 'pointer'
                }}
                onClick={() => setExpanded(!expanded)}
            >
                <Box display="flex" alignItems="center" gap={1}>
                    <Typography variant="subtitle1" fontWeight="bold">
                        {list.title} (Google)
                    </Typography>
                    {loading && <CircularProgress size={16} />}
                </Box>
                <Box>
                    <IconButton size="small" onClick={(e) => {
                        e.stopPropagation();
                        setAddModalOpen(true);
                    }}>
                        <AddIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small">
                        {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    </IconButton>
                </Box>
            </Box>

            <Collapse in={expanded}>
                {error && <Alert severity="error">{error}</Alert>}

                <List dense sx={{ p: 0 }}>
                    {tasks.length === 0 && !loading ? (
                        <Box p={2} textAlign="center">
                            <Typography variant="body2" color="text.secondary">
                                No tasks in this list.
                            </Typography>
                        </Box>
                    ) : (
                        tasks.map(task => (
                            <LocalTaskItem
                                key={task.id}
                                task={task}
                                onToggle={() => toggleTask(task)}
                                onDelete={() => removeTask(task.id)}
                            />
                        ))
                    )}
                </List>
            </Collapse>

            <AddTaskModal
                open={addModalOpen}
                onClose={() => setAddModalOpen(false)}
                onSave={handleAddTask}
                currentUserId={userId}
                isGoogle={true}
            />
        </Paper>
    );
};

export default GoogleTaskList;
