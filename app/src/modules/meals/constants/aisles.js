/**
 * @fileoverview Aisle categories for shopping list grouping
 * @module modules/meals/constants/aisles
 * 
 * JUNIOR DEV NOTE: Items from Spoonacular come with `aisle` metadata.
 * This mapping normalizes various aisle names to our standard categories.
 */

/**
 * Standard aisle categories for shopping list organization
 * Order reflects typical grocery store layout
 */
export const AISLE_CATEGORIES = [
    { id: 'produce', name: 'Produce', icon: '🥬', order: 1 },
    { id: 'dairy', name: 'Dairy & Eggs', icon: '🥛', order: 2 },
    { id: 'meat', name: 'Meat & Seafood', icon: '🥩', order: 3 },
    { id: 'bakery', name: 'Bakery', icon: '🍞', order: 4 },
    { id: 'frozen', name: 'Frozen', icon: '🧊', order: 5 },
    { id: 'pantry', name: 'Pantry & Dry Goods', icon: '🥫', order: 6 },
    { id: 'spices', name: 'Spices & Seasonings', icon: '🧂', order: 7 },
    { id: 'beverages', name: 'Beverages', icon: '🥤', order: 8 },
    { id: 'other', name: 'Other', icon: '📦', order: 99 },
];

/**
 * Maps Spoonacular aisle names to our standard categories
 * JUNIOR DEV NOTE: Spoonacular uses detailed names like "Produce;Vegetables"
 */
export const AISLE_MAPPING = {
    // Produce
    'produce': 'produce', 'vegetables': 'produce', 'fruits': 'produce',
    'fresh vegetables': 'produce', 'fresh fruits': 'produce',
    // Dairy
    'dairy': 'dairy', 'milk, eggs, other dairy': 'dairy', 'cheese': 'dairy',
    'refrigerated': 'dairy', 'eggs': 'dairy',
    // Meat
    'meat': 'meat', 'seafood': 'meat', 'poultry': 'meat',
    // Bakery
    'bakery/bread': 'bakery', 'bread': 'bakery', 'baking': 'bakery',
    // Frozen
    'frozen': 'frozen',
    // Pantry
    'pasta and rice': 'pantry', 'canned and jarred': 'pantry',
    'condiments': 'pantry', 'oil, vinegar, salad dressing': 'pantry',
    // Spices
    'spices and seasonings': 'spices', 'ethnic foods': 'spices',
    // Beverages
    'beverages': 'beverages', 'alcoholic beverages': 'beverages',
};

/**
 * Maps a Spoonacular aisle string to our standard category
 * @param {string} aisleString - Raw aisle from API (may be semicolon-separated)
 * @returns {string} Our normalized aisle ID
 */
export const normalizeAisle = (aisleString) => {
    if (!aisleString) return 'other';
    const lower = aisleString.toLowerCase().split(';')[0].trim();
    return AISLE_MAPPING[lower] || 'other';
};
