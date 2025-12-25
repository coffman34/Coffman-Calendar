/**
 * @fileoverview Card component for a specific list in the dashboard
 * @module modules/lists/components/ListCard
 */

import React, { useEffect, useState } from 'react';
import {
    Card, CardActionArea, CardContent, Typography, Box,
    Skeleton, Chip
} from '@mui/material';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { useGoogleTaskList } from '../../tasks/hooks/useGoogleTaskList';
import { useShoppingList } from '../../meals/contexts/ShoppingListContext';

const ListCard = ({ list, onClick, userId }) => {
    const isShopping = list.type === 'shopping';
    const isGoogle = list.type === 'google';

    // Data fetching hooks (conditional usage is tricky in React, so we use both or specialized)
    // Actually, for cleaner code, we might want to split this into ShoppingListCard and GoogleListCard
    // But for now, let's keep it simple.

    // We need separate components because hooks can't be conditional
    if (isShopping) {
        return <ShoppingListCard onClick={onClick} />;
    }

    return <GoogleListCard list={list} onClick={onClick} userId={userId} />;
};

const ShoppingListCard = ({ onClick }) => {
    const { shoppingList } = useShoppingList();
    const items = shoppingList.items || [];
    const itemCount = items.length;
    const previewItems = items.slice(0, 3);

    return (
        <Card sx={{ height: '100%', borderRadius: 3, bgcolor: '#FFF3E0' }}>
            <CardActionArea sx={{ height: '100%', p: 2 }} onClick={onClick}>
                <Box display="flex" alignItems="center" gap={1} mb={2}>
                    <ShoppingCartIcon color="primary" />
                    <Typography variant="h6" fontWeight="bold">Shopping List</Typography>
                </Box>

                <Box sx={{ minHeight: 60 }}>
                    {itemCount === 0 ? (
                        <Typography variant="body2" color="text.secondary">Empty</Typography>
                    ) : (
                        previewItems.map(item => (
                            <Typography key={item.id} variant="body2" noWrap>• {item.name}</Typography>
                        ))
                    )}
                    {itemCount > 3 && (
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                            + {itemCount - 3} more
                        </Typography>
                    )}
                </Box>
            </CardActionArea>
        </Card>
    );
};

const GoogleListCard = ({ list, onClick, userId }) => {
    const { tasks, loading } = useGoogleTaskList(list.id, userId);

    // Filter out completed for preview? Usually yes.
    const activeTasks = tasks.filter(t => t.status !== 'completed');
    const previewItems = activeTasks.slice(0, 3);

    return (
        <Card sx={{ height: '100%', borderRadius: 3 }}>
            <CardActionArea sx={{ height: '100%', p: 2 }} onClick={onClick}>
                <Box display="flex" alignItems="center" gap={1} mb={2}>
                    <FormatListBulletedIcon color="action" />
                    <Typography variant="h6" fontWeight="bold" noWrap>{list.title}</Typography>
                </Box>

                <Box sx={{ minHeight: 60 }}>
                    {loading ? (
                        <Box>
                            <Skeleton width="80%" />
                            <Skeleton width="60%" />
                        </Box>
                    ) : activeTasks.length === 0 ? (
                        <Typography variant="body2" color="text.secondary">All caught up!</Typography>
                    ) : (
                        previewItems.map(task => (
                            <Typography key={task.id} variant="body2" noWrap>• {task.title}</Typography>
                        ))
                    )}
                    {activeTasks.length > 3 && (
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                            + {activeTasks.length - 3} more
                        </Typography>
                    )}
                </Box>
            </CardActionArea>
        </Card>
    );
};

export default ListCard;
