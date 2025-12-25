/**
 * @fileoverview Meal Planning View with Full Feature Integration
 * @module modules/meals/MealsView
 * 
 * JUNIOR DEV NOTE: This view now includes:
 * - "Generate Shopping List" button in header
 * - Preference handling wired to RecipeDetailPopup
 * - Integration with all new meal features
 */

import React, { useState } from 'react';
import { Box, Typography, IconButton, Button, Snackbar, Alert } from '@mui/material';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { useMeals } from './useMeals';
import { useShoppingList } from './contexts/ShoppingListContext';
import { useRecipePreferences } from './contexts/RecipePreferencesContext';
import { useUser } from '../users/useUser';
import MealPlanGrid from './MealPlanGrid';
import FilterMenu from './FilterMenu';
import AddMealDialog from './AddMealDialog';
import RecipeDetailPopup from './RecipeDetailPopup';
import RecipeBox from './RecipeBox';
import ShoppingListPopup from './ShoppingListPopup';

const MealsView = () => {
    const { meals, deleteMeal } = useMeals();
    const { generateFromMeals, shoppingList } = useShoppingList();
    const { getPreference, setPreference } = useRecipePreferences();
    const { currentUser } = useUser();

    // Dialog states
    const [addDialogOpen, setAddDialogOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [detailMeal, setDetailMeal] = useState(null);
    const [detailDate, setDetailDate] = useState('');
    const [detailCategory, setDetailCategory] = useState('');
    const [recipeBoxOpen, setRecipeBoxOpen] = useState(false);
    const [shoppingListOpen, setShoppingListOpen] = useState(false);
    const [mealToEdit, setMealToEdit] = useState(null);

    // Feedback
    const [snackbar, setSnackbar] = useState({ open: false, message: '' });

    const handleCellTap = (dateKey, categoryId) => {
        setSelectedDate(dateKey);
        setSelectedCategory(categoryId);
        setMealToEdit(null); // Clear edit state for new entry
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

    /**
     * Handle edit request from detail popup
     */
    const handleEdit = (meal) => {
        setMealToEdit(meal);
        setSelectedDate(detailDate); // Pre-fill date
        setSelectedCategory(detailCategory); // Pre-fill category
        setDetailMeal(null);
        setAddDialogOpen(true);
    };

    /**
     * Generate shopping list from current week's meals
     */
    const handleGenerateShoppingList = () => {
        generateFromMeals(meals);
        setShoppingListOpen(true);
        const count = shoppingList.items.length;
        setSnackbar({
            open: true,
            message: `Shopping list generated! ${count} items.`
        });
    };

    /**
     * Handle preference change for current user
     */
    const handlePreferenceChange = (userId, recipeId, preference) => {
        setPreference(userId, recipeId, preference);
    };

    // Get current user's preference for the detail meal
    const currentPreference = detailMeal && currentUser
        ? getPreference(currentUser.id, detailMeal.id)
        : null;

    return (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', p: 2 }}>
            {/* Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h4" fontWeight="bold">Meal Planning</Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    {/* Generate Shopping List Button */}
                    <Button
                        variant="outlined"
                        startIcon={<ShoppingCartIcon />}
                        onClick={handleGenerateShoppingList}
                        size="small"
                    >
                        Generate List
                    </Button>
                    <FilterMenu />
                    <IconButton onClick={() => setRecipeBoxOpen(!recipeBoxOpen)} title="Recipe Box">
                        <MenuBookIcon />
                    </IconButton>
                </Box>
            </Box>

            {/* Main Content */}
            <Box sx={{ display: 'flex', flex: 1, gap: 2, overflow: 'hidden' }}>
                <MealPlanGrid onCellTap={handleCellTap} onMealTap={handleMealTap} />
                <RecipeBox open={recipeBoxOpen} onClose={() => setRecipeBoxOpen(false)} />
                <ShoppingListPopup open={shoppingListOpen} onClose={() => setShoppingListOpen(false)} />
            </Box>

            {/* Dialogs */}
            <AddMealDialog
                open={addDialogOpen}
                onClose={() => setAddDialogOpen(false)}
                initialDate={selectedDate}
                initialCategory={selectedCategory}
                initialMeal={mealToEdit}
            />
            <RecipeDetailPopup
                open={!!detailMeal}
                onClose={() => setDetailMeal(null)}
                meal={detailMeal}
                dateKey={detailDate}
                categoryId={detailCategory}
                onEdit={handleEdit}
                onDelete={handleDelete}
                preference={currentPreference}
                onPreferenceChange={handlePreferenceChange}
            />

            {/* Feedback Snackbar */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert severity="success" onClose={() => setSnackbar({ ...snackbar, open: false })}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default MealsView;
