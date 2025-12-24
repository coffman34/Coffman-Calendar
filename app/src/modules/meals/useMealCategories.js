import { useContext } from 'react';
import { MealCategoryContext } from './MealCategoryContextCore';

export const useMealCategories = () => {
    const context = useContext(MealCategoryContext);
    if (!context) throw new Error('useMealCategories must be used within MealCategoryProvider');
    return context;
};
