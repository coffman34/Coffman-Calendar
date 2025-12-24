import React from 'react';
import { Box, Typography, Avatar, Paper, IconButton, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useUser } from './useUser';

const UserManagement = ({ onBack }) => {
    const { users, currentUser, setCurrentUser, addUser, deleteUser, isUserConnected } = useUser();
    const [addDialogOpen, setAddDialogOpen] = React.useState(false);
    const [newName, setNewName] = React.useState('');

    const handleAddUser = () => {
        if (newName.trim()) {
            const user = addUser(newName.trim(), '#9c27b0', '👤');
            setCurrentUser(user);
            setNewName('');
            setAddDialogOpen(false);
        }
    };

    const handleDeleteUser = (userId) => {
        if (users.length > 1 && confirm('Delete this user?')) {
            deleteUser(userId);
        }
    };

    return (
        <Box sx={{ p: 3, height: '100%' }}>
            <Box display="flex" alignItems="center" gap={2} mb={3}>
                {onBack && <IconButton onClick={onBack}><ArrowBackIcon /></IconButton>}
                <Typography variant="h4" fontWeight="bold">Users</Typography>
                <Box sx={{ ml: 'auto' }}>
                    <Button startIcon={<AddIcon />} onClick={() => setAddDialogOpen(true)}>Add User</Button>
                </Box>
            </Box>

            <Typography variant="body1" color="text.secondary" mb={3}>
                Select a user to switch profiles. Manage settings in the Settings panel.
            </Typography>

            <Box display="flex" gap={3} flexWrap="wrap">
                {users.map(user => (
                    <Box key={user.id} sx={{ '&:hover': { transform: 'scale(1.03)' }, transition: 'transform 0.2s' }}>
                        <Paper onClick={() => setCurrentUser(user)} sx={{ p: 3, cursor: 'pointer', minWidth: 160, textAlign: 'center', border: currentUser.id === user.id ? `3px solid ${user.color}` : '3px solid transparent', position: 'relative' }}>
                            {users.length > 1 && (
                                <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleDeleteUser(user.id); }} sx={{ position: 'absolute', top: 4, right: 4 }}><DeleteIcon fontSize="small" /></IconButton>
                            )}
                            <Avatar sx={{ width: 72, height: 72, bgcolor: user.color, fontSize: '2rem', mx: 'auto', mb: 2 }}>{user.avatar}</Avatar>
                            <Typography variant="h6">{user.name}</Typography>
                            {isUserConnected(user.id) && <Typography variant="caption" color="success.main">Google Connected</Typography>}
                        </Paper>
                    </Box>
                ))}
            </Box>

            <Dialog open={addDialogOpen} onClose={() => setAddDialogOpen(false)}>
                <DialogTitle>Add New User</DialogTitle>
                <DialogContent><TextField autoFocus fullWidth label="Name" value={newName} onChange={e => setNewName(e.target.value)} sx={{ mt: 1 }} /></DialogContent>
                <DialogActions>
                    <Button onClick={() => setAddDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleAddUser} variant="contained" disabled={!newName.trim()}>Add</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default UserManagement;
