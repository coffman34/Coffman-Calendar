/**
 * @fileoverview Recipe API Routes
 * @module server/routes/recipes
 * 
 * JUNIOR DEV NOTE: These routes proxy Spoonacular API requests
 * from the frontend. This hides the API key and normalizes data.
 */

import { Router } from 'express';
import { isConfigured, searchByIngredients, getRecipeDetails } from '../services/spoonacular.js';

const router = Router();

/**
 * GET /api/recipes/status/configured
 * Check if recipe API is configured
 * IMPORTANT: Must be before :id route to avoid matching "status"
 */
router.get('/status/configured', (req, res) => {
    res.json({ configured: isConfigured() });
});

/**
 * GET /api/recipes/search
 * Search recipes by ingredients
 * 
 * Query params:
 * - ingredients: Comma-separated list (required)
 * - limit: Max results (optional, default 10)
 */
router.get('/search', async (req, res, next) => {
    try {
        const { ingredients, limit = 10 } = req.query;

        if (!ingredients) {
            return res.status(400).json({ error: 'ingredients query param required' });
        }

        if (!isConfigured()) {
            return res.status(503).json({
                error: 'Recipe search not configured',
                message: 'Set SPOONACULAR_API_KEY environment variable'
            });
        }

        const results = await searchByIngredients(ingredients, parseInt(limit));
        res.json(results);
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/recipes/:id
 * Get full recipe details by Spoonacular ID
 */
router.get('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!isConfigured()) {
            return res.status(503).json({
                error: 'Recipe API not configured',
                message: 'Set SPOONACULAR_API_KEY environment variable'
            });
        }

        const recipe = await getRecipeDetails(parseInt(id));
        res.json(recipe);
    } catch (error) {
        if (error.response?.status === 404) {
            return res.status(404).json({ error: 'Recipe not found' });
        }
        next(error);
    }
});

export default router;
