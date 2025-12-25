/**
 * @fileoverview Local Task Item Component
 * @module modules/tasks/components/LocalTaskItem
 * 
 * Displays a single local task with completion checkbox,
 * title, and XP/Gold rewards.
 */

import React, { useContext } from 'react';
import {
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Checkbox,
    IconButton,
    Typography,
    Box,
    Chip,
    Avatar,
    AvatarGroup,
    Tooltip
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import RepeatIcon from '@mui/icons-material/Repeat';
import GroupIcon from '@mui/icons-material/Group';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { UserContext } from '../../users/UserContextCore';

/**
 * LocalTaskItem Component
 * 
 * @param {Object} props
 * @param {Object} props.task - The task object
 * @param {function} props.onToggle - Toggle completion handler
 * @param {function} props.onDelete - Delete handler
 */
const LocalTaskItem = ({ task, onToggle, onDelete }) => {
    const { users } = useContext(UserContext);

    const handleToggle = () => {
        onToggle(task);
    };

    const handleDelete = (e) => {
        e.stopPropagation(); // Prevent toggle when clicking delete
        if (window.confirm(`Delete "${task.title}"?`)) {
            onDelete(task.id);
        }
    };

    // JUNIOR DEV NOTE: We resolve the user objects for the assignees
    // to display their names/avatars.
    const assignees = Array.isArray(task.assignedTo) ? task.assignedTo : [task.assignedTo];
    const assigneeUsers = assignees.map(id => users.find(u => u.id === id)).filter(Boolean);

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
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography
                                sx={{
                                    textDecoration: task.completed ? 'line-through' : 'none',
                                    fontWeight: 500
                                }}
                            >
                                {task.title}
                            </Typography>

                            {/* Assignee Avatars */}
                            <AvatarGroup max={3} sx={{ '& .MuiAvatar-root': { width: 20, height: 20, fontSize: 10 } }}>
                                {assigneeUsers.map(user => (
                                    <Tooltip key={user.id} title={user.name}>
                                        <Avatar sx={{ bgcolor: user.color || 'primary.main' }}>
                                            {user.avatar || user.name.charAt(0)}
                                        </Avatar>
                                    </Tooltip>
                                ))}
                                {assigneeUsers.length === 0 && (
                                    <Avatar sx={{ width: 20, height: 20 }}><AccountCircleIcon sx={{ fontSize: 14 }} /></Avatar>
                                )}
                            </AvatarGroup>
                        </Box>
                    }
                    secondary={
                        <Box sx={{ display: 'flex', gap: 1, mt: 0.5, flexWrap: 'wrap', alignItems: 'center' }}>
                            {/* XP Reward */}
                            <Chip
                                label={`+${task.xpReward} XP`}
                                size="small"
                                sx={{
                                    height: 18,
                                    fontSize: '0.65rem',
                                    bgcolor: task.completed ? 'success.dark' : 'primary.dark',
                                    color: 'white'
                                }}
                            />
                            {/* Gold Reward */}
                            <Chip
                                label={`+${task.goldReward} 🪙`}
                                size="small"
                                sx={{
                                    height: 18,
                                    fontSize: '0.65rem',
                                    bgcolor: task.completed ? 'success.dark' : 'warning.dark',
                                    color: 'white'
                                }}
                            />

                            {/* Reward Strategy Indicator */}
                            {assigneeUsers.length > 1 && (
                                <Tooltip title={task.rewardStrategy === 'split' ? 'Reward split evenly' : 'Full reward for everyone'}>
                                    <Chip
                                        icon={task.rewardStrategy === 'split' ? <GroupIcon sx={{ fontSize: 12, color: 'inherit !important' }} /> : <RepeatIcon sx={{ fontSize: 12, color: 'inherit !important' }} />}
                                        label={task.rewardStrategy || 'full'}
                                        size="small"
                                        variant="outlined"
                                        sx={{ height: 18, fontSize: '0.6rem', px: 0.5 }}
                                    />
                                </Tooltip>
                            )}

                            {/* Recurring indicator */}
                            {task.isRecurring && (
                                <Chip
                                    icon={<RepeatIcon sx={{ fontSize: 12, color: 'inherit !important' }} />}
                                    label={task.recurrence}
                                    size="small"
                                    variant="outlined"
                                    sx={{ height: 18, fontSize: '0.6rem' }}
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
