/**
 * @fileoverview Profile Management Component
 * 
 * JUNIOR DEV NOTE: This component handles CRUD operations for user profiles.
 * 
 * KEY FEATURES:
 * 1. Add/Edit/Delete family members
 * 2. Parent/Child profile designation (toggle switch)
 * 3. Per-user PIN setup for parent accounts
 * 4. Touch-friendly dialogs (no browser confirm())
 * 
 * DESIGN PATTERN: Modal-based CRUD
 * All create/edit operations happen in a dialog to keep the main UI clean.
 */

import React, { useState } from 'react';
import {
    Box,
    Typography,
    Avatar,
    IconButton,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Switch,
    FormControlLabel,
    Chip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { useUser } from '../users/useUser';

// Available avatar options for profile customization
const EMOJI_OPTIONS = ['👤', '👩', '👨', '👧', '👦', '👶', '🧒', '👱', '🧔', '👵'];
// Color palette for profile cards
const COLOR_OPTIONS = ['#e91e63', '#2196f3', '#ff9800', '#4caf50', '#9c27b0', '#00bcd4', '#ff5722', '#607d8b'];

/**
 * ProfileManagement Component
 * 
 * @param {Object} props
 * @param {number} props.editingUserId - Currently selected user ID for editing settings
 * @param {function} props.onSelect - Callback when user selects a profile
 */
const ProfileManagement = ({ editingUserId, onSelect }) => {
    const { users, addUser, updateUser, deleteUser, setUserPin } = useUser();

    // Dialog state management
    const [dialogOpen, setDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null); // null = adding new, object = editing
    const [userToDelete, setUserToDelete] = useState(null);

    // Form state
    const [name, setName] = useState('');
    const [emoji, setEmoji] = useState('👤');
    const [color, setColor] = useState('#9c27b0');
    const [isParent, setIsParent] = useState(false);
    const [pin, setPin] = useState('');

    /**
     * Open dialog for adding a new profile
     */
    const handleOpenAdd = () => {
        setEditingUser(null);
        setName('');
        setEmoji('👤');
        setColor('#9c27b0');
        setIsParent(false);
        setPin('');
        setDialogOpen(true);
    };

    /**
     * Open dialog for editing an existing profile
     * 
     * JUNIOR DEV NOTE: We populate form fields from the selected user's data.
     * The PIN field shows empty even if a PIN is set (for security).
     */
    const handleOpenEdit = (e, user) => {
        e.stopPropagation(); // Prevent card selection
        setEditingUser(user);
        setName(user.name);
        setEmoji(user.avatar);
        setColor(user.color);
        setIsParent(user.isParent || false);
        setPin(''); // Don't pre-fill PIN for security
        setDialogOpen(true);
    };

    /**
     * Save profile (add or update)
     */
    const handleSave = () => {
        if (!name.trim()) return;

        if (editingUser) {
            // Update existing user
            updateUser(editingUser.id, {
                name: name.trim(),
                avatar: emoji,
                color,
                isParent,
            });

            // If parent and PIN provided, set the PIN
            if (isParent && pin.length === 4) {
                setUserPin(editingUser.id, pin);
            }
        } else {
            // Add new user
            const newUser = addUser(name.trim(), color, emoji, isParent);

            // If parent and PIN provided, set the PIN
            if (newUser && isParent && pin.length === 4) {
                setUserPin(newUser.id, pin);
            }
        }

        // Reset form and close dialog
        setName('');
        setEmoji('👤');
        setColor('#9c27b0');
        setIsParent(false);
        setPin('');
        setEditingUser(null);
        setDialogOpen(false);
    };

    /**
     * Open delete confirmation dialog
     * 
     * JUNIOR DEV NOTE: We replaced browser's confirm() with a touch-friendly
     * MUI Dialog. This is better for kiosk touchscreens.
     */
    const handleOpenDelete = (e, user) => {
        e.stopPropagation();
        setUserToDelete(user);
        setDeleteDialogOpen(true);
    };

    /**
     * Confirm profile deletion
     */
    const handleConfirmDelete = () => {
        if (userToDelete) {
            deleteUser(userToDelete.id);
        }
        setUserToDelete(null);
        setDeleteDialogOpen(false);
    };

    return (
        <Box>
            {/* Header with Add Button */}
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                <Typography variant="subtitle2" color="text.secondary">Family Members</Typography>
                <Button size="small" startIcon={<AddIcon />} onClick={handleOpenAdd}>Add</Button>
            </Box>

            {/* Profile Cards Grid */}
            <Box display="flex" gap={2} flexWrap="wrap">
                {users.map(user => (
                    <Box
                        key={user.id}
                        onClick={() => onSelect?.(user.id)}
                        sx={{
                            position: 'relative',
                            cursor: 'pointer',
                            '&:hover': { transform: 'scale(1.03)' },
                            transition: 'transform 0.2s',
                        }}
                    >
                        {/* Profile Card */}
                        <Box sx={{
                            textAlign: 'center',
                            p: 1.5,
                            borderRadius: 2,
                            bgcolor: editingUserId === user.id ? 'primary.light' : 'action.hover',
                            color: editingUserId === user.id ? 'primary.contrastText' : 'text.primary',
                            border: editingUserId === user.id ? '2px solid' : '2px solid transparent',
                            borderColor: 'primary.main',
                            minWidth: 90,
                        }}>
                            {/* Edit Button */}
                            <IconButton
                                size="small"
                                onClick={(e) => handleOpenEdit(e, user)}
                                sx={{
                                    position: 'absolute',
                                    top: -8,
                                    left: -8,
                                    bgcolor: 'background.paper',
                                    boxShadow: 1,
                                    '&:hover': { bgcolor: 'primary.main', color: 'white' }
                                }}
                            >
                                <EditIcon fontSize="small" />
                            </IconButton>

                            {/* Delete Button (only if more than 1 user) */}
                            {users.length > 1 && (
                                <IconButton
                                    size="small"
                                    onClick={(e) => handleOpenDelete(e, user)}
                                    sx={{
                                        position: 'absolute',
                                        top: -8,
                                        right: -8,
                                        bgcolor: 'background.paper',
                                        boxShadow: 1,
                                        '&:hover': { bgcolor: 'error.main', color: 'white' }
                                    }}
                                >
                                    <DeleteIcon fontSize="small" />
                                </IconButton>
                            )}

                            {/* Avatar */}
                            <Avatar sx={{
                                width: 48,
                                height: 48,
                                bgcolor: user.color,
                                mx: 'auto',
                                mb: 1,
                                border: '2px solid white'
                            }}>
                                {user.avatar}
                            </Avatar>

                            {/* Name */}
                            <Typography
                                variant="caption"
                                fontWeight={editingUserId === user.id ? 'bold' : 'normal'}
                            >
                                {user.name}
                            </Typography>

                            {/* Parent Badge */}
                            {user.isParent && (
                                <Chip
                                    label="Parent"
                                    size="small"
                                    color="primary"
                                    sx={{ mt: 0.5, fontSize: '0.65rem', height: 18 }}
                                />
                            )}
                        </Box>
                    </Box>
                ))}
            </Box>

            {/* Add/Edit Profile Dialog */}
            <Dialog
                open={dialogOpen}
                onClose={() => setDialogOpen(false)}
                maxWidth="xs"
                fullWidth
            >
                <DialogTitle>
                    {editingUser ? 'Edit Profile' : 'Add Profile'}
                </DialogTitle>
                <DialogContent sx={{ pt: 2 }}>
                    {/* Name Field */}
                    <TextField
                        autoFocus
                        fullWidth
                        label="Name"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        sx={{ mb: 2 }}
                    />

                    {/* Avatar Selection */}
                    <Typography variant="caption" display="block" mb={1}>Avatar</Typography>
                    <Box display="flex" gap={1} flexWrap="wrap" mb={2}>
                        {EMOJI_OPTIONS.map(e => (
                            <IconButton
                                key={e}
                                onClick={() => setEmoji(e)}
                                sx={{
                                    fontSize: '1.5rem',
                                    border: emoji === e ? '2px solid' : 'none',
                                    borderColor: 'primary.main',
                                    minWidth: 44,
                                    minHeight: 44,
                                }}
                            >
                                {e}
                            </IconButton>
                        ))}
                    </Box>

                    {/* Color Selection */}
                    <Typography variant="caption" display="block" mb={1}>Color</Typography>
                    <Box display="flex" gap={1} mb={2}>
                        {COLOR_OPTIONS.map(c => (
                            <Box
                                key={c}
                                onClick={() => setColor(c)}
                                sx={{
                                    width: 32,
                                    height: 32,
                                    borderRadius: '50%',
                                    bgcolor: c,
                                    cursor: 'pointer',
                                    border: color === c ? '3px solid white' : 'none',
                                    boxShadow: color === c ? `0 0 0 2px ${c}` : 'none'
                                }}
                            />
                        ))}
                    </Box>

                    {/* Parent/Child Toggle */}
                    <FormControlLabel
                        control={
                            <Switch
                                checked={isParent}
                                onChange={(e) => setIsParent(e.target.checked)}
                                color="primary"
                            />
                        }
                        label={
                            <Box>
                                <Typography variant="body2">Parent Account</Typography>
                                <Typography variant="caption" color="text.secondary">
                                    Can set PIN and access settings
                                </Typography>
                            </Box>
                        }
                        sx={{ mb: 2 }}
                    />

                    {/* PIN Setup (only for parents) */}
                    {isParent && (
                        <TextField
                            fullWidth
                            label="Set PIN (4 digits)"
                            value={pin}
                            onChange={e => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                            type="password"
                            inputProps={{ maxLength: 4, inputMode: 'numeric' }}
                            helperText={editingUser?.pin ? 'Leave blank to keep current PIN' : 'Required for settings access'}
                            sx={{ mb: 1 }}
                        />
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 2, gap: 1 }}>
                    <Button onClick={() => setDialogOpen(false)} sx={{ minHeight: 44 }}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSave}
                        variant="contained"
                        disabled={!name.trim() || (isParent && !editingUser?.pin && pin.length !== 4)}
                        sx={{ minHeight: 44 }}
                    >
                        {editingUser ? 'Save' : 'Add'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
            >
                <DialogTitle>Delete Profile?</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to delete <strong>{userToDelete?.name}</strong>'s profile?
                        This cannot be undone.
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ p: 2, gap: 1 }}>
                    <Button onClick={() => setDeleteDialogOpen(false)} sx={{ minHeight: 44 }}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleConfirmDelete}
                        variant="contained"
                        color="error"
                        sx={{ minHeight: 44 }}
                    >
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ProfileManagement;
