/**
 * @fileoverview Meal Planning View with Drag-and-Drop Support
 * @module modules/meals/MealsView
 * 
 * JUNIOR DEV NOTE: This view now includes:
 * - ALWAYS-VISIBLE Recipe Box for drag-and-drop meal assignment
 * - "Generate Shopping List" button in header
 * - Preference handling wired to RecipeDetailPopup
 * - Integration with all new meal features
 * 
 * DRAG-AND-DROP FLOW:
 * 1. User drags a recipe from RecipeBox
 * 2. MealPlanGrid shows visual feedback on drop targets
 * 3. On drop, handleRecipeDrop is called with dateKey, categoryId, recipe
 * 4. We call addMeal to schedule the recipe as a meal
 */

import React, { useState } from 'react';
import { Box, Typography, Button, Snackbar, Alert } from '@mui/material';
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
    const { meals, addMeal, deleteMeal, moveMeal } = useMeals();
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
    const [shoppingListOpen, setShoppingListOpen] = useState(false);
    const [mealToEdit, setMealToEdit] = useState(null);

    // Feedback
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

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
     * Handle recipe dropped onto the meal grid
     * 
     * JUNIOR DEV NOTE: This is the key handler that bridges drag-and-drop
     * to the meal planning system. When a recipe is dropped:
     * 1. We create a new meal from the recipe data
     * 2. We add it to the specified date and category
     * 3. We show feedback to the user
     * 
     * @param {string} dateKey - Date in YYYY-MM-DD format
     * @param {string} categoryId - Meal category (breakfast, lunch, dinner, snack)
     * @param {Object} recipe - The dropped recipe object
     */
    const handleRecipeDrop = (dateKey, categoryId, recipe) => {
        // 1. Create meal from recipe with a new unique ID
        const meal = {
            ...recipe,
            id: Date.now().toString(), // New ID since this is a new meal instance
        };

        // 2. Add to the meal plan
        addMeal(dateKey, categoryId, meal);

        // 3. Show success feedback
        setSnackbar({
            open: true,
            message: `Added "${recipe.name}" to meal plan!`,
            severity: 'success',
        });
    };

    /**
     * Handle meal moved within the grid (rearrangement)
     * 
     * JUNIOR DEV NOTE: We use the ATOMIC moveMeal function from context.
     * This ensures both the delete and add happen in a single state update,
     * preventing any race conditions or visual glitches.
     * 
     * @param {string} sourceDateKey - Original date
     * @param {string} sourceCategoryId - Original category
     * @param {string} targetDateKey - New date
     * @param {string} targetCategoryId - New category
     * @param {Object} meal - The meal being moved
     */
    const handleMealMove = (sourceDateKey, sourceCategoryId, targetDateKey, targetCategoryId, meal) => {
        // Use atomic moveMeal to prevent race conditions
        moveMeal(sourceDateKey, sourceCategoryId, targetDateKey, targetCategoryId, meal);

        // Show feedback
        setSnackbar({
            open: true,
            message: `Moved "${meal.name}" successfully!`,
            severity: 'success',
        });
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
            message: `Shopping list generated! ${count} items.`,
            severity: 'success',
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
                </Box>
            </Box>

            {/* Main Content - Grid + Always-Visible Recipe Box */}
            <Box sx={{ display: 'flex', flex: 1, gap: 2, overflow: 'hidden' }}>
                <MealPlanGrid
                    onCellTap={handleCellTap}
                    onMealTap={handleMealTap}
                    onRecipeDrop={handleRecipeDrop}
                    onMealMove={handleMealMove}
                />
                <RecipeBox />
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
                <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default MealsView;
