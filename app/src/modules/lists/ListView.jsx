/**
 * @fileoverview Lists view component (placeholder)
 * @module modules/lists/ListView
 * 
 * EDUCATIONAL NOTES FOR JUNIOR DEVELOPERS:
 * 
 * WHY THIS FILE EXISTS:
 * Placeholder for future shopping lists / to-do lists feature.
 * 
 * FUTURE FEATURES:
 * - Shopping lists
 * - Shared family lists
 * - List templates
 * - Check off items
 */

import React from 'react';
import { Box, Typography } from '@mui/material';
import ListAltIcon from '@mui/icons-material/ListAlt';

const ListView = () => {
    return (
        <Box sx={{ p: 3, textAlign: 'center' }}>
            <ListAltIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h5" color="text.secondary">
                Lists
            </Typography>
            <Typography variant="body2" color="text.disabled">
                Coming soon
            </Typography>
        </Box>
    );
};

export default ListView;
