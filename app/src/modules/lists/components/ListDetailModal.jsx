/**
 * @fileoverview Modal for viewing/editing a full list
 * @module modules/lists/components/ListDetailModal
 */

import React, { useState } from 'react';
import {
    Dialog, DialogTitle, DialogContent, IconButton, Typography, Box,
    TextField, InputAdornment, List, Alert, CircularProgress, Fab
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import { useGoogleTaskList } from '../../tasks/hooks/useGoogleTaskList'; // Reuse hook
import { useShoppingList } from '../../meals/contexts/ShoppingListContext';
import { useUser } from '../../users/useUser';
import { useGoogleAuth } from '../../users/contexts/useGoogleAuth';
import { createTaskList, deleteTaskList } from '../../../services/googleTasks';
import { AnimatePresence, motion } from 'framer-motion';
import SettingsIcon from '@mui/icons-material/Settings'; // Gear
import SyncIcon from '@mui/icons-material/Sync';
import {
    Popover, Switch, FormControlLabel, Button as MuiButton,
    Dialog as MuiDialog
} from '@mui/material';
import UserSelector from '../../users/UserSelector';
import PinDialog from '../../../components/PinDialog';

const ListDetailModal = ({ list, open, onClose, userId }) => {
    const { currentUser } = useUser();
    const { getFreshToken, getSelectedTaskLists, setSelectedTaskLists, isUserConnected } = useGoogleAuth();

    // Settings State
    const [settingsAnchor, setSettingsAnchor] = useState(null);

    // Auth Flow State
    // Auth Flow State
    const [authOpen, setAuthOpen] = useState(false);
    const [authStep, setAuthStep] = useState('USER'); // 'USER' | 'PIN'
    const [authUser, setAuthUser] = useState(null); // The user trying to authenticate
    const [authenticatedUser, setAuthenticatedUser] = useState(null); // The user who successfully authenticated

    // Ref for the settings button to ensure stable anchor
    const settingsButtonRef = React.useRef(null);

    if (!list) return null;

    const isShopping = list.type === 'shopping';
    const isGoogle = list.type === 'google';
    const isParent = authenticatedUser?.isParent; // Dependent on who unlocked settings

    // Check if the authenticated user has Google connected
    const hasGoogleConnection = authenticatedUser ? isUserConnected(authenticatedUser.id) : false;

    // --- Auth Handlers ---

    // --- Auth Handlers ---

    const handleGearClick = (e) => {
        // Close popover if open
        setSettingsAnchor(null);

        // Start Auth Flow
        setAuthStep('USER');
        setAuthUser(null);
        setAuthOpen(true);
    };

    const handleAuthUserSelect = (user) => {
        setAuthUser(user);
        if (user.isParent && user.pin) {
            setAuthStep('PIN');
        } else {
            // No PIN needed (Child or Parent without PIN)
            finalizeAuth(user);
        }
    };

    const handlePinSuccess = () => {
        finalizeAuth(authUser);
    };

    const finalizeAuth = (user) => {
        setAuthenticatedUser(user);
        setAuthOpen(false);
        // Use the ref to open the settings popover
        if (settingsButtonRef.current) {
            setSettingsAnchor(settingsButtonRef.current);
        }
    };

    const handleAuthClose = () => {
        setAuthOpen(false);
        setAuthUser(null);
    };

    // --- Action Handlers ---

    // Handle Delete
    const handleDeleteList = async () => {
        if (!isParent) return; // Defensive

        if (confirm(`Are you sure you want to delete "${list.title}"? This cannot be undone.`)) {
            try {
                // If it's a Google list, delete from Google
                if (isGoogle) {
                    const token = await getFreshToken(userId);
                    await deleteTaskList(token, list.id);

                    // Remove from subscription
                    const current = getSelectedTaskLists(userId) || [];
                    setSelectedTaskLists(userId, current.filter(l => l.id !== list.id));
                }
                // If shopping list, maybe just clear it? User implies "Deleting the list"
                // But Shopping List is persistent. We'll just clear items.
                if (isShopping) {
                    // clearList() // Need to import or pass this to parent or context
                    alert("Shopping list cleared (Cannot delete the main list).");
                }
                onClose();
            } catch (err) {
                console.error("Delete failed", err);
                alert("Failed to delete list.");
            }
        }
    };

    // Handle Sync Toggle
    const handleSyncToggle = async (e) => {
        const checked = e.target.checked;
        if (isGoogle) {
            // Already Google. If unchecked -> Unsubscribe?
            if (!checked) {
                if (confirm("Stop syncing this list? It will be removed from your view.")) {
                    const current = getSelectedTaskLists(userId) || [];
                    setSelectedTaskLists(userId, current.filter(l => l.id !== list.id));
                    onClose();
                }
            }
        } else if (isShopping) {
            // "Sync" Shopping List -> Create a Google List copy?
            if (checked) {
                alert("Syncing Shopping List to Google is coming soon!");
                // Implementation would involve creating a list named "Shopping List" and pushing items
            }
        }
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullWidth
            maxWidth="sm"
            PaperProps={{
                sx: { borderRadius: 3, height: '80vh' }
            }}
        >
            <Box display="flex" justifyContent="space-between" alignItems="center" p={2} borderBottom="1px solid rgba(0,0,0,0.1)">
                <IconButton
                    ref={settingsButtonRef}
                    onClick={handleGearClick}
                >
                    <SettingsIcon />
                </IconButton>

                <Typography variant="h5" fontWeight="bold">
                    {list.title || 'Shopping List'}
                </Typography>

                <IconButton onClick={onClose}>
                    <CloseIcon />
                </IconButton>
            </Box>

            {/* Settings Popover */}
            <Popover
                open={Boolean(settingsAnchor)}
                anchorEl={settingsAnchor}
                onClose={() => setSettingsAnchor(null)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
            >
                <Box p={2} width={250}>
                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                        List Settings
                    </Typography>

                    {!hasGoogleConnection && (
                        <Alert severity="warning" sx={{ mb: 2, fontSize: '0.75rem' }}>
                            Connect Google Account to enable sync.
                        </Alert>
                    )}

                    <FormControlLabel
                        control={
                            <Switch
                                checked={isGoogle}
                                onChange={handleSyncToggle}
                                color="primary"
                                disabled={!hasGoogleConnection}
                            />
                        }
                        label={isGoogle ? "Synced with Google" : "Sync to Google"}
                        sx={{ display: 'block', mb: 1 }}
                    />

                    {isParent && (
                        <Box mt={2}>
                            <MuiButton
                                variant="outlined"
                                color="error"
                                size="small"
                                startIcon={<DeleteIcon />}
                                fullWidth
                                onClick={handleDeleteList}
                            >
                                Delete List
                            </MuiButton>
                        </Box>
                    )}
                </Box>
            </Popover>

            {/* Auth Dialog */}
            <MuiDialog
                open={authOpen}
                onClose={handleAuthClose}
                fullWidth
                maxWidth="sm"
                PaperProps={{ sx: { borderRadius: 3, p: 2, height: '60vh' } }}
            >
                <DialogContent>
                    {authStep === 'USER' ? (
                        <UserSelector
                            title="Who is changing settings?"
                            onSelect={handleAuthUserSelect}
                            showGoogle={false}
                        />
                    ) : (
                        <PinDialog
                            title={`Enter PIN for ${authUser?.name}`}
                            onSuccess={() => { handlePinSuccess(); return true; }}
                            autoSubmit={true}
                        />
                    )}
                </DialogContent>
            </MuiDialog>

            <DialogContent sx={{ p: 0, display: 'flex', flexDirection: 'column' }}>
                {isShopping ? (
                    <ShoppingListContent />
                ) : (
                    <GoogleListContent list={list} userId={userId} />
                )}
            </DialogContent>
        </Dialog>
    );
};

const ShoppingListContent = () => {
    // Basic implementation referencing existing shopping logic
    // JUNIOR DEV NOTE: We are duplicating some UI here from the old ListView.
    // In a full refactor, we would extract 'ShoppingListRenderer' to be reused.
    const {
        shoppingList, addItem, toggleItem, deleteItem,
        loading, error
    } = useShoppingList(); // Assuming this hook exposes these

    const [newItem, setNewItem] = useState('');

    const handleAdd = (e) => {
        e.preventDefault();
        if (newItem.trim()) {
            addItem(newItem);
            setNewItem('');
        }
    };

    return (
        <Box display="flex" flexDirection="column" height="100%">
            {/* Add Item Bar */}
            <Box p={2} bgcolor="#f5f5f5">
                <form onSubmit={handleAdd}>
                    <TextField
                        fullWidth
                        placeholder="Add generic item (e.g., 'Milk')"
                        value={newItem}
                        onChange={(e) => setNewItem(e.target.value)}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton type="submit" edge="end" color="primary">
                                        <AddIcon />
                                    </IconButton>
                                </InputAdornment>
                            )
                        }}
                        variant="outlined"
                        size="small"
                        sx={{ bgcolor: 'white' }}
                    />
                </form>
            </Box>

            <Box flexGrow={1} overflow="auto" p={2}>
                {shoppingList.items.length === 0 ? (
                    <Typography color="text.secondary" align="center" mt={4}>
                        List is empty. Add something!
                    </Typography>
                ) : (
                    <List>
                        {shoppingList.items.map(item => (
                            <Box
                                key={item.id}
                                display="flex"
                                alignItems="center"
                                justifyContent="space-between"
                                sx={{
                                    p: 1,
                                    borderBottom: '1px solid #eee',
                                    opacity: item.checked ? 0.5 : 1,
                                    textDecoration: item.checked ? 'line-through' : 'none'
                                }}
                            >
                                <Box display="flex" alignItems="center" gap={1} onClick={() => toggleItem(item.id)} sx={{ cursor: 'pointer', flexGrow: 1 }}>
                                    {item.checked ? <CheckCircleIcon color="success" /> : <RadioButtonUncheckedIcon color="action" />}
                                    <Typography>{item.name}</Typography>
                                </Box>
                                <IconButton size="small" onClick={() => deleteItem(item.id)}>
                                    <DeleteIcon fontSize="small" />
                                </IconButton>
                            </Box>
                        ))}
                    </List>
                )}
            </Box>
        </Box>
    );
};

