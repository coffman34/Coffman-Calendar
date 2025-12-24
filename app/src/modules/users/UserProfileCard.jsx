import React, { useState } from 'react';
import { Paper, Avatar, TextField, Box, IconButton, Typography } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';
import { useUser } from './useUser';

const AVATAR_OPTIONS = ['👩', '👨', '👧', '👦', '👴', '👵', '🧑', '👤'];
const COLOR_OPTIONS = ['#e91e63', '#2196f3', '#ff9800', '#4caf50', '#9c27b0', '#00bcd4'];

const UserProfileCard = ({ user }) => {
    const { updateUser } = useUser();
    const [editing, setEditing] = useState(false);
    const [name, setName] = useState(user.name);
    const [avatar, setAvatar] = useState(user.avatar);
    const [color, setColor] = useState(user.color);

    const handleSave = () => {
        updateUser(user.id, { name, avatar, color });
        setEditing(false);
    };

    const handleCancel = () => {
        setName(user.name);
        setAvatar(user.avatar);
        setColor(user.color);
        setEditing(false);
    };

    return (
        <Paper sx={{ p: 3, mb: 2 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">Profile Settings</Typography>
                {editing ? (
                    <Box>
                        <IconButton onClick={handleSave} color="primary"><SaveIcon /></IconButton>
                        <IconButton onClick={handleCancel}><CloseIcon /></IconButton>
                    </Box>
                ) : (
                    <IconButton onClick={() => setEditing(true)}><EditIcon /></IconButton>
                )}
            </Box>

            <Box display="flex" gap={3} alignItems="center">
                <Avatar sx={{ width: 80, height: 80, bgcolor: color, fontSize: '2.5rem', cursor: editing ? 'pointer' : 'default' }}>
                    {avatar}
                </Avatar>
                {editing ? (
                    <Box flex={1}>
                        <TextField fullWidth label="Name" value={name} onChange={e => setName(e.target.value)} size="small" sx={{ mb: 2 }} />
                        <Typography variant="caption" display="block" mb={1}>Avatar</Typography>
                        <Box display="flex" gap={1} mb={2}>
                            {AVATAR_OPTIONS.map(a => (
                                <Box key={a} onClick={() => setAvatar(a)} sx={{ fontSize: '1.5rem', cursor: 'pointer', opacity: avatar === a ? 1 : 0.5, border: avatar === a ? '2px solid #333' : 'none', borderRadius: 1, p: 0.5 }}>{a}</Box>
                            ))}
                        </Box>
                        <Typography variant="caption" display="block" mb={1}>Color</Typography>
                        <Box display="flex" gap={1}>
                            {COLOR_OPTIONS.map(c => (
                                <Box key={c} onClick={() => setColor(c)} sx={{ width: 32, height: 32, bgcolor: c, borderRadius: '50%', cursor: 'pointer', border: color === c ? '3px solid #333' : 'none' }} />
                            ))}
                        </Box>
                    </Box>
                ) : (
                    <Typography variant="h5">{user.name}</Typography>
                )}
            </Box>
        </Paper>
    );
};

export default UserProfileCard;
