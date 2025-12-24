/**
 * @fileoverview Rewards view component (placeholder)
 * @module modules/rewards/RewardsView
 * 
 * EDUCATIONAL NOTES FOR JUNIOR DEVELOPERS:
 * 
 * WHY THIS FILE EXISTS:
 * Placeholder for future rewards/achievements system.
 * Could track completed tasks, chores, or other family goals.
 * 
 * FUTURE FEATURES:
 * - Track completed tasks
 * - Award points/badges
 * - Leaderboard
 * - Reward redemption
 */

import React from 'react';
import { Box, Typography } from '@mui/material';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';

const RewardsView = () => {
    return (
        <Box sx={{ p: 3, textAlign: 'center' }}>
            <EmojiEventsIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h5" color="text.secondary">
                Rewards
            </Typography>
            <Typography variant="body2" color="text.disabled">
                Coming soon
            </Typography>
        </Box>
    );
};

export default RewardsView;
