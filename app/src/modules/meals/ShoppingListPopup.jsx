/**
 * @fileoverview Shopping List Detail Popup
 * @module modules/meals/ShoppingListPopup
 * 
 * JUNIOR DEV NOTE: This modal displays the aggregated shopping list.
 * It groups items by aisle (Produce, Dairy, etc.) and allows checking them off.
 */

import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    List,
    ListItem,
    ListItemText,
    ListSubheader,
    ListItemIcon,
    Checkbox,
    IconButton,
    Typography,
    Box,
    Chip,
    Divider,
    useTheme
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ShareIcon from '@mui/icons-material/Share';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'; // For "All Done" state
import { useShoppingList } from './contexts/ShoppingListContext';

/**
 * Shopping List Popup Component
 * 
 * @param {Object} props
 * @param {boolean} props.open - Whether dialog is open
 * @param {Function} props.onClose - Search to close dialog
 */
const ShoppingListPopup = ({ open, onClose }) => {
    const theme = useTheme();
    const { shoppingList, toggleItem, clearList, getGroupedItems } = useShoppingList();

    const groups = getGroupedItems();
    const totalItems = shoppingList.items.length;
    const checkedItems = shoppingList.items.filter(i => i.checked).length;

    /**
     * Copy list to clipboard nicely formatted
     */
    const handleShare = () => {
        const text = groups.map(group => {
            const items = group.items
                .map(i => `- [${i.checked ? 'x' : ' '}] ${i.amount} ${i.unit} ${i.name}`)
                .join('\n');
            return `${group.icon} ${group.name}\n${items}`;
        }).join('\n\n');

        navigator.clipboard.writeText(text);
        // ideally show toast here
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: { borderRadius: 3, height: '80vh' }
            }}
        >
            {/* Header */}
            <DialogTitle sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                pb: 1
            }}>
                <Box>
                    <Typography variant="h5" sx={{ fontWeight: 600 }}>Shopping List</Typography>
                    <Typography variant="caption" color="text.secondary">
                        {checkedItems} / {totalItems} items checked
                    </Typography>
                </Box>
                <IconButton onClick={onClose} size="large">
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent dividers sx={{ p: 0 }}>
                {totalItems === 0 ? (
                    <Box sx={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'text.secondary',
                        p: 4
                    }}>
                        <CheckCircleOutlineIcon sx={{ fontSize: 64, mb: 2, opacity: 0.2 }} />
                        <Typography variant="h6">All set!</Typography>
                        <Typography variant="body2">No items in your shopping list.</Typography>
                    </Box>
                ) : (
                    <List sx={{ pb: 4 }}>
                        {groups.map((group) => (
                            <li key={group.id}>
                                <ul style={{ padding: 0 }}>
                                    <ListSubheader sx={{
                                        bgcolor: 'background.paper',
                                        fontWeight: 600,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 1
                                    }}>
                                        <span>{group.icon}</span>
                                        {group.name}
                                    </ListSubheader>
                                    {group.items.map((item) => (
                                        <ListItem
                                            key={item.id}
                                            button
                                            onClick={() => toggleItem(item.id)}
                                            dense
                                        >
                                            <ListItemIcon sx={{ minWidth: 40 }}>
                                                <Checkbox
                                                    edge="start"
                                                    checked={item.checked}
                                                    tabIndex={-1}
                                                    disableRipple
                                                    color="primary"
                                                />
                                            </ListItemIcon>
                                            <ListItemText
                                                primary={
                                                    <Typography sx={{
                                                        textDecoration: item.checked ? 'line-through' : 'none',
                                                        color: item.checked ? 'text.disabled' : 'text.primary',
                                                        fontWeight: item.checked ? 400 : 500
                                                    }}>
                                                        {item.name}
                                                    </Typography>
                                                }
                                                secondary={`${item.amount} ${item.unit}`}
                                            />
                                            {/* Source tag (optional, maybe too cluttered) */}
                                            {/* <Chip size="small" label={item.sourceRecipes.length} /> */}
                                        </ListItem>
                                    ))}
                                    <Divider component="li" />
                                </ul>
                            </li>
                        ))}
                    </List>
                )}
            </DialogContent>

            <DialogActions sx={{ p: 2, justifyContent: 'space-between' }}>
                <Button
                    startIcon={<DeleteOutlineIcon />}
                    color="error"
                    onClick={clearList}
                    disabled={totalItems === 0}
                >
                    Clear All
                </Button>
                <Button
                    startIcon={<ShareIcon />}
                    variant="contained"
                    onClick={handleShare}
                    disabled={totalItems === 0}
                >
                    Copy List
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ShoppingListPopup;
