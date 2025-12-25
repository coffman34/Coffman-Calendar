import React, { useState } from 'react';
import { Box, Typography, Chip, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import AddIcon from '@mui/icons-material/Add';
import { useMealCategories } from '../meals/useMealCategories';
import { useMeals } from '../meals/useMeals';
import { useUser } from '../users/useUser';
import AddMealDialog from '../meals/AddMealDialog';
import RecipeDetailPopup from '../meals/RecipeDetailPopup';

const MealSection = ({ day }) => {
    const { visibleCategories } = useMealCategories();
    const { getMealsForDate, deleteMeal } = useMeals();
    const { currentUser, updateUserPreference } = useUser();

    // State
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedCategoryId, setSelectedCategoryId] = useState('dinner');
    const [selectedMeal, setSelectedMeal] = useState(null); // For detail popup
    const [editingMeal, setEditingMeal] = useState(null);   // For edit dialog

    const dayMeals = getMealsForDate(day);

    const handleOpenDialog = (categoryId = 'dinner') => {
        setEditingMeal(null);
        setSelectedCategoryId(categoryId);
        setDialogOpen(true);
    };

    const handleMealClick = (meal) => {
        setSelectedMeal(meal);
    };

    const handleEditFromPopup = (meal) => {
        setEditingMeal(meal);
        setSelectedCategoryId(meal.categoryId);
        setSelectedMeal(null);
        setDialogOpen(true);
    };

    const handleDeleteFromPopup = (meal) => {
        deleteMeal(day, meal.categoryId, meal.id);
        setSelectedMeal(null);
    };

    const handlePreferenceChange = async (userId, recipeId, type) => {
        if (updateUserPreference) {
            await updateUserPreference(userId, recipeId, type);
        }
    };

    // Get all meals across categories for this day
    const allMeals = visibleCategories.flatMap(cat =>
        (dayMeals[cat.id] || []).map(m => ({ ...m, categoryId: cat.id, color: cat.color, catName: cat.name }))
    );

    return (
        <>
            <Box sx={{ p: 1, borderBottom: '1px solid #eee', bgcolor: 'rgba(255,152,0,0.05)' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                    <RestaurantIcon sx={{ fontSize: 14, color: 'primary.main' }} />
                    <Typography variant="caption" fontWeight="bold" color="primary.main">Meals</Typography>
                </Box>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {allMeals.map((meal) => (
                        <Chip key={meal.id} label={meal.name} size="small"
                            onClick={() => handleMealClick(meal)}
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
                initialMeal={editingMeal}
            />

            <RecipeDetailPopup
                open={!!selectedMeal}
                onClose={() => setSelectedMeal(null)}
                meal={selectedMeal}
                dateKey={day}
                categoryId={selectedMeal?.categoryId}
                onEdit={handleEditFromPopup}
                onDelete={handleDeleteFromPopup}
                preference={selectedMeal && currentUser?.preferences?.[selectedMeal.id]?.type}
                onPreferenceChange={handlePreferenceChange}
            />
        </>
    );
};

export default MealSection;
