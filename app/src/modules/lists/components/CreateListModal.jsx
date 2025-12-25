/**
 * @fileoverview Modal to create a new task list
 * @module modules/lists/components/CreateListModal
 */

import React, { useState } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, TextField, Alert, CircularProgress
} from '@mui/material';
import { useGoogleAuth } from '../../users/contexts/useGoogleAuth';
import { createTaskList } from '../../../services/googleTasks';

const CreateListModal = ({ open, onClose, onListCreated, userId }) => {
    const { getFreshToken, setSelectedTaskLists, getSelectedTaskLists } = useGoogleAuth();

    const [title, setTitle] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const token = await getFreshToken(userId);
            if (!token) throw new Error('Not connected to Google');

            const newList = await createTaskList(token, title);

            // Auto-subscribe the user to the new list
            const currentSubscribed = getSelectedTaskLists(userId) || [];
            setSelectedTaskLists(userId, [...currentSubscribed, { id: newList.id, title: newList.title }]);

            onListCreated(newList);
            setTitle('');
            onClose();
        } catch (err) {
            console.error('Failed to create list:', err);
            setError('Failed to create list. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
            <DialogTitle>Create New List</DialogTitle>
            <form onSubmit={handleSubmit}>
                <DialogContent>
                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                    <TextField
                        autoFocus
                        label="List Name"
                        fullWidth
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        disabled={loading}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose} disabled={loading}>Cancel</Button>
                    <Button type="submit" variant="contained" disabled={loading || !title.trim()}>
                        {loading ? <CircularProgress size={24} /> : 'Create'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default CreateListModal;
