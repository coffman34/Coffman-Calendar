/**
 * @fileoverview StatBar Component - XP Progress Display
 * @module modules/rewards/components/StatBar
 * 
 * JUNIOR DEV NOTE:
 * Displays the user's level and XP progress toward the next level.
 */

import React from 'react';
import { Box, Typography, LinearProgress, Paper } from '@mui/material';
import StarIcon from '@mui/icons-material/Star';

/**
 * StatBar Component
 * 
 * @param {object} props
 * @param {number} props.level - Current level
 * @param {number} props.xpInLevel - XP progress within current level
 * @param {number} props.xpToNextLevel - XP needed for next level
 */
const StatBar = ({ level, xpInLevel, xpToNextLevel }) => {
    const progress = (xpInLevel / xpToNextLevel) * 100;

    return (
        <Paper
            sx={{
                p: 2,
                mb: 2,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white'
            }}
        >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <StarIcon sx={{ fontSize: 28 }} />
                <Typography variant="h5" fontWeight="bold">
                    Level {level}
                </Typography>
            </Box>

            <LinearProgress
                variant="determinate"
                value={progress}
                sx={{
                    height: 12,
                    borderRadius: 6,
                    bgcolor: 'rgba(255,255,255,0.3)',
                    '& .MuiLinearProgress-bar': {
                        bgcolor: '#FFD700',
                        borderRadius: 6
                    }
                }}
            />

            <Typography variant="caption" sx={{ mt: 0.5, display: 'block', opacity: 0.9 }}>
                {xpInLevel} / {xpToNextLevel} XP
            </Typography>
        </Paper>
    );
};

export default StatBar;
