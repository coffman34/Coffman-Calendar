/**
 * @fileoverview Chores view component (placeholder)
 * @module modules/chores/ChoresView
 * 
 * EDUCATIONAL NOTES FOR JUNIOR DEVELOPERS:
 * 
 * WHY THIS FILE EXISTS:
 * Placeholder for future chore tracking feature.
 * 
 * FUTURE FEATURES:
 * - Assign chores to family members
 * - Track completion
 * - Recurring chores
 * - Chore rewards integration
 */

import React from 'react';
import { Box, Typography } from '@mui/material';
import CleaningServicesIcon from '@mui/icons-material/CleaningServices';

const ChoresView = () => {
    return (
        <Box sx={{ p: 3, textAlign: 'center' }}>
            <CleaningServicesIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h5" color="text.secondary">
                Chores
            </Typography>
            <Typography variant="body2" color="text.disabled">
                Coming soon
            </Typography>
        </Box>
    );
};

export default ChoresView;
