import React, { useState } from 'react';
import { Box, Typography, Chip, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import AddIcon from '@mui/icons-material/Add';
import { useMealCategories } from '../meals/useMealCategories';
import { useMeals } from '../meals/useMeals';
import AddMealDialog from '../meals/AddMealDialog';

const MealSection = ({ day }) => {
    const { visibleCategories } = useMealCategories();
    const { getMealsForDate, deleteMeal } = useMeals();
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedCategoryId, setSelectedCategoryId] = useState('dinner');

    const dayMeals = getMealsForDate(day);

    const handleOpenDialog = (categoryId = 'dinner') => {
        setSelectedCategoryId(categoryId);
        setDialogOpen(true);
    };

    // Get all meals across categories for this day
    const allMeals = visibleCategories.flatMap(cat =>
        (dayMeals[cat.id] || []).map(m => ({ ...m, categoryId: cat.id, color: cat.color, catName: cat.name }))
    );

    return (
        <>
            <Box sx={{ p: 1, borderBottom: '1px solid #eee', bgcolor: 'rgba(255,152,0,0.05)' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                    <RestaurantIcon sx={{ fontSize: 14, color: 'warning.main' }} />
                    <Typography variant="caption" fontWeight="bold" color="warning.main">Meals</Typography>
                </Box>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {allMeals.map((meal) => (
                        <Chip key={meal.id} label={meal.name} size="small"
                            onClick={() => deleteMeal(day, meal.categoryId, meal.id)}
                            sx={{ fontSize: '0.7rem', height: 24, bgcolor: meal.color }} />
                    ))}
                    <Chip icon={<AddIcon sx={{ fontSize: 14 }} />} label="+" size="small"
                        onClick={() => handleOpenDialog()} sx={{ fontSize: '0.7rem', height: 24 }} />
                </Box>
            </Box>

            <AddMealDialog
                open={dialogOpen}
                onClose={() => setDialogOpen(false)}
                initialDate={day}
                initialCategory={selectedCategoryId}
            />
        </>
    );
};

export default MealSection;
