/**
 * @fileoverview GoldDisplay Component - Currency Display
 * @module modules/rewards/components/GoldDisplay
 */

import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';

/**
 * GoldDisplay Component
 * 
 * @param {object} props
 * @param {number} props.gold - Amount of gold
 */
const GoldDisplay = ({ gold }) => {
    return (
        <Paper
            sx={{
                p: 2,
                mb: 2,
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                background: 'linear-gradient(135deg, #f5af19 0%, #f12711 100%)',
                color: 'white'
            }}
        >
            <MonetizationOnIcon sx={{ fontSize: 40 }} />
            <Box>
                <Typography variant="caption" sx={{ opacity: 0.9 }}>
                    Your Gold
                </Typography>
                <Typography variant="h4" fontWeight="bold">
                    {gold}
                </Typography>
            </Box>
        </Paper>
    );
};

export default GoldDisplay;
