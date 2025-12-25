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
    Alert
} from '@mui/material';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import SettingsIcon from '@mui/icons-material/Settings';

import { UserContext } from '../users/UserContextCore';
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
    // CONTEXT & STATE
    // ========================================================================

    const { currentUser } = useContext(UserContext);
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
    } = useGamification();

    const [managerOpen, setManagerOpen] = useState(false);

    // ========================================================================
    // HANDLERS
    // ========================================================================

    const handlePurchase = async (item) => {
        const confirmed = window.confirm(`Buy "${item.title}" for ${item.cost} Gold?`);
        if (confirmed) {
            await purchaseReward(item);
        }
    };

    // ========================================================================
    // RENDER
    // ========================================================================

    // No user selected
    if (!currentUser) {
        return (
            <Box sx={{ p: 3, textAlign: 'center' }}>
                <EmojiEventsIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography color="text.secondary">
                    Select a profile to view rewards
                </Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ p: 2, height: '100%', overflowY: 'auto' }}>
            {/* Header */}
            <Box sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                mb: 2
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <EmojiEventsIcon color="primary" />
                    <Typography variant="h5" fontWeight="bold">
                        {currentUser.name}'s Rewards
                    </Typography>
                </Box>

                {/* Manager Button */}
                <IconButton
                    onClick={() => setManagerOpen(true)}
                    color="primary"
                    data-testid="rewards-manager-btn"
                >
                    <SettingsIcon />
                </IconButton>
            </Box>

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

            {/* Manager Dialog */}
            <RewardsManager
                open={managerOpen}
                onClose={() => setManagerOpen(false)}
                onSave={refreshShop}
            />
        </Box>
    );
};

export default RewardsView;
