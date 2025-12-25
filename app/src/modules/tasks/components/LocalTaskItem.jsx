/**
 * @fileoverview Local Task Item Component
 * @module modules/tasks/components/LocalTaskItem
 * 
 * Displays a single local task with completion checkbox,
 * title, and XP/Gold rewards.
 */

import React from 'react';
import {
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Checkbox,
    IconButton,
    Typography,
    Box,
    Chip
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import RepeatIcon from '@mui/icons-material/Repeat';

/**
 * LocalTaskItem Component
 * 
 * @param {Object} props
 * @param {Object} props.task - The task object
 * @param {function} props.onToggle - Toggle completion handler
 * @param {function} props.onDelete - Delete handler
 */
const LocalTaskItem = ({ task, onToggle, onDelete }) => {
    const handleToggle = () => {
        onToggle(task);
    };

    const handleDelete = (e) => {
        e.stopPropagation(); // Prevent toggle when clicking delete
        if (window.confirm(`Delete "${task.title}"?`)) {
            onDelete(task.id);
        }
    };

    return (
        <ListItem
            disablePadding
            secondaryAction={
                <IconButton
                    edge="end"
                    onClick={handleDelete}
                    sx={{ opacity: 0.5, '&:hover': { opacity: 1 } }}
                >
                    <DeleteIcon />
                </IconButton>
            }
            sx={{
                opacity: task.completed ? 0.6 : 1,
                bgcolor: task.completed ? 'action.hover' : 'transparent',
                borderBottom: '1px solid',
                borderColor: 'divider'
            }}
        >
            <ListItemButton onClick={handleToggle} sx={{ py: 1.5 }}>
                <ListItemIcon>
                    <Checkbox
                        checked={task.completed}
                        tabIndex={-1}
                        disableRipple
                    />
                </ListItemIcon>

                <ListItemText
                    primary={
                        <Typography
                            sx={{
                                textDecoration: task.completed ? 'line-through' : 'none'
                            }}
                        >
                            {task.title}
                        </Typography>
                    }
                    secondary={
                        <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                            {/* XP Reward */}
                            <Chip
                                label={`+${task.xpReward} XP`}
                                size="small"
                                sx={{
                                    height: 20,
                                    fontSize: '0.7rem',
                                    bgcolor: task.completed ? 'success.dark' : 'primary.dark',
                                    color: 'white'
                                }}
                            />
                            {/* Gold Reward */}
                            <Chip
                                label={`+${task.goldReward} 🪙`}
                                size="small"
                                sx={{
                                    height: 20,
                                    fontSize: '0.7rem',
                                    bgcolor: task.completed ? 'success.dark' : 'warning.dark',
                                    color: 'white'
                                }}
                            />
                            {/* Recurring indicator */}
                            {task.isRecurring && (
                                <Chip
                                    icon={<RepeatIcon sx={{ fontSize: 14 }} />}
                                    label={task.recurrence}
                                    size="small"
                                    variant="outlined"
                                    sx={{ height: 20, fontSize: '0.65rem' }}
                                />
                            )}
                        </Box>
                    }
                />
            </ListItemButton>
        </ListItem>
    );
};

export default LocalTaskItem;
