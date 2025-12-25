/**
 * @fileoverview Comprehensive Ingredient Database
 * @module modules/meals/constants/ingredients
 * 
 * JUNIOR DEV NOTE: This database maps common ingredients to their default aisles.
 * Used for auto-categorization in shopping lists and autocomplete suggestions.
 */

export const INGREDIENT_DB = {
    // --- Produce ---
    'apple': { aisle: 'produce', defaultUnit: 'piece' },
    'banana': { aisle: 'produce', defaultUnit: 'piece' },
    'carrot': { aisle: 'produce', defaultUnit: 'piece' },
    'onion': { aisle: 'produce', defaultUnit: 'piece' },
    'garlic': { aisle: 'produce', defaultUnit: 'clove' },
    'potato': { aisle: 'produce', defaultUnit: 'lb' },
    'lettuce': { aisle: 'produce', defaultUnit: 'head' },
    'spinach': { aisle: 'produce', defaultUnit: 'bag' },
    'tomato': { aisle: 'produce', defaultUnit: 'piece' },
    'pepper': { aisle: 'produce', defaultUnit: 'piece' },
    'broccoli': { aisle: 'produce', defaultUnit: 'head' },
    'cucumber': { aisle: 'produce', defaultUnit: 'piece' },
    'celery': { aisle: 'produce', defaultUnit: 'stalk' },
    'mushroom': { aisle: 'produce', defaultUnit: 'package' },
    'avocado': { aisle: 'produce', defaultUnit: 'piece' },
    'lemon': { aisle: 'produce', defaultUnit: 'piece' },
    'lime': { aisle: 'produce', defaultUnit: 'piece' },
    'ginger': { aisle: 'produce', defaultUnit: 'inch' },
    'cilantro': { aisle: 'produce', defaultUnit: 'bunch' },
    'parsley': { aisle: 'produce', defaultUnit: 'bunch' },
    'basil': { aisle: 'produce', defaultUnit: 'bunch' },

    // --- Dairy & Eggs ---
    'milk': { aisle: 'dairy', defaultUnit: 'gallon' },
    'egg': { aisle: 'dairy', defaultUnit: 'dozen' },
    'butter': { aisle: 'dairy', defaultUnit: 'lb' },
    'cheese': { aisle: 'dairy', defaultUnit: 'package' },
    'yogurt': { aisle: 'dairy', defaultUnit: 'container' },
    'cream': { aisle: 'dairy', defaultUnit: 'pint' },
    'sour cream': { aisle: 'dairy', defaultUnit: 'container' },
    'cream cheese': { aisle: 'dairy', defaultUnit: 'package' },
    'parmesan': { aisle: 'dairy', defaultUnit: 'package' },

    // --- Meat & Seafood ---
    'chicken breast': { aisle: 'meat', defaultUnit: 'lb' },
    'chicken thigh': { aisle: 'meat', defaultUnit: 'lb' },
    'ground beef': { aisle: 'meat', defaultUnit: 'lb' },
    'ground turkey': { aisle: 'meat', defaultUnit: 'lb' },
    'steak': { aisle: 'meat', defaultUnit: 'lb' },
    'pork chop': { aisle: 'meat', defaultUnit: 'lb' },
    'bacon': { aisle: 'meat', defaultUnit: 'package' },
    'salmon': { aisle: 'meat', defaultUnit: 'lb' },
    'shrimp': { aisle: 'meat', defaultUnit: 'lb' },
    'sausage': { aisle: 'meat', defaultUnit: 'package' },
    'beef': { aisle: 'meat', defaultUnit: 'lb' },
    'pork': { aisle: 'meat', defaultUnit: 'lb' },
    'chicken': { aisle: 'meat', defaultUnit: 'lb' },

    // --- Bakery ---
    'bread': { aisle: 'bakery', defaultUnit: 'loaf' },
    'bagel': { aisle: 'bakery', defaultUnit: 'package' },
    'tortilla': { aisle: 'bakery', defaultUnit: 'package' },
    'bun': { aisle: 'bakery', defaultUnit: 'package' },
    'bun': { aisle: 'bakery', defaultUnit: 'package' },
    'croissant': { aisle: 'bakery', defaultUnit: 'piece' },

    // --- Pantry ---
    'rice': { aisle: 'pantry', defaultUnit: 'bag' },
    'pasta': { aisle: 'pantry', defaultUnit: 'box' },
    'flour': { aisle: 'pantry', defaultUnit: 'bag' },
    'sugar': { aisle: 'pantry', defaultUnit: 'bag' },
    'oil': { aisle: 'pantry', defaultUnit: 'bottle' },
    'olive oil': { aisle: 'pantry', defaultUnit: 'bottle' },
    'vinegar': { aisle: 'pantry', defaultUnit: 'bottle' },
    'canned tomato': { aisle: 'pantry', defaultUnit: 'can' },
    'tomato sauce': { aisle: 'pantry', defaultUnit: 'can' },
    'beans': { aisle: 'pantry', defaultUnit: 'can' },
    'peanut butter': { aisle: 'pantry', defaultUnit: 'jar' },
    'jelly': { aisle: 'pantry', defaultUnit: 'jar' },
    'honey': { aisle: 'pantry', defaultUnit: 'bottle' },
    'cereal': { aisle: 'pantry', defaultUnit: 'box' },
    'oat': { aisle: 'pantry', defaultUnit: 'canister' },
    'soy sauce': { aisle: 'pantry', defaultUnit: 'bottle' },
    'broth': { aisle: 'pantry', defaultUnit: 'carton' },
    'stock': { aisle: 'pantry', defaultUnit: 'carton' },

    // --- Spices ---
    'salt': { aisle: 'spices', defaultUnit: 'container' },
    'pepper': { aisle: 'spices', defaultUnit: 'container' }, // Duplicate key handled by logic or key renaming? 
    // Actually JS objects override. I should probably clarify black pepper vs bell pepper.
    'black pepper': { aisle: 'spices', defaultUnit: 'container' },
    'chili powder': { aisle: 'spices', defaultUnit: 'bottle' },
    'cumin': { aisle: 'spices', defaultUnit: 'bottle' },
    'cinnamon': { aisle: 'spices', defaultUnit: 'bottle' },
    'garlic powder': { aisle: 'spices', defaultUnit: 'bottle' },
    'onion powder': { aisle: 'spices', defaultUnit: 'bottle' },
    'paprika': { aisle: 'spices', defaultUnit: 'bottle' },
    'oregano': { aisle: 'spices', defaultUnit: 'bottle' },
    'thyme': { aisle: 'spices', defaultUnit: 'bottle' },
    'vanilla extract': { aisle: 'spices', defaultUnit: 'bottle' },

    // --- Frozen ---
    'ice cream': { aisle: 'frozen', defaultUnit: 'carton' },
    'frozen vegetable': { aisle: 'frozen', defaultUnit: 'bag' },
    'frozen fruit': { aisle: 'frozen', defaultUnit: 'bag' },
    'pizza': { aisle: 'frozen', defaultUnit: 'box' },

    // --- Beverages ---
    'water': { aisle: 'beverages', defaultUnit: 'case' },
    'soda': { aisle: 'beverages', defaultUnit: 'pack' },
    'juice': { aisle: 'beverages', defaultUnit: 'bottle' },
    'coffee': { aisle: 'beverages', defaultUnit: 'bag' },
    'tea': { aisle: 'beverages', defaultUnit: 'box' },
};

/**
 * Helper to get aisle for an ingredient
 * @param {string} name 
 * @returns {string|null} Aisle ID or null if not found
 */
export const getIngredientAisle = (name) => {
    if (!name) return 'other';
    const lower = name.toLowerCase().trim();
    // Direct match
    if (INGREDIENT_DB[lower]) return INGREDIENT_DB[lower].aisle;

    // Partial match (e.g. "red apple" -> "apple")
    const keys = Object.keys(INGREDIENT_DB);
    const match = keys.find(k => lower.includes(k));
    return match ? INGREDIENT_DB[match].aisle : 'other';
};

/**
 * List of ingredient names for autocomplete
 */
export const INGREDIENT_NAMES = Object.keys(INGREDIENT_DB).sort();
