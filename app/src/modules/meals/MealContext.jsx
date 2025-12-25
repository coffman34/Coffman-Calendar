/**
 * @fileoverview Meal planning context
 * @module modules/meals/MealContext
 * 
 * EDUCATIONAL NOTES FOR JUNIOR DEVELOPERS:
 * 
 * WHY THIS FILE EXISTS:
 * Families need to plan meals for the week. This context manages:
 * - Meals scheduled for specific dates and meal times (breakfast, lunch, dinner, snack)
 * - Saved recipes for quick meal planning
 * - Persistence to localStorage
 * 
 * DESIGN PATTERN: Context API + CRUD Pattern
 * Provides Create, Read, Update, Delete operations for meals and recipes.
 * 
 * DATA STRUCTURE:
 * meals: {
 *   "2024-01-15": {
 *     "breakfast": [{ id, name, instructions, repeat }],
 *     "lunch": [{ id, name, instructions }],
 *     ...
 *   }
 * }
 */

import React, { useState, useEffect } from 'react';
import { STORAGE_KEYS } from '../../utils/constants';
import { MealContext } from './MealContextCore';

/**
 * Meal Provider Component
 * 
 * WHAT IT DOES:
 * Manages meal planning data and operations.
 * 
 * HOW IT WORKS:
 * 1. Load meals and recipes from localStorage
 * 2. Provide CRUD operations for meals
 * 3. Provide CRUD operations for recipes
 * 4. Auto-save changes to localStorage
 * 
 * DATA MODEL:
 * - Meals: Organized by date and category (breakfast, lunch, etc.)
 * - Recipes: Saved meal templates for quick planning
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children
 */
