import { useContext } from 'react';
import { MealContext } from './MealContextCore';

export const useMeals = () => {
    const context = useContext(MealContext);
    if (!context) throw new Error('useMeals must be used within MealProvider');
    return context;
};
