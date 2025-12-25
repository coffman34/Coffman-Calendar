/**
 * @fileoverview Recipe Preferences Context
 * @module modules/meals/contexts/RecipePreferencesContext
 * 
 * JUNIOR DEV NOTE: This context manages per-user recipe preferences:
 * - Favorites: Quick access to loved recipes
 * - Likes/Dislikes: Meal planning insights, "Veto" warnings
 * 
 * WHY SEPARATE FROM MealContext?
 * Recipe preferences are user-specific, while meals/recipes themselves
 * are shared across the family. This separation follows Single Responsibility.
 */

import React, { useState, useEffect, useCallback, createContext, useContext } from 'react';

const STORAGE_KEY = 'family_recipe_preferences';

// Context creation
const RecipePreferencesContext = createContext(null);

/**
 * Recipe Preferences Provider
 * 
 * DATA MODEL:
 * {
 *   [userId]: {
 *     [recipeId]: 'favorite' | 'like' | 'dislike' | null
 *   }
 * }
 */
export function RecipePreferencesProvider({ children }) {
    // Initialize from localStorage
    const [preferences, setPreferences] = useState(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : {};
    });

    // Persist to localStorage on change
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
    }, [preferences]);

    /**
     * Set a user's preference for a recipe
     * @param {string} userId - User ID
     * @param {string} recipeId - Recipe ID
     * @param {'favorite'|'like'|'dislike'|null} preference - The preference
     */
    const setPreference = useCallback((userId, recipeId, preference) => {
        setPreferences(prev => ({
            ...prev,
            [userId]: {
                ...(prev[userId] || {}),
                [recipeId]: preference,
            }
        }));
    }, []);

    /**
     * Get a user's preference for a recipe
     */
    const getPreference = useCallback((userId, recipeId) => {
        return preferences[userId]?.[recipeId] || null;
    }, [preferences]);

    /**
     * Get all favorites for a user
     */
    const getUserFavorites = useCallback((userId) => {
        const userPrefs = preferences[userId] || {};
        return Object.entries(userPrefs)
            .filter(([, pref]) => pref === 'favorite')
            .map(([recipeId]) => recipeId);
    }, [preferences]);

    /**
     * Check if ANY user dislikes a recipe (for "Veto" warning)
     * @param {string} recipeId - Recipe ID
     * @returns {Array} Array of user IDs who dislike it
     */
    const getDislikers = useCallback((recipeId) => {
        return Object.entries(preferences)
            .filter(([, userPrefs]) => userPrefs[recipeId] === 'dislike')
            .map(([userId]) => userId);
    }, [preferences]);

    /**
     * Toggle favorite status
     */
    const toggleFavorite = useCallback((userId, recipeId) => {
        const current = preferences[userId]?.[recipeId];
        setPreference(userId, recipeId, current === 'favorite' ? null : 'favorite');
    }, [preferences, setPreference]);

    const value = {
        preferences,
        setPreference,
        getPreference,
        getUserFavorites,
        getDislikers,
        toggleFavorite,
    };

    return (
        <RecipePreferencesContext.Provider value={value}>
            {children}
        </RecipePreferencesContext.Provider>
    );
}

/**
 * Hook to access recipe preferences
 */
export function useRecipePreferences() {
    const context = useContext(RecipePreferencesContext);
    if (!context) {
        throw new Error('useRecipePreferences must be used within RecipePreferencesProvider');
    }
    return context;
}

export default RecipePreferencesContext;
