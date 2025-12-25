/**
 * @fileoverview Shopping List Context
 * @module modules/meals/contexts/ShoppingListContext
 * 
 * JUNIOR DEV NOTE: This context manages the shopping list feature:
 * - Generates lists from weekly meal plan
 * - Aggregates and consolidates ingredients
 * - Groups by aisle for grocery store efficiency
 * - Persists checked-off items across sessions
 * 
 * UNIT CONSOLIDATION:
 * We normalize common units (cup, cups → cup) and combine quantities
 * for the same ingredient. E.g., "1/2 cup onion" + "1 cup onion" = "1.5 cups onion"
 */

import React, { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { startOfWeek, addDays, format } from 'date-fns';
import { normalizeAisle, AISLE_CATEGORIES } from '../constants/aisles';

const STORAGE_KEY = 'family_shopping_list';

const ShoppingListContext = createContext(null);

/**
 * Normalizes units for consolidation
 * JUNIOR DEV NOTE: Spoonacular uses various unit formats; we standardize them
 */
const normalizeUnit = (unit) => {
    if (!unit) return '';
    const lower = unit.toLowerCase().trim();
    const unitMap = {
        'cups': 'cup', 'tbsp': 'tablespoon', 'tablespoons': 'tablespoon',
        'tsp': 'teaspoon', 'teaspoons': 'teaspoon', 'lbs': 'lb',
        'pounds': 'lb', 'ounces': 'oz', 'ozs': 'oz',
    };
    return unitMap[lower] || lower;
};

/**
 * Shopping List Provider
 * 
 * DATA MODEL:
 * {
 *   items: [
 *     { id, name, amount, unit, aisle, checked, sourceRecipes: [...] }
 *   ],
 *   lastGenerated: ISO timestamp
 * }
 */
export function ShoppingListProvider({ children }) {
    const [shoppingList, setShoppingList] = useState(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : { items: [], lastGenerated: null };
    });

    // Persist to localStorage
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(shoppingList));
    }, [shoppingList]);

    /**
     * Generates shopping list from meals context
     * @param {Object} meals - Meals object from MealContext
     * @param {number} daysAhead - Days to include (default: 7 for current week)
     */
    const generateFromMeals = useCallback((meals, daysAhead = 7) => {
        const weekStart = startOfWeek(new Date());
        const ingredientMap = new Map(); // Key: normalized "name|unit"

        // 1. Collect all ingredients from scheduled meals
        for (let i = 0; i < daysAhead; i++) {
            const dateKey = format(addDays(weekStart, i), 'yyyy-MM-dd');
            const dayMeals = meals[dateKey] || {};

            Object.values(dayMeals).flat().forEach(meal => {
                (meal.ingredients || []).forEach(ing => {
                    const key = `${ing.name.toLowerCase()}|${normalizeUnit(ing.unit)}`;

                    if (ingredientMap.has(key)) {
                        // Consolidate quantities
                        const existing = ingredientMap.get(key);
                        existing.amount += parseFloat(ing.amount) || 0;
                        existing.sourceRecipes.push(meal.name);
                    } else {
                        ingredientMap.set(key, {
                            id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                            name: ing.name,
                            amount: parseFloat(ing.amount) || 0,
                            unit: normalizeUnit(ing.unit),
                            aisle: normalizeAisle(ing.aisle),
                            checked: false,
                            sourceRecipes: [meal.name],
                        });
                    }
                });
            });
        }

        // 2. Convert map to sorted array
        const items = Array.from(ingredientMap.values()).sort((a, b) => {
            const aisleA = AISLE_CATEGORIES.find(c => c.id === a.aisle)?.order || 99;
            const aisleB = AISLE_CATEGORIES.find(c => c.id === b.aisle)?.order || 99;
            return aisleA - aisleB || a.name.localeCompare(b.name);
        });

        setShoppingList({ items, lastGenerated: new Date().toISOString() });
    }, []);

    /**
     * Toggle an item's checked status
     */
    const toggleItem = useCallback((itemId) => {
        setShoppingList(prev => ({
            ...prev,
            items: prev.items.map(item =>
                item.id === itemId ? { ...item, checked: !item.checked } : item
            ),
        }));
    }, []);

    /**
     * Clear all items (reset list)
     */
    const clearList = useCallback(() => {
        setShoppingList({ items: [], lastGenerated: null });
    }, []);

    /**
     * Get items grouped by aisle
     */
    const getGroupedItems = useCallback(() => {
        return AISLE_CATEGORIES.map(aisle => ({
            ...aisle,
            items: shoppingList.items.filter(item => item.aisle === aisle.id),
        })).filter(group => group.items.length > 0);
    }, [shoppingList.items]);

    /**
     * Add a manual item to the list
     */
    const addItem = useCallback((name) => {
        const newItem = {
            id: `manual-${Date.now()}`,
            name,
            amount: 1,
            unit: 'item',
            aisle: 'misc', // Default aisle, could use a classifier later
            checked: false,
            sourceRecipes: ['Manual']
        };

        setShoppingList(prev => ({
            ...prev,
            items: [...prev.items, newItem]
        }));
    }, []);

    /**
     * Delete an item from the list
     */
    const deleteItem = useCallback((itemId) => {
        setShoppingList(prev => ({
            ...prev,
            items: prev.items.filter(item => item.id !== itemId)
        }));
    }, []);

    const value = {
        shoppingList,
        generateFromMeals,
        toggleItem,
        clearList,
        toggleItem,
        clearList,
        getGroupedItems,
        addItem,
        deleteItem,
    };

    return (
        <ShoppingListContext.Provider value={value}>
            {children}
        </ShoppingListContext.Provider>
    );
}

/**
 * Hook to access shopping list
 */
export function useShoppingList() {
    const context = useContext(ShoppingListContext);
    if (!context) {
        throw new Error('useShoppingList must be used within ShoppingListProvider');
    }
    return context;
}

export default ShoppingListContext;