export default function MealProvider({ children }) {
    // ========================================================================
    // STATE
    // ========================================================================

    /**
     * Meals organized by date and category
     * 
     * STRUCTURE:
     * {
     *   "2024-01-15": {
     *     "breakfast": [{ id: "1", name: "Pancakes", instructions: "..." }],
     *     "lunch": [{ id: "2", name: "Sandwich" }]
     *   }
     * }
     * 
     * JUNIOR DEV NOTE: Why this structure?
     * - Date as key: Fast lookup for a specific day
     * - Category as nested key: Fast lookup for meal time
     * - Array of meals: Supports multiple items per meal (e.g., "Eggs and Toast")
     */
    const [meals, setMeals] = useState(() => {
        const stored = localStorage.getItem(STORAGE_KEYS.MEALS);
        return stored ? JSON.parse(stored) : {};
    });

    /**
     * Saved recipes for the recipe box
     * 
     * STRUCTURE:
     * [
     *   { id: "1", name: "Mom's Spaghetti", instructions: "...", category: "dinner" },
     *   { id: "2", name: "Breakfast Burrito", instructions: "...", category: "breakfast" }
     * ]
     * 
     * JUNIOR DEV NOTE: Why separate from meals?
     * Recipes are templates that can be reused. Meals are specific instances
     * scheduled for specific dates. Think of recipes as the "master copy".
     */
    const [recipes, setRecipes] = useState(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEYS.RECIPES);
            const parsed = stored ? JSON.parse(stored) : [];
            return Array.isArray(parsed) ? parsed : [];
        } catch (e) {
            console.error("Failed to parse recipes:", e);
            return [];
        }
    });

    // ========================================================================
    // EFFECTS
    // ========================================================================

    /**
     * Persist meals to localStorage
     */
    useEffect(() => {
        localStorage.setItem(STORAGE_KEYS.MEALS, JSON.stringify(meals));
    }, [meals]);

    /**
     * Persist recipes to localStorage
     */
    useEffect(() => {
        localStorage.setItem(STORAGE_KEYS.RECIPES, JSON.stringify(recipes));
    }, [recipes]);

    // ========================================================================
    // MEAL OPERATIONS
    // ========================================================================

    /**
     * Adds a meal to a specific date and category
     * 
     * WHAT IT DOES:
     * Schedules a meal for a specific day and meal time.
     * 
     * HOW IT WORKS:
     * 1. Generate ID if not provided
     * 2. Get existing meals for that date/category
     * 3. Add new meal to the array
     * 4. Update state
     * 
     * JUNIOR DEV NOTE: Why spread operators?
     * We're creating new objects instead of mutating existing ones.
     * This is important for React to detect changes and re-render.
     * 
     * @param {string} dateKey - Date in YYYY-MM-DD format
     * @param {string} categoryId - Meal category (breakfast, lunch, dinner, snack)
     * @param {Object} meal - Meal data { name, instructions, repeat? }
     * @returns {Object} The created meal with ID
     * 
     * @example
     * addMeal("2024-01-15", "breakfast", {
     *   name: "Pancakes",
     *   instructions: "Mix and cook"
     * });
     */
    const addMeal = (dateKey, categoryId, meal) => {
        const newMeal = {
            ...meal,
            id: meal.id || Date.now().toString(), // Generate ID if not provided
        };

        setMeals(prev => ({
            ...prev,
            [dateKey]: {
                ...(prev[dateKey] || {}), // Preserve other categories for this date
                [categoryId]: [
                    ...(prev[dateKey]?.[categoryId] || []), // Preserve existing meals
                    newMeal, // Add new meal
                ],
            },
        }));

        return newMeal;
    };

    /**
     * Updates an existing meal
     * 
     * @param {string} dateKey - Date key
     * @param {string} categoryId - Meal category
     * @param {string} mealId - Meal ID to update
     * @param {Object} updates - Fields to update
     * 
     * @example
     * updateMeal("2024-01-15", "breakfast", "123", {
     *   name: "Blueberry Pancakes" // Changed from "Pancakes"
     * });
     */
    const updateMeal = (dateKey, categoryId, mealId, updates) => {
        setMeals(prev => ({
            ...prev,
            [dateKey]: {
                ...(prev[dateKey] || {}),
                [categoryId]: (prev[dateKey]?.[categoryId] || []).map(meal =>
                    meal.id === mealId ? { ...meal, ...updates } : meal
                ),
            },
        }));
    };

    /**
     * Deletes a meal
     * 
     * @param {string} dateKey - Date key
     * @param {string} categoryId - Meal category
     * @param {string} mealId - Meal ID to delete
     */
    const deleteMeal = (dateKey, categoryId, mealId) => {
        setMeals(prev => ({
            ...prev,
            [dateKey]: {
                ...(prev[dateKey] || {}),
                [categoryId]: (prev[dateKey]?.[categoryId] || []).filter(
                    meal => meal.id !== mealId
                ),
            },
        }));
    };

    /**
     * Moves a meal from one location to another (ATOMIC operation)
     * 
     * JUNIOR DEV NOTE: This is an ATOMIC operation - it handles both
     * the delete and add in a SINGLE STATE UPDATE. This prevents race
     * conditions that can occur when calling deleteMeal + addMeal separately.
     * 
     * WHY ATOMIC?
     * When you call setMeals twice quickly, React might batch the updates
     * but each callback only sees the state as it was when queued.
     * By doing both operations in one callback, we guarantee consistency.
     * 
     * @param {string} sourceDateKey - Original date
     * @param {string} sourceCategoryId - Original category
     * @param {string} targetDateKey - New date
     * @param {string} targetCategoryId - New category
     * @param {Object} meal - The meal to move
     */
    const moveMeal = (sourceDateKey, sourceCategoryId, targetDateKey, targetCategoryId, meal) => {
        console.log('moveMeal called:', { sourceDateKey, sourceCategoryId, targetDateKey, targetCategoryId, mealId: meal.id });
        setMeals(prev => {
            // 1. Create a copy of the state
            const newState = { ...prev };

            // 2. Ensure source date exists
            if (!newState[sourceDateKey]) {
                console.warn('Move failed: source date not found');
                return prev;
            }

            // 3. Remove meal from source
            newState[sourceDateKey] = {
                ...newState[sourceDateKey],
                [sourceCategoryId]: (newState[sourceDateKey][sourceCategoryId] || []).filter(
                    m => m.id !== meal.id
                ),
            };

            // 4. Ensure target date exists
            if (!newState[targetDateKey]) {
                newState[targetDateKey] = {};
            }

            // 5. Add meal to target
            newState[targetDateKey] = {
                ...newState[targetDateKey],
                [targetCategoryId]: [
                    ...(newState[targetDateKey][targetCategoryId] || []),
                    meal,
                ],
            };

            console.log('moveMeal state updated');
            return newState;
        });
    };

    /**
     * Gets all meals for a specific date
     * 
     * WHAT IT DOES:
     * Returns all meals (breakfast, lunch, dinner, snack) for a date.
     * 
     * @param {string} dateKey - Date in YYYY-MM-DD format
     * @returns {Object} Meals by category { breakfast: [...], lunch: [...], ... }
     * 
     * @example
     * const mealsForToday = getMealsForDate("2024-01-15");
     * // Returns: { breakfast: [...], lunch: [...], dinner: [...], snack: [...] }
     */
    const getMealsForDate = (dateKey) => {
        return meals[dateKey] || {};
    };

    // ========================================================================
    // RECIPE OPERATIONS
    // ========================================================================

    /**
     * Saves a recipe to the recipe box
     * 
     * WHAT IT DOES:
     * Adds or updates a recipe in the saved recipes list.
     * 
     * HOW IT WORKS:
     * 1. Generate ID if not provided
     * 2. Remove existing recipe with same ID (if updating)
     * 3. Add new/updated recipe
     * 
     * JUNIOR DEV NOTE: Why filter then add?
     * This handles both create and update in one function.
     * If the ID exists, we remove the old version and add the new one.
     * If the ID doesn't exist, filter does nothing and we just add.
     * 
     * @param {Object} recipe - Recipe data { name, instructions, category }
     * 
     * @example
     * saveRecipe({
     *   name: "Mom's Spaghetti",
     *   instructions: "Boil pasta, add sauce",
     *   category: "dinner"
     * });
     */
    const saveRecipe = (recipe) => {
        const newRecipe = {
            ...recipe,
            id: recipe.id || Date.now().toString(),
        };

        setRecipes(prev => {
            // Defensive: ensure prev is an array
            const safePrev = Array.isArray(prev) ? prev : [];

            // Version Control: Create snapshot if updating existing recipe
            const existing = safePrev.find(r => r.id === newRecipe.id);
            if (existing) {
                const snapshot = {
                    versionTimestamp: Date.now(),
                    updatedAt: new Date().toISOString(),
                    name: existing.name,
                    ingredients: existing.ingredients,
                    instructions: existing.instructions,
                    steps: existing.steps,
                    youtubeUrl: existing.youtubeUrl,
                    categoryId: existing.categoryId
                };
                // Keep last 10 versions
                newRecipe.history = [snapshot, ...(existing.history || [])].slice(0, 10);
            }

            return [
                ...safePrev.filter(r => r.id !== newRecipe.id), // Remove old version if exists
                newRecipe, // Add new version
            ];
        });
    };

    /**
     * Deletes a recipe from the recipe box
     * 
     * @param {string} recipeId - Recipe ID to delete
     */
    const deleteRecipe = (recipeId) => {
        setRecipes(prev => prev.filter(r => r.id !== recipeId));
    };

    // ========================================================================
    // CONTEXT VALUE
    // ========================================================================

    const value = {
        // State
        meals,
        recipes,

        // Meal operations
        addMeal,
        updateMeal,
        deleteMeal,
        moveMeal,
        getMealsForDate,

        // Recipe operations
        saveRecipe,
        deleteRecipe,
    };

    return (
        <MealContext.Provider value={value}>
            {children}
        </MealContext.Provider>
    );
}

