/**
 * @fileoverview Recipe API Service (Frontend)
 * @module services/recipeApi
 * 
 * JUNIOR DEV NOTE: This service communicates with our backend proxy
 * for Spoonacular recipe searches. It also handles local recipe storage.
 * 
 * WHY GO THROUGH BACKEND?
 * 1. API key stays on server (security)
 * 2. No CORS issues
 * 3. Data normalized before reaching frontend
 */

const API_BASE = '/api/recipes';

/**
 * Check if recipe API is configured
 * @returns {Promise<boolean>}
 */
export const isApiConfigured = async () => {
    try {
        const response = await fetch(`${API_BASE}/status/configured`);
        const data = await response.json();
        return data.configured;
    } catch {
        return false;
    }
};

/**
 * Search recipes by ingredients
 * 
 * @param {string} ingredients - Comma-separated ingredient list
 * @param {number} limit - Max results (default 10)
 * @returns {Promise<Array>} Array of recipe summaries
 * 
 * @example
 * const results = await searchRecipes('chicken, spinach, cream');
 */
export const searchRecipes = async (ingredients, limit = 10) => {
    const params = new URLSearchParams({ ingredients, limit: limit.toString() });
    const response = await fetch(`${API_BASE}/search?${params}`);

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Search failed');
    }

    return response.json();
};

/**
 * Get full recipe details by Spoonacular ID
 * 
 * @param {number} spoonacularId - Recipe ID from search results
 * @returns {Promise<Object>} Full recipe with ingredients and steps
 */
export const getRecipeDetails = async (spoonacularId) => {
    const response = await fetch(`${API_BASE}/${spoonacularId}`);

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to get recipe');
    }

    return response.json();
};

/**
 * Offline cache for active recipe (Cook Mode resilience)
 * 
 * JUNIOR DEV NOTE: Per user recommendation, we cache the active recipe
 * locally so Cook Mode works even if internet drops momentarily.
 */
const CACHE_KEY = 'active_recipe_cache';

export const cacheActiveRecipe = (recipe) => {
    localStorage.setItem(CACHE_KEY, JSON.stringify(recipe));
};

export const getCachedRecipe = () => {
    const cached = localStorage.getItem(CACHE_KEY);
    return cached ? JSON.parse(cached) : null;
};

export const clearCachedRecipe = () => {
    localStorage.removeItem(CACHE_KEY);
};
