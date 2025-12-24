import React, { useState } from 'react';
import { Box, Typography, IconButton, List, ListItemButton, ListItemText, Chip, Paper } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useMealCategories } from './useMealCategories';
import { useMeals } from './useMeals';

const RecipeBox = ({ open, onClose, onSelectRecipe }) => {
    const { categories } = useMealCategories();
    const { recipes } = useMeals();
    const [filterCat, setFilterCat] = useState(null);

    if (!open) return null;

    const filtered = filterCat ? recipes.filter(r => r.categoryId === filterCat) : recipes;

    return (
        <Paper sx={{ width: 280, height: '100%', borderRadius: 3, p: 2, display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <IconButton onClick={onClose} size="small"><ArrowBackIcon /></IconButton>
                <Typography variant="h6" fontWeight="bold">Recipe Box</Typography>
            </Box>

            <List sx={{ flex: 1, overflow: 'auto' }}>
                {categories.map(cat => (
                    <ListItemButton key={cat.id} onClick={() => setFilterCat(filterCat === cat.id ? null : cat.id)}
                        selected={filterCat === cat.id} sx={{ borderRadius: 1 }}>
                        <ListItemText primary={cat.name} />
                    </ListItemButton>
                ))}
            </List>

            {filterCat && (
                <Box sx={{ mt: 2, borderTop: '1px solid #eee', pt: 2, maxHeight: 300, overflow: 'auto' }}>
                    {filtered.length === 0 && (
                        <Typography variant="body2" color="text.secondary">No recipes in this category</Typography>
                    )}
                    {filtered.map(r => (
                        <Box key={r.id} onClick={() => onSelectRecipe?.(r)}
                            sx={{ p: 1, mb: 0.5, borderRadius: 1, cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}>
                            <Typography variant="body2">{r.name}</Typography>
                        </Box>
                    ))}
                </Box>
            )}
        </Paper>
    );
};

export default RecipeBox;
