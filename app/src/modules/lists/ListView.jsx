/**
 * @fileoverview Shopping List View
 * @module modules/lists/ListView
 * 
 * JUNIOR DEV NOTE: This view displays the generated shopping list
 * with items grouped by grocery aisle for efficient shopping.
 * 
 * FEATURES:
 * - Items grouped by aisle (Produce, Dairy, Meat, etc.)
 * - Check off items as you shop
 * - Shows which recipes need each ingredient
 * - Persists across sessions
 */

import React, { useState } from 'react';
import {
    Box, Typography, List, ListItem, ListItemButton, ListItemIcon, ListItemText,
    Checkbox, Collapse, IconButton, Chip, Paper, Button
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useShoppingList } from '../meals/contexts/ShoppingListContext';
import { useMeals } from '../meals/useMeals';
import { format } from 'date-fns';

/**
 * Aisle Section Component
 * Collapsible section for each grocery aisle
 */
const AisleSection = ({ aisle, onToggleItem }) => {
    const [expanded, setExpanded] = useState(true);
    const checkedCount = aisle.items.filter(i => i.checked).length;

    return (
        <Paper sx={{ mb: 2, borderRadius: 2, overflow: 'hidden' }}>
            {/* Aisle Header */}
            <ListItemButton onClick={() => setExpanded(!expanded)} sx={{ bgcolor: 'action.hover' }}>
                <ListItemIcon sx={{ minWidth: 40 }}>
                    <Typography variant="h6">{aisle.icon}</Typography>
                </ListItemIcon>
                <ListItemText
                    primary={aisle.name}
                    secondary={`${checkedCount}/${aisle.items.length} items`}
                />
                {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </ListItemButton>

            {/* Items */}
            <Collapse in={expanded}>
                <List dense disablePadding>
                    {aisle.items.map(item => (
                        <ListItem
                            key={item.id}
                            secondaryAction={
                                <Chip
                                    size="small"
                                    label={item.sourceRecipes.length > 1
                                        ? `${item.sourceRecipes.length} recipes`
                                        : item.sourceRecipes[0]}
                                    variant="outlined"
                                />
                            }
                            disablePadding
                        >
                            <ListItemButton onClick={() => onToggleItem(item.id)} dense>
                                <ListItemIcon sx={{ minWidth: 40 }}>
                                    <Checkbox
                                        edge="start"
                                        checked={item.checked}
                                        tabIndex={-1}
                                        disableRipple
                                    />
                                </ListItemIcon>
                                <ListItemText
                                    primary={item.name}
                                    secondary={`${item.amount} ${item.unit}`}
                                    sx={{
                                        textDecoration: item.checked ? 'line-through' : 'none',
                                        opacity: item.checked ? 0.5 : 1
                                    }}
                                />
                            </ListItemButton>
                        </ListItem>
                    ))}
                </List>
            </Collapse>
        </Paper>
    );
};

/**
 * ListView Component (Shopping List)
 */
const ListView = () => {
    const { shoppingList, generateFromMeals, toggleItem, clearList, getGroupedItems } = useShoppingList();
    const { meals } = useMeals();

    const groupedItems = getGroupedItems();
    const totalItems = shoppingList.items.length;
    const checkedItems = shoppingList.items.filter(i => i.checked).length;

    const handleGenerate = () => {
        generateFromMeals(meals);
    };

    return (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', p: 2 }}>
            {/* Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Box>
                    <Typography variant="h4" fontWeight="bold">Shopping List</Typography>
                    {shoppingList.lastGenerated && (
                        <Typography variant="caption" color="text.secondary">
                            Generated {format(new Date(shoppingList.lastGenerated), 'MMM d, h:mm a')}
                        </Typography>
                    )}
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                        variant="outlined"
                        startIcon={<RefreshIcon />}
                        onClick={handleGenerate}
                    >
                        Refresh from Meals
                    </Button>
                    {totalItems > 0 && (
                        <IconButton onClick={clearList} color="error" title="Clear list">
                            <DeleteSweepIcon />
                        </IconButton>
                    )}
                </Box>
            </Box>

            {/* Progress */}
            {totalItems > 0 && (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {checkedItems} of {totalItems} items checked
                </Typography>
            )}

            {/* List Content */}
            <Box sx={{ flex: 1, overflow: 'auto' }}>
                {totalItems === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 8 }}>
                        <Typography variant="h6" color="text.secondary" gutterBottom>
                            No items yet
                        </Typography>
                        <Typography variant="body2" color="text.disabled" sx={{ mb: 3 }}>
                            Add meals with ingredients to your meal plan, then generate your shopping list.
                        </Typography>
                        <Button variant="contained" onClick={handleGenerate}>
                            Generate from This Week's Meals
                        </Button>
                    </Box>
                ) : (
                    groupedItems.map(aisle => (
                        <AisleSection
                            key={aisle.id}
                            aisle={aisle}
                            onToggleItem={toggleItem}
                        />
                    ))
                )}
            </Box>
        </Box>
    );
};

export default ListView;
