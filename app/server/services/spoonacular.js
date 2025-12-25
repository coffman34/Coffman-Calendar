/**
 * @fileoverview Spoonacular API Service
 * @module server/services/spoonacular
 * 
 * JUNIOR DEV NOTE: This service acts as a proxy to the Spoonacular API.
 * WHY PROXY? 
 * 1. Hide API key from frontend (security)
 * 2. Avoid CORS issues (browser blocks direct API calls)
 * 3. Normalize response data to our schema
 */

import axios from 'axios';

// API configuration from environment
const API_KEY = process.env.SPOONACULAR_API_KEY || '';
const BASE_URL = 'https://api.spoonacular.com';

/**
 * Checks if API key is configured
 */
export const isConfigured = () => !!API_KEY;

/**
 * Search recipes by ingredients
 * 
 * @param {string} ingredients - Comma-separated ingredient list
 * @param {number} number - Max results (default 10)
 * @returns {Array} Simplified recipe list
 */
export const searchByIngredients = async (ingredients, number = 10) => {
    if (!isConfigured()) {
        throw new Error('Spoonacular API key not configured');
    }

    const response = await axios.get(`${BASE_URL}/recipes/findByIngredients`, {
        params: {
            apiKey: API_KEY,
            ingredients,
            number,
            ranking: 2, // Maximize used ingredients
            ignorePantry: true,
        }
    });

    // Normalize to our format
    return response.data.map(recipe => ({
        spoonacularId: recipe.id,
        name: recipe.title,
        image: recipe.image,
        usedIngredientCount: recipe.usedIngredientCount,
        missedIngredientCount: recipe.missedIngredientCount,
    }));
};

/**
 * Get full recipe details including instructions and ingredients
 * 
 * @param {number} id - Spoonacular recipe ID
 * @returns {Object} Full recipe in our schema format
 */
export const getRecipeDetails = async (id) => {
    if (!isConfigured()) {
        throw new Error('Spoonacular API key not configured');
    }

    const response = await axios.get(`${BASE_URL}/recipes/${id}/information`, {
        params: {
            apiKey: API_KEY,
            includeNutrition: false,
        }
    });

    const data = response.data;

    // Transform to our extended recipe schema
    return {
        spoonacularId: data.id,
        name: data.title,
        image: data.image,
        servings: data.servings,
        prepTime: data.preparationMinutes || 0,
        cookTime: data.cookingMinutes || data.readyInMinutes || 0,
        sourceApi: 'spoonacular',
        // Parse structured ingredients for shopping list
        ingredients: (data.extendedIngredients || []).map(ing => ({
            id: ing.id?.toString() || Date.now().toString(),
            name: ing.name,
            amount: ing.amount,
            unit: ing.unit,
            aisle: ing.aisle || 'other',
            original: ing.original,
        })),
        // Parse instructions into steps for Cook Mode
        steps: parseAnalyzedInstructions(data.analyzedInstructions),
        instructions: data.instructions || '',
        youtubeUrl: null, // Spoonacular doesn't provide videos
    };
};

/**
 * Parse Spoonacular's analyzedInstructions into simple step strings
 */
const parseAnalyzedInstructions = (analyzedInstructions) => {
    if (!analyzedInstructions || !analyzedInstructions.length) return [];

    return analyzedInstructions
        .flatMap(section => section.steps || [])
        .map(step => step.step);
};
