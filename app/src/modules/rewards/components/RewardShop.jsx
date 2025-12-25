/**
 * @fileoverview RewardShop Component - Purchasable Items
 * @module modules/rewards/components/RewardShop
 */

import React from 'react';
import {
    Box,
    Typography,
    Paper,
    Grid,
    Button,
    Chip
} from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';

/**
 * RewardShop Component
 * 
 * @param {object} props
 * @param {Array} props.items - Shop items
 * @param {number} props.userGold - User's current gold
 * @param {Function} props.onPurchase - Called when item purchased
 */
const RewardShop = ({ items, userGold, onPurchase }) => {
    return (
        <Paper sx={{ p: 2, mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <ShoppingCartIcon color="primary" />
                <Typography variant="h6" fontWeight="bold">
                    Reward Shop
                </Typography>
            </Box>

            {items.length === 0 ? (
                <Typography color="text.secondary" textAlign="center">
                    No rewards available. Ask a parent to add some!
                </Typography>
            ) : (
                <Grid container spacing={2}>
                    {items.map(item => {
                        const canAfford = userGold >= item.cost;

                        return (
                            <Grid item xs={6} sm={4} key={item.id}>
                                <Paper
                                    variant="outlined"
                                    sx={{
                                        p: 1.5,
                                        textAlign: 'center',
                                        opacity: canAfford ? 1 : 0.6,
                                        transition: 'transform 0.2s',
                                        '&:hover': { transform: canAfford ? 'scale(1.02)' : 'none' }
                                    }}
                                >
                                    <Typography variant="h4" sx={{ mb: 0.5 }}>
                                        {item.icon || '🎁'}
                                    </Typography>
                                    <Typography variant="body2" fontWeight="medium" noWrap>
                                        {item.title}
                                    </Typography>
                                    <Chip
                                        label={`${item.cost} G`}
                                        size="small"
                                        color="warning"
                                        sx={{ my: 1 }}
                                    />
                                    <Button
                                        variant="contained"
                                        size="small"
                                        fullWidth
                                        disabled={!canAfford}
                                        onClick={() => onPurchase(item)}
                                    >
                                        {canAfford ? 'Buy' : 'Need More'}
                                    </Button>
                                </Paper>
                            </Grid>
                        );
                    })}
                </Grid>
            )}
        </Paper>
    );
};

export default RewardShop;
