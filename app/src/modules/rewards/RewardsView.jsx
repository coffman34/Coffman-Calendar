/**
 * @fileoverview RewardsView - Hero Dashboard with Stats, Shop, and Redemptions
 * @module modules/rewards/RewardsView
 * 
 * EDUCATIONAL NOTES FOR JUNIOR DEVELOPERS:
 * 
 * WHY THIS EXISTS:
 * The Rewards view is the "Hero Dashboard" where users see their progress
 * (XP, Level, Gold) and can spend Gold on real-world rewards.
 * 
 * FEATURES:
 * - StatBar: XP progress toward next level
 * - GoldDisplay: Current gold balance
 * - RewardShop: Items to purchase with gold
 * - RedemptionLog: History for parent fulfillment
 */

import React, { useState, useContext } from 'react';
import {
    Box,
    Typography,
    IconButton,
    Grid,
    CircularProgress,
    Alert,
    Dialog,
    DialogContent
} from '@mui/material';
import AppCard from '../../components/AppCard';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import SettingsIcon from '@mui/icons-material/Settings';

import { UserContext } from '../users/UserContextCore';
import { usePin } from '../../components/usePin';
import PinDialog from '../../components/PinDialog';
import UserSelector from '../users/UserSelector';
import { useGamification } from './hooks/useGamification';
import StatBar from './components/StatBar';
import GoldDisplay from './components/GoldDisplay';
import RewardShop from './components/RewardShop';
import RedemptionLog from './components/RedemptionLog';
import RewardsManager from './RewardsManager';

/**
 * RewardsView Component
 * 
 * @returns {React.ReactElement}
 */
const RewardsView = () => {
    // ========================================================================
    // STATE
    // ========================================================================

    // Who is currently viewing the rewards dashboard? (Null = Selection Screen)
    const [viewingUser, setViewingUser] = useState(null);

    // Gamification Hook tied to the VIEWING user (not necessarily the global currentUser)
    const {
        level,
        xpInLevel,
        xpToNextLevel,
        gold,
        shopItems,
        redemptions,
        loading,
        purchaseReward,
        refreshShop
    } = useGamification(viewingUser);

    const { currentUser: globalUser } = useContext(UserContext);
    const { verifyPin } = usePin();

    // UI State
    const [managerOpen, setManagerOpen] = useState(false);
    const [pinOpen, setPinOpen] = useState(false);
    const [pinMode, setPinMode] = useState('access'); // 'access' | 'manager'
    const [selectedCandidate, setSelectedCandidate] = useState(null);

    // ========================================================================
    // HANDLERS
    // ========================================================================

    /**
     * Handle User Selection from Landing Page
     */
    const handleUserSelect = (user) => {
        // If user has a PIN, verify it first
        if (user.pin) {
            setSelectedCandidate(user);
            setPinMode('access');
            setPinOpen(true);
        } else {
            // No PIN -> Grant immediate access
            setViewingUser(user);
        }
    };

    /**
     * Handle Manager Access (Add Rewards)
     */
    const handleManagerAccess = () => {
        // If the viewer IS a parent, allow access
        if (viewingUser?.isParent) {
            setManagerOpen(true);
            return;
        }

        // Otherwise (Child viewing), allow if a Parent enters PIN
        setPinMode('manager');
        setPinOpen(true);
    };

    /**
     * Handle PIN Success
     */
    const handlePinSuccess = (enteredPin) => {
        if (pinMode === 'access') {
            // Check against the CANDIDATE'S pin
            if (enteredPin === selectedCandidate?.pin) {
                setViewingUser(selectedCandidate);
                setPinOpen(false);
                return true;
            }
        } else if (pinMode === 'manager') {
            // Check against ANY parent PIN
            if (verifyPin(enteredPin)) {
                setManagerOpen(true);
                setPinOpen(false);
                return true;
            }
        }
        return false;
    };

    /**
     * Purchase Item (Directly for viewingUser)
     */
    const handlePurchase = async (item) => {
        const confirmed = window.confirm(`Buy "${item.title}" for ${item.cost} Gold?`);
        if (confirmed) {
            await purchaseReward(item, viewingUser.id);
        }
    };


    // ========================================================================
    // RENDER
    // ========================================================================

    // 1. LANDING PAGE: User Selector
    if (!viewingUser) {
        return (
            <>
                <UserSelector
                    title="Who is checking rewards?"
                    onSelect={handleUserSelect}
                    showGoogle={false}
                />

                <Dialog
                    open={pinOpen}
                    onClose={() => setPinOpen(false)}
                    maxWidth="xs"
                    fullWidth
                >
                    <Box sx={{ height: 500 }}>
                        <PinDialog
                            title={`Enter ${selectedCandidate?.name}'s PIN`}
                            onSuccess={handlePinSuccess}
                        />
                    </Box>
                </Dialog>
            </>
        );
    }

    // 2. DASHBOARD: Viewing Rewards for `viewingUser`
    const HeaderActions = (
        <Box>
            <IconButton
                onClick={handleManagerAccess}
                color="primary"
                data-testid="rewards-manager-btn"
            >
                <SettingsIcon />
            </IconButton>
        </Box>
    );

    return (
        <>
            <AppCard
                title={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <EmojiEventsIcon color="primary" />
                        <Typography variant="h5" fontWeight="bold">
                            {viewingUser.name}'s Rewards
                        </Typography>
                    </Box>
                }
                action={HeaderActions}
                sx={{ height: '100%' }}
            >
                <Box sx={{ p: 2, height: '100%', overflowY: 'auto' }}>
                    {loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                            <CircularProgress />
                        </Box>
                    ) : (
                        <Grid container spacing={2}>
                            {/* Left Column: Stats */}
                            <Grid item xs={12} md={4}>
                                <StatBar
                                    level={level}
                                    xpInLevel={xpInLevel}
                                    xpToNextLevel={xpToNextLevel}
                                />
                                <GoldDisplay gold={gold} />
                            </Grid>

                            {/* Right Column: Shop & Log */}
                            <Grid item xs={12} md={8}>
                                <RewardShop
                                    items={shopItems}
                                    userGold={gold}
                                    onPurchase={handlePurchase}
                                />
                                <RedemptionLog redemptions={redemptions} />
                            </Grid>
                        </Grid>
                    )}
                </Box>
            </AppCard>

            {/* Manager Dialog */}
            <RewardsManager
                open={managerOpen}
                onClose={() => setManagerOpen(false)}
                onSave={refreshShop}
            />

            {/* PIN Dialog (Manager Access) */}
            <Dialog
                open={pinOpen && pinMode === 'manager'}
                onClose={() => setPinOpen(false)}
                maxWidth="xs"
                fullWidth
            >
                <Box sx={{ height: 500 }}>
                    <PinDialog
                        title="Parent PIN Required"
                        onSuccess={handlePinSuccess}
                    />
                </Box>
            </Dialog>
        </>
    );
};

export default RewardsView;
