/**
 * @fileoverview RewardsManager - CRUD Dialog for Shop Items
 * @module modules/rewards/RewardsManager
 */

import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Box,
    Typography,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    IconButton,
    Chip,
    Stack
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

const API_BASE = '/api';

/**
 * RewardsManager Component
 */
const RewardsManager = ({ open, onClose, onSave }) => {
    // State
    const [rewards, setRewards] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editingReward, setEditingReward] = useState(null);

    // Form state
    const [title, setTitle] = useState('');
    const [cost, setCost] = useState(50);
    const [icon, setIcon] = useState('🎁');

    // Load rewards
    useEffect(() => {
        if (open) {
            fetch(`${API_BASE}/rewards`)
                .then(res => res.json())
                .then(setRewards)
                .catch(console.error);
        }
    }, [open]);

    // Populate form when editing
    useEffect(() => {
        if (editingReward) {
            setTitle(editingReward.title || '');
            setCost(editingReward.cost ?? 50);
            setIcon(editingReward.icon || '🎁');
            setShowForm(true);
        }
    }, [editingReward]);

    const resetForm = () => {
        setTitle('');
        setCost(50);
        setIcon('🎁');
        setShowForm(false);
        setEditingReward(null);
    };

    const handleSave = async () => {
        if (!title.trim()) return;

        const rewardData = {
            title: title.trim(),
            cost: Number(cost),
            icon
        };

        try {
            if (editingReward) {
                await fetch(`${API_BASE}/rewards/${editingReward.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(rewardData)
                });
            } else {
                await fetch(`${API_BASE}/rewards`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(rewardData)
                });
            }

            // Refresh list
            const res = await fetch(`${API_BASE}/rewards`);
            setRewards(await res.json());
            resetForm();
            onSave?.();
        } catch (err) {
            console.error('Save failed:', err);
        }
    };

    const handleDelete = async (reward) => {
        if (!window.confirm(`Delete "${reward.title}"?`)) return;

        try {
            await fetch(`${API_BASE}/rewards/${reward.id}`, {
                method: 'DELETE'
            });
            setRewards(prev => prev.filter(r => r.id !== reward.id));
            onSave?.();
        } catch (err) {
            console.error('Delete failed:', err);
        }
    };

    const handleSeedDefaults = async () => {
        try {
            await fetch(`${API_BASE}/rewards/seed`, { method: 'POST' });
            const res = await fetch(`${API_BASE}/rewards`);
            setRewards(await res.json());
            onSave?.();
        } catch (err) {
            console.error('Seed failed:', err);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>
                {editingReward ? 'Edit Reward' : showForm ? 'New Reward' : 'Manage Rewards'}
            </DialogTitle>

            <DialogContent>
                {showForm ? (
                    <Box sx={{ pt: 1 }}>
                        <TextField
                            label="Reward Name"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            fullWidth
                            sx={{ mb: 2 }}
                            autoFocus
                        />

                        <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                            <TextField
                                label="Gold Cost"
                                type="number"
                                value={cost}
                                onChange={(e) => setCost(e.target.value)}
                                inputProps={{ min: 1 }}
                            />
                            <TextField
                                label="Emoji Icon"
                                value={icon}
                                onChange={(e) => setIcon(e.target.value)}
                                inputProps={{ maxLength: 4 }}
                            />
                        </Stack>
                    </Box>
                ) : (
                    <Box>
                        <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                            <Button
                                variant="outlined"
                                startIcon={<AddIcon />}
                                onClick={() => setShowForm(true)}
                            >
                                Add Reward
                            </Button>
                            {rewards.length === 0 && (
                                <Button
                                    variant="text"
                                    onClick={handleSeedDefaults}
                                >
                                    Load Examples
                                </Button>
                            )}
                        </Stack>

                        {rewards.length === 0 ? (
                            <Typography color="text.secondary" textAlign="center">
                                No rewards in shop
                            </Typography>
                        ) : (
                            <List>
                                {rewards.map((r) => (
                                    <ListItem key={r.id} divider>
                                        <ListItemText
                                            primary={`${r.icon} ${r.title}`}
                                            secondary={
                                                <Chip
                                                    label={`${r.cost} Gold`}
                                                    size="small"
                                                    color="warning"
                                                    variant="outlined"
                                                />
                                            }
                                        />
                                        <ListItemSecondaryAction>
                                            <IconButton onClick={() => setEditingReward(r)} color="info">
                                                <EditIcon />
                                            </IconButton>
                                            <IconButton onClick={() => handleDelete(r)} color="error">
                                                <DeleteIcon />
                                            </IconButton>
                                        </ListItemSecondaryAction>
                                    </ListItem>
                                ))}
                            </List>
                        )}
                    </Box>
                )}
            </DialogContent>

            <DialogActions>
                {showForm ? (
                    <>
                        <Button onClick={resetForm}>Cancel</Button>
                        <Button onClick={handleSave} variant="contained" disabled={!title.trim()}>
                            {editingReward ? 'Save' : 'Create'}
                        </Button>
                    </>
                ) : (
                    <Button onClick={onClose}>Close</Button>
                )}
            </DialogActions>
        </Dialog>
    );
};

export default RewardsManager;
