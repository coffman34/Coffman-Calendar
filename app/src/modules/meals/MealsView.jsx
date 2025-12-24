/**
 * @fileoverview Meal planning view component
 * @module modules/meals/MealsView
 * 
 * EDUCATIONAL NOTES FOR JUNIOR DEVELOPERS:
 * 
 * WHY THIS FILE EXISTS:
 * Families need to plan meals for the week. This view provides
 * a grid interface for planning breakfast, lunch, dinner, and snacks.
 * 
 * FEATURES:
 * - Weekly meal planning grid
 * - Recipe box for saved recipes
 * - Add/edit/delete meals
 * - Filter by meal category
 * - Meal detail popup
 */

import React, { useState } from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import { useMeals } from './useMeals';
import MealPlanGrid from './MealPlanGrid';
import FilterMenu from './FilterMenu';
import AddMealDialog from './AddMealDialog';
import RecipeDetailPopup from './RecipeDetailPopup';
import RecipeBox from './RecipeBox';

const MealsView = () => {
    const { deleteMeal } = useMeals();
    const [addDialogOpen, setAddDialogOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [detailMeal, setDetailMeal] = useState(null);
    const [detailDate, setDetailDate] = useState('');
    const [detailCategory, setDetailCategory] = useState('');
    const [recipeBoxOpen, setRecipeBoxOpen] = useState(false);

    const handleCellTap = (dateKey, categoryId) => {
        setSelectedDate(dateKey);
        setSelectedCategory(categoryId);
        setAddDialogOpen(true);
    };

    const handleMealTap = (meal, dateKey, categoryId) => {
        setDetailMeal(meal);
        setDetailDate(dateKey);
        setDetailCategory(categoryId);
    };

    const handleDelete = (meal) => {
        deleteMeal(detailDate, detailCategory, meal.id);
        setDetailMeal(null);
    };

    return (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', p: 2 }}>
            {/* Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h4" fontWeight="bold">Meal Planning</Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <FilterMenu />
                    <IconButton onClick={() => setRecipeBoxOpen(!recipeBoxOpen)}><MenuBookIcon /></IconButton>
                </Box>
            </Box>

            {/* Main Content */}
            <Box sx={{ display: 'flex', flex: 1, gap: 2, overflow: 'hidden' }}>
                <MealPlanGrid onCellTap={handleCellTap} onMealTap={handleMealTap} />
                <RecipeBox open={recipeBoxOpen} onClose={() => setRecipeBoxOpen(false)} />
            </Box>

            {/* Dialogs */}
            <AddMealDialog open={addDialogOpen} onClose={() => setAddDialogOpen(false)}
                initialDate={selectedDate} initialCategory={selectedCategory} />
            <RecipeDetailPopup open={!!detailMeal} onClose={() => setDetailMeal(null)}
                meal={detailMeal} dateKey={detailDate} categoryId={detailCategory}
                onEdit={() => { setDetailMeal(null); setAddDialogOpen(true); }} onDelete={handleDelete} />
        </Box>
    );
};

export default MealsView;
