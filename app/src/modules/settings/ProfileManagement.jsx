import React, { useState } from 'react';
import { Box, Typography, Avatar, IconButton, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { useUser } from '../users/useUser';

const EMOJI_OPTIONS = ['👤', '👩', '👨', '👧', '👦', '👶', '🧒', '👱', '🧔', '👵'];
const COLOR_OPTIONS = ['#e91e63', '#2196f3', '#ff9800', '#4caf50', '#9c27b0', '#00bcd4', '#ff5722', '#607d8b'];

const ProfileManagement = ({ editingUserId, onSelect }) => {
    const { users, addUser, deleteUser } = useUser();
    const [dialogOpen, setDialogOpen] = useState(false);
    const [name, setName] = useState('');
    const [emoji, setEmoji] = useState('👤');
    const [color, setColor] = useState('#9c27b0');

    const handleAdd = () => {
        if (name.trim()) {
            addUser(name.trim(), color, emoji);
            setName(''); setEmoji('👤'); setColor('#9c27b0');
            setDialogOpen(false);
        }
    };

    const handleDelete = (e, userId) => {
        e.stopPropagation();
        if (users.length > 1 && confirm('Delete this profile?')) {
            deleteUser(userId);
        }
    };

    return (
        <Box>
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                <Typography variant="subtitle2" color="text.secondary">Family Members</Typography>
                <Button size="small" startIcon={<AddIcon />} onClick={() => setDialogOpen(true)}>Add</Button>
            </Box>

            <Box display="flex" gap={2} flexWrap="wrap">
                {users.map(user => (
                    <Box key={user.id} onClick={() => onSelect?.(user.id)} sx={{ '&:hover': { transform: 'scale(1.05)' }, transition: 'transform 0.2s', position: 'relative' }}>
                        <Box sx={{
                            textAlign: 'center',
                            p: 1.5,
                            borderRadius: 2,
                            bgcolor: editingUserId === user.id ? 'primary.light' : 'action.hover',
                            color: editingUserId === user.id ? 'primary.contrastText' : 'text.primary',
                            border: editingUserId === user.id ? '2px solid' : '2px solid transparent',
                            borderColor: 'primary.main',
                            minWidth: 80,
                            cursor: 'pointer',
                        }}>
                            {users.length > 1 && (
                                <IconButton size="small" onClick={(e) => handleDelete(e, user.id)} sx={{ position: 'absolute', top: -8, right: -8, bgcolor: 'background.paper', '&:hover': { bgcolor: 'error.main', color: 'white' } }}>
                                    <DeleteIcon fontSize="small" />
                                </IconButton>
                            )}
                            <Avatar sx={{ width: 48, height: 48, bgcolor: user.color, mx: 'auto', mb: 1, border: '2px solid white' }}>{user.avatar}</Avatar>
                            <Typography variant="caption" fontWeight={editingUserId === user.id ? 'bold' : 'normal'}>{user.name}</Typography>
                        </Box>
                    </Box>
                ))}
            </Box>

            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
                <DialogTitle>Add Profile</DialogTitle>
                <DialogContent sx={{ pt: 2 }}>
                    <TextField autoFocus fullWidth label="Name" value={name} onChange={e => setName(e.target.value)} sx={{ mb: 2 }} />
                    <Typography variant="caption" display="block" mb={1}>Avatar</Typography>
                    <Box display="flex" gap={1} flexWrap="wrap" mb={2}>
                        {EMOJI_OPTIONS.map(e => (
                            <IconButton key={e} onClick={() => setEmoji(e)} sx={{ fontSize: '1.5rem', border: emoji === e ? '2px solid' : 'none', borderColor: 'primary.main' }}>{e}</IconButton>
                        ))}
                    </Box>
                    <Typography variant="caption" display="block" mb={1}>Color</Typography>
                    <Box display="flex" gap={1}>
                        {COLOR_OPTIONS.map(c => (
                            <Box key={c} onClick={() => setColor(c)} sx={{ width: 32, height: 32, borderRadius: '50%', bgcolor: c, cursor: 'pointer', border: color === c ? '3px solid white' : 'none', boxShadow: color === c ? `0 0 0 2px ${c}` : 'none' }} />
                        ))}
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleAdd} variant="contained" disabled={!name.trim()}>Add</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ProfileManagement;
