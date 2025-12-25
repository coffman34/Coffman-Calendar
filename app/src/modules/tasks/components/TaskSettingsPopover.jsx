/**
 * @fileoverview Task Settings Popover - Manage synced task lists
 * @module modules/tasks/components/TaskSettingsPopover
 * 
 * JUNIOR DEV NOTE:
 * This component allows users to "subscribe" to specific Google Task lists.
 * We fetch all available lists from Google, then check them against our
 * locally stored "subscribed" lists.
 */

import React, { useState, useEffect } from 'react';
import {
    Popover, Box, Typography, List, ListItem, ListItemIcon, ListItemText,
    Checkbox, CircularProgress, Alert, Divider
} from '@mui/material';
import { useGoogleAuth } from '../../users/contexts/useGoogleAuth';
import { fetchTaskLists } from '../../../services/googleTasks';

const TaskSettingsPopover = ({ open, anchorEl, onClose, currentUserId }) => {
    const { getFreshToken, getSelectedTaskLists, setSelectedTaskLists } = useGoogleAuth();

    // State
    const [allLists, setAllLists] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Initial load when popover opens
    useEffect(() => {
        if (open && currentUserId) {
            loadLists();
        }
    }, [open, currentUserId]);

    const loadLists = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = await getFreshToken(currentUserId);
            if (!token) {
                setError('Please connect your Google account in settings.');
                return;
            }

            const lists = await fetchTaskLists(token);
            setAllLists(lists);
        } catch (err) {
            console.error('Failed to load task lists:', err);
            setError('Could not load lists from Google.');
        } finally {
            setLoading(false);
        }
    };

    const handleToggleList = (list) => {
        const currentSelected = getSelectedTaskLists(currentUserId) || [];
        const isSelected = currentSelected.some(l => l.id === list.id);

        let newSelected;
        if (isSelected) {
            newSelected = currentSelected.filter(l => l.id !== list.id);
        } else {
            newSelected = [...currentSelected, { id: list.id, title: list.title }];
        }

        setSelectedTaskLists(currentUserId, newSelected);
    };

    const selectedLists = getSelectedTaskLists(currentUserId) || [];

    return (
        <Popover
            open={open}
            anchorEl={anchorEl}
            onClose={onClose}
            anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
            }}
            transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
            }}
            PaperProps={{
                sx: { width: 320, maxHeight: 400 }
            }}
        >
            <Box p={2}>
                <Typography variant="h6" gutterBottom>
                    Google Task Lists
                </Typography>
                <Typography variant="caption" color="text.secondary">
                    Select lists to display in your tasks view.
                </Typography>
            </Box>

            <Divider />

            {loading ? (
                <Box display="flex" justifyContent="center" p={4}>
                    <CircularProgress size={24} />
                </Box>
            ) : error ? (
                <Box p={2}>
                    <Alert severity="warning" sx={{ fontSize: '0.875rem' }}>{error}</Alert>
                </Box>
            ) : (
                <List dense sx={{ overflow: 'auto', maxHeight: 300 }}>
                    {allLists.length === 0 ? (
                        <ListItem>
                            <ListItemText primary="No task lists found." />
                        </ListItem>
                    ) : (
                        allLists.map(list => {
                            const isChecked = selectedLists.some(l => l.id === list.id);
                            return (
                                <ListItem key={list.id} button onClick={() => handleToggleList(list)}>
                                    <ListItemIcon sx={{ minWidth: 40 }}>
                                        <Checkbox
                                            edge="start"
                                            checked={isChecked}
                                            tabIndex={-1}
                                            disableRipple
                                            size="small"
                                        />
                                    </ListItemIcon>
                                    <ListItemText primary={list.title} />
                                </ListItem>
                            );
                        })
                    )}
                </List>
            )}
        </Popover>
    );
};

export default TaskSettingsPopover;
