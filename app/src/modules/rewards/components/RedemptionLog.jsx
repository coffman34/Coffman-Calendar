/**
 * @fileoverview RedemptionLog Component - Parent Visibility of Purchases
 * @module modules/rewards/components/RedemptionLog
 */

import React from 'react';
import {
    Box,
    Typography,
    Paper,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Chip
} from '@mui/material';
import HistoryIcon from '@mui/icons-material/History';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import { formatDistanceToNow } from 'date-fns';

/**
 * RedemptionLog Component
 * 
 * @param {object} props
 * @param {Array} props.redemptions - List of redemption entries
 */
const RedemptionLog = ({ redemptions }) => {
    // Only show recent 5
    const recentRedemptions = redemptions.slice(0, 5);

    if (redemptions.length === 0) return null;

    return (
        <Paper sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <HistoryIcon color="primary" />
                <Typography variant="h6" fontWeight="bold">
                    Recent Redemptions
                </Typography>
            </Box>

            <List dense>
                {recentRedemptions.map(entry => (
                    <ListItem key={entry.id}>
                        <ListItemIcon sx={{ minWidth: 36 }}>
                            {entry.fulfilled ? (
                                <CheckCircleIcon color="success" fontSize="small" />
                            ) : (
                                <PendingIcon color="warning" fontSize="small" />
                            )}
                        </ListItemIcon>
                        <ListItemText
                            primary={entry.rewardTitle}
                            secondary={formatDistanceToNow(new Date(entry.redeemedAt), { addSuffix: true })}
                        />
                        <Chip
                            label={entry.fulfilled ? 'Given' : 'Pending'}
                            size="small"
                            color={entry.fulfilled ? 'success' : 'warning'}
                            variant="outlined"
                        />
                    </ListItem>
                ))}
            </List>
        </Paper>
    );
};

export default RedemptionLog;
