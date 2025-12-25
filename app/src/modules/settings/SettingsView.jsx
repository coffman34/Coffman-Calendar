/**
 * @fileoverview Settings view for app configuration and user management
 * @module modules/settings/SettingsView
 * 
 * EDUCATIONAL NOTES FOR JUNIOR DEVELOPERS:
 * 
 * WHY THIS FILE EXISTS:
 * This is the central configuration hub for the family calendar.
 * It manages profiles, Google account connections, theme customization,
 * and system settings.
 * 
 * DESIGN PATTERN: Dashboard Pattern
 * Multiple configuration sections organized in a grid layout.
 * 
 * FEATURES:
 * - Profile management (add/edit/delete family members)
 * - Google account connection per user
 * - Calendar selection
 * - Photo selection for screensaver
 * - Theme customization
 * - PIN security
 * - System controls (reboot)
 * 
 * SECURITY:
 * Protected by PIN - users must enter PIN to access settings.
 */

import React, { useState } from 'react';
import { Box, Typography, Button, Avatar, Select, MenuItem, Grid, TextField, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import GoogleConnectButton from '../../components/GoogleConnectButton';
import CalendarSelector from '../../components/CalendarSelector';
import PinDialog from '../../components/PinDialog';
import { useUser } from '../users/useUser';
import { useTheme } from '../../theme/useTheme';
import { usePin } from '../../components/usePin';
import AppCard from '../../components/AppCard';
import PhotoPicker from '../../components/AlbumSelector';
import ProfileManagement from './ProfileManagement';
import CollageFrameManager from '../../components/CollageFrameManager';
// Gamification Manager
import RewardsManager from '../rewards/RewardsManager';

const SettingsView = () => {
    const { currentUser, isUserConnected, googleTokens, users } = useUser();
    const { themeConfig, updateTheme, resetTheme } = useTheme();
    const { isUnlocked, verifyPin, setPin } = usePin();

    const [editingUserId, setEditingUserIdState] = useState(() => {
        const saved = localStorage.getItem('settings_editing_user_id');
        return saved ? Number(saved) : currentUser?.id;
    });

    const setEditingUserId = (id) => {
        setEditingUserIdState(id);
        localStorage.setItem('settings_editing_user_id', id);
    };

    const [changePinOpen, setChangePinOpen] = useState(false);
    const [newPin, setNewPin] = useState('');

    // Reboot confirmation dialog state
    const [rebootDialogOpen, setRebootDialogOpen] = useState(false);

    // Gamification manager dialog state
    const [rewardsManagerOpen, setRewardsManagerOpen] = useState(false);

    if (!isUnlocked) {
        return <PinDialog onSuccess={verifyPin} title="Enter PIN to access Settings" />;
    }

    const handleChangePin = () => {
        if (setPin(newPin)) {
            setNewPin('');
            setChangePinOpen(false);
        }
    };

    const selectedUser = users.find(u => u.id === editingUserId) || currentUser;

    // DEFENSIVE: Handle case where no users exist yet
    if (!selectedUser) {
        return (
            <Box p={3} textAlign="center">
                <Typography>Loading user profiles...</Typography>
            </Box>
        );
    }

    const isConnected = isUserConnected(selectedUser.id);

    return (
        <Box p={3} maxWidth={1200} mx="auto" height="100%" sx={{ overflow: 'auto' }}>
            <Typography variant="h4" mb={4} fontWeight="bold">Settings</Typography>

            <Grid container spacing={3}>
                {/* Profile Management */}
                <Grid size={{ xs: 12, md: 6 }}>
                    <AppCard title="Profiles" gradient="linear-gradient(135deg, #11998e 0%, #38ef7d 100%)">
                        <Box p={3}>
                            <ProfileManagement editingUserId={editingUserId} onSelect={setEditingUserId} />
                        </Box>
                    </AppCard>
                </Grid>

                {/* PIN Settings & System */}
                <Grid size={{ xs: 12, md: 6 }}>
                    <AppCard title="Security & System">
                        <Box p={3}>
                            <Typography variant="body2" color="text.secondary" mb={2}>Change your 4-digit PIN for accessing settings.</Typography>
                            <Button variant="outlined" onClick={() => setChangePinOpen(true)}>Change PIN</Button>

                            <Typography variant="body2" color="text.secondary" mt={3} mb={2}>Restart the kiosk device.</Typography>
                            <Button
                                variant="contained"
                                color="error"
                                onClick={() => setRebootDialogOpen(true)}
                                sx={{ minHeight: 44 }}
                            >
                                Reboot Kiosk
                            </Button>
                        </Box>
                    </AppCard>
                </Grid>

                {/* Visual Customization */}
                <Grid size={{ xs: 12, md: 6 }}>
                    <AppCard title="Appearance" gradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)">
                        <Box p={3}>
                            <Typography variant="subtitle2" color="text.secondary" mb={2}>Theme Colors</Typography>
                            <Box display="flex" gap={2} mb={3}>
                                {[{ label: 'Background', key: 'bgColor' }, { label: 'Cards', key: 'cardColor' }, { label: 'Accent', key: 'primaryColor' }].map(({ label, key }) => (
                                    <Box key={key}>
                                        <Typography variant="caption" display="block">{label}</Typography>
                                        <input type="color" value={themeConfig[key]} onChange={(e) => updateTheme({ [key]: e.target.value })} style={{ width: 60, height: 60, border: 'none', borderRadius: 12, cursor: 'pointer' }} />
                                    </Box>
                                ))}
                            </Box>
                            <Typography variant="subtitle2" color="text.secondary" mb={2}>Interface</Typography>
                            <Box display="flex" alignItems="center" justifyContent="space-between">
                                <Typography>Rounded Corners</Typography>
                                <Select size="small" value={themeConfig.borderRadius} onChange={(e) => updateTheme({ borderRadius: parseInt(e.target.value) })}>
                                    {[{ v: 4, l: 'Square (4px)' }, { v: 12, l: 'Soft (12px)' }, { v: 24, l: 'Round (24px)' }, { v: 32, l: 'Extra Round (32px)' }].map(({ v, l }) => <MenuItem key={v} value={v}>{l}</MenuItem>)}
                                </Select>
                            </Box>
                            <Box mt={3} display="flex" justifyContent="flex-end">
                                <Button onClick={resetTheme} color="error" size="small">Reset to Default</Button>
                            </Box>
                        </Box>
                    </AppCard>
                </Grid>

                {/* Google Calendar Sync */}
                <Grid size={{ xs: 12, md: 6 }}>
                    <AppCard title={`Sync: ${selectedUser.name}`} gradient="linear-gradient(135deg, #60A5FA 0%, #8B5CF6 100%)">
                        <Box p={3}>
                            <Typography variant="body2" color="text.secondary" mb={2}>
                                {isConnected ? `${selectedUser.name}'s Google Calendar is connected.` : `Connect ${selectedUser.name}'s Google account to sync calendar events.`}
                            </Typography>
                            <GoogleConnectButton userId={selectedUser.id} />
                            {isConnected && (
                                <>
                                    <CalendarSelector userId={selectedUser.id} />
                                    <Typography variant="caption" color="text.secondary" mt={2} display="block">Shared calendars will appear for all family members.</Typography>
                                </>
                            )}
                        </Box>
                    </AppCard>
                </Grid>

                {/* Screensaver Section */}
                <Grid size={{ xs: 12, md: 6 }}>
                    <AppCard title={`Photos: ${selectedUser.name}`} gradient="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)">
                        <Box p={3}>
                            {isConnected ? (
                                <PhotoPicker userId={selectedUser.id} onPhotosSelected={(photos) => console.log('Photos:', photos)} />
                            ) : (
                                <Box textAlign="center" py={4} bgcolor="action.hover" borderRadius={2}>
                                    <Typography color="text.secondary">Connect Google account above to select photos for {selectedUser.name}.</Typography>
                                </Box>
                            )}
                        </Box>
                    </AppCard>
                </Grid>

                {/* Collage Frames */}
                <Grid size={{ xs: 12, md: 6 }}>
                    <AppCard title="Collage Frames" gradient="linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)">
                        <Box p={3}>
                            <CollageFrameManager />
                        </Box>
                    </AppCard>
                </Grid>

                {/* Gamification Settings */}
                <Grid size={{ xs: 12, md: 6 }}>
                    <AppCard title="Gamification" gradient="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)">
                        <Box p={3}>
                            <Typography variant="body2" color="text.secondary" mb={2}>
                                Manage reward shop items. Tasks earn XP and Gold when completed.
                            </Typography>
                            <Button
                                variant="outlined"
                                onClick={() => setRewardsManagerOpen(true)}
                                sx={{ minHeight: 44 }}
                            >
                                Manage Rewards
                            </Button>
                        </Box>
                    </AppCard>
                </Grid>
            </Grid>

            {/* Change PIN Dialog */}
            <Dialog open={changePinOpen} onClose={() => setChangePinOpen(false)}>
                <DialogTitle>Change PIN</DialogTitle>
                <DialogContent>
                    <TextField autoFocus fullWidth label="New 4-digit PIN" value={newPin} onChange={e => setNewPin(e.target.value.replace(/\D/g, '').slice(0, 4))} type="password" inputProps={{ maxLength: 4 }} sx={{ mt: 1 }} />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setChangePinOpen(false)}>Cancel</Button>
                    <Button onClick={handleChangePin} variant="contained" disabled={newPin.length !== 4}>Save</Button>
                </DialogActions>
            </Dialog>

            {/* Reboot Confirmation Dialog - Touch-friendly replacement for window.confirm */}
            <Dialog open={rebootDialogOpen} onClose={() => setRebootDialogOpen(false)}>
                <DialogTitle>Reboot Kiosk?</DialogTitle>
                <DialogContent>
                    <Typography>Are you sure you want to reboot the kiosk device? The display will go dark for a moment.</Typography>
                </DialogContent>
                <DialogActions sx={{ p: 2, gap: 1 }}>
                    <Button onClick={() => setRebootDialogOpen(false)} sx={{ minHeight: 44 }}>Cancel</Button>
                    <Button
                        onClick={() => {
                            setRebootDialogOpen(false);
                            fetch('/api/system/reboot', { method: 'POST' });
                        }}
                        variant="contained"
                        color="error"
                        sx={{ minHeight: 44 }}
                    >
                        Reboot
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Rewards Manager Dialog */}
            <RewardsManager
                open={rewardsManagerOpen}
                onClose={() => setRewardsManagerOpen(false)}
            />
        </Box>
    );
};

export default SettingsView;
