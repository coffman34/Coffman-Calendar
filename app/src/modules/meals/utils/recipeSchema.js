/**
 * @fileoverview Recipe schema utilities and creation helpers
 * @module modules/meals/utils/recipeSchema
 * 
 * JUNIOR DEV NOTE: This defines the EXTENDED recipe structure
 * that supports Cook Mode, Shopping Lists, and Spoonacular integration.
 */

import { getIngredientAisle } from '../constants/ingredients.js';

/**
 * Creates a properly structured recipe object
 * 
 * EXTENDED MODEL:
 * - ingredients: Array of structured ingredient objects for shopping lists
 * - youtubeUrl: Optional video for recipe detail popup
 * - servings: For scaling ingredients
 * - prepTime/cookTime: For display and timer suggestions
 * - steps: Instructions broken into steps for Cook Mode
 * - sourceApi: Track where recipe came from
 * 
 * @param {Object} partialRecipe - Partial recipe data
 * @returns {Object} Complete recipe with defaults
 */
export const createRecipe = (partialRecipe = {}) => ({
    // Required fields
    id: partialRecipe.id || Date.now().toString(),
    name: partialRecipe.name || 'Untitled Recipe',
    categoryId: partialRecipe.categoryId || 'dinner',

    // Extended fields with defaults
    instructions: partialRecipe.instructions || '',
    steps: partialRecipe.steps || parseStepsFromInstructions(partialRecipe.instructions),
    ingredients: partialRecipe.ingredients || [],
    youtubeUrl: partialRecipe.youtubeUrl || null,
    servings: partialRecipe.servings || 4,
    prepTime: partialRecipe.prepTime || 0,
    cookTime: partialRecipe.cookTime || 0,
    sourceApi: partialRecipe.sourceApi || 'manual',
    spoonacularId: partialRecipe.spoonacularId || null,
});

/**
 * Parses a freeform instruction string into numbered steps
 * 
 * JUNIOR DEV NOTE: This enables Cook Mode step-by-step navigation.
 * We now return OBJECTS with IDs to allow ingredient linking.
 * 
 * @param {string} instructions - Freeform instruction text
 * @returns {Array} Array of step objects { id, text, ingredientIds }
 */
export const parseStepsFromInstructions = (instructions) => {
    if (!instructions) return [];

    let steps = [];

    // Try to split on numbered patterns first (1. or 1) or Step 1:)
    const numberedPattern = /(?:\d+[.)]\s*|step\s+\d+[:.]\s*)/gi;
    const parts = instructions.split(numberedPattern).filter(s => s.trim());

    if (parts.length > 1) {
        steps = parts.map(s => s.trim());
    } else {
        // Fall back to splitting on double newlines or sentences
        const paragraphs = instructions.split(/\n\n+/).filter(s => s.trim());
        if (paragraphs.length > 1) {
            steps = paragraphs;
        } else {
            // Last resort: single step
            steps = [instructions.trim()];
        }
    }

    // Convert strings to objects
    return steps.map((text, index) => ({
        id: `step-${Date.now()}-${index}-${Math.random().toString(36).substr(2, 9)}`,
        text,
        ingredientIds: []
    }));
};

/**
 * Creates a structured ingredient object
 * @param {Object} data - Ingredient data
 * @returns {Object} Structured ingredient
 */
export const createIngredient = (data = {}) => ({
    id: data.id || Date.now().toString(),
    name: data.name || '',
    amount: data.amount || 1,
    unit: data.unit || '',
    // Use the lookup if aisle isn't expressly provided
    aisle: data.aisle || getIngredientAisle(data.name) || 'other',
    original: data.original || `${data.amount} ${data.unit} ${data.name}`.trim(),
});
