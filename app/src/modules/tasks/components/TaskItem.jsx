/**
 * @fileoverview Task item component with defensive UX
 * @module modules/tasks/components/TaskItem
 * 
 * DEFENSIVE UX FEATURES:
 * - Loading states during async operations
 * - Disabled buttons while processing
 * - Visual feedback for state changes
 */

import React, { useState } from 'react';
import { ListItem, ListItemIcon, ListItemText, Checkbox, IconButton, CircularProgress } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';

/**
 * TaskItem - Displays a single task with toggle and delete actions
 * 
 * DEFENSIVE UX:
 * Uses state locking to prevent double-clicks during async operations.
 * Shows loading spinner while processing to give visual feedback.
 */
const TaskItem = ({ task, onToggle, onDelete }) => {
    // Track loading state for each action type
    const [isToggling, setIsToggling] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    /**
     * Handle toggle with loading state
     * 
     * JUNIOR DEV NOTE: We set isToggling=true BEFORE the async call.
     * This immediately disables the button to prevent double-clicks.
     */
    const handleToggle = async () => {
        if (isToggling || isDeleting) return; // Already processing
        setIsToggling(true);
        try {
            await onToggle(task);
        } finally {
            setIsToggling(false);
        }
    };

    /**
     * Handle delete with loading state
     */
    const handleDelete = async () => {
        if (isToggling || isDeleting) return; // Already processing
        setIsDeleting(true);
        try {
            await onDelete(task.id);
        } finally {
            setIsDeleting(false);
        }
    };

    const isProcessing = isToggling || isDeleting;

    return (
        <ListItem
            secondaryAction={
                <IconButton
                    edge="end"
                    onClick={handleDelete}
                    disabled={isProcessing}
                    sx={{ minWidth: 44, minHeight: 44 }} // Touch target
                >
                    {isDeleting ? <CircularProgress size={20} /> : <DeleteIcon />}
                </IconButton>
            }
            sx={{
                py: 1,
                px: 2,
                opacity: task.status === 'completed' || isProcessing ? 0.6 : 1,
                textDecoration: task.status === 'completed' ? 'line-through' : 'none'
            }}
        >
            <ListItemIcon
                sx={{ minWidth: 44, minHeight: 44, cursor: 'pointer' }}
                onClick={handleToggle}
            >
                {isToggling ? (
                    <CircularProgress size={24} />
                ) : (
                    <Checkbox
                        edge="start"
                        checked={task.status === 'completed'}
                        tabIndex={-1}
                        disableRipple
                        disabled={isProcessing}
                        icon={<RadioButtonUncheckedIcon />}
                        checkedIcon={<CheckCircleIcon />}
                    />
                )}
            </ListItemIcon>
            <ListItemText
                primary={task.title}
                secondary={task.due ? new Date(task.due).toLocaleDateString() : null}
            />
        </ListItem>
    );
};

export default TaskItem;