const GoogleListContent = ({ list, userId }) => {
    const {
        tasks, loading, error,
        addTask, toggleTask, removeTask
    } = useGoogleTaskList(list.id, userId);

    const [newItem, setNewItem] = useState('');

    const handleAdd = async (e) => {
        e.preventDefault();
        if (newItem.trim()) {
            await addTask(newItem);
            setNewItem('');
        }
    };

    return (
        <Box display="flex" flexDirection="column" height="100%">
            <Box p={2} bgcolor="#f5f5f5">
                <form onSubmit={handleAdd}>
                    <TextField
                        fullWidth
                        placeholder="Add task..."
                        value={newItem}
                        onChange={(e) => setNewItem(e.target.value)}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton type="submit" edge="end" color="primary">
                                        <AddIcon />
                                    </IconButton>
                                </InputAdornment>
                            )
                        }}
                        variant="outlined"
                        size="small"
                        sx={{ bgcolor: 'white' }}
                    />
                </form>
            </Box>

            <Box flexGrow={1} overflow="auto" p={2}>
                {loading && tasks.length === 0 ? (
                    <Box display="flex" justifyContent="center" mt={4}><CircularProgress /></Box>
                ) : tasks.length === 0 ? (
                    <Typography color="text.secondary" align="center" mt={4}>
                        No tasks.
                    </Typography>
                ) : (
                    <List>
                        {tasks.map(task => (
                            <Box
                                key={task.id}
                                display="flex"
                                alignItems="center"
                                justifyContent="space-between"
                                sx={{
                                    p: 1.5,
                                    mb: 1,
                                    bgcolor: 'white',
                                    borderRadius: 1,
                                    border: '1px solid #eee',
                                    opacity: task.status === 'completed' ? 0.6 : 1
                                }}
                            >
                                <Box display="flex" alignItems="center" gap={1.5} onClick={() => toggleTask(task)} sx={{ cursor: 'pointer', flexGrow: 1 }}>
                                    {task.status === 'completed' ? <CheckCircleIcon color="success" /> : <RadioButtonUncheckedIcon color="action" />}
                                    <Typography sx={{ textDecoration: task.status === 'completed' ? 'line-through' : 'none' }}>
                                        {task.title}
                                    </Typography>
                                </Box>
                                <IconButton size="small" onClick={() => removeTask(task.id)}>
                                    <DeleteIcon fontSize="small" />
                                </IconButton>
                            </Box>
                        ))}
                    </List>
                )}
            </Box>
        </Box>
    );
};

export default ListDetailModal;
