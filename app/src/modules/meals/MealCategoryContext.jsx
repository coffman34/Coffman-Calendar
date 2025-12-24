import React, { useState, useEffect } from 'react';
import { MealCategoryContext } from './MealCategoryContextCore';

const STORAGE_KEY = 'coffman_meal_categories';

const DEFAULT_CATEGORIES = [
    { id: 'breakfast', name: 'Breakfast', color: '#E57373', visible: true },
    { id: 'lunch', name: 'Lunch', color: '#81C4C4', visible: true },
    { id: 'dinner', name: 'Dinner', color: '#81C784', visible: true },
    { id: 'snack', name: 'Snack', color: '#DEB887', visible: true },
];

export default function MealCategoryProvider({ children }) {
    const [categories, setCategories] = useState(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : DEFAULT_CATEGORIES;
    });

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(categories));
    }, [categories]);

    const updateCategory = (id, updates) => {
        setCategories(prev => prev.map(cat =>
            cat.id === id ? { ...cat, ...updates } : cat
        ));
    };

    const toggleVisibility = (id) => {
        updateCategory(id, { visible: !categories.find(c => c.id === id)?.visible });
    };

    const visibleCategories = categories.filter(c => c.visible);

    return (
        <MealCategoryContext.Provider value={{
            categories,
            visibleCategories,
            updateCategory,
            toggleVisibility,
        }}>
            {children}
        </MealCategoryContext.Provider>
    );
};

