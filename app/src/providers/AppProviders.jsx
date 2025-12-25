/**
 * @fileoverview Application providers composition
 * @module providers/AppProviders
 * 
 * EDUCATIONAL NOTES FOR JUNIOR DEVELOPERS:
 * 
 * WHY THIS FILE EXISTS:
 * React apps often need many context providers (theme, auth, data, etc.).
 * Nesting them all in App.jsx creates deeply nested code that's hard to read.
 * 
 * This file composes all providers in one place.
 * 
 * DESIGN PATTERN: Composition Pattern
 * We compose multiple providers into a single component.
 * 
 * BENEFITS:
 * - App.jsx stays clean and focused
 * - Provider order is clear and documented
 * - Easy to add/remove providers
 * - Testable in isolation
 */

import React from 'react';
import { CssBaseline } from '@mui/material';
import ThemeProvider from '../theme/ThemeContext';
import PinProvider from '../components/PinContext';
import UIProvider from '../modules/ui/UIContext';
import UserProvider from '../modules/users/UserContext';
import CalendarProvider from '../modules/calendar/CalendarContext';
import MealCategoryProvider from '../modules/meals/MealCategoryContext';
import MealProvider from '../modules/meals/MealContext';
import { ShoppingListProvider } from '../modules/meals/contexts/ShoppingListContext';
import { RecipePreferencesProvider } from '../modules/meals/contexts/RecipePreferencesContext';

/**
 * App Providers Component
 * 
 * WHAT IT DOES:
 * Wraps the app with all necessary context providers.
 * 
 * WHY THIS ORDER?
 * Providers are nested from outermost to innermost:
 * 1. UI (notifications, snackbars) - Used by everything
 * 2. Theme - Visual styling
 * 3. Meal Categories - Meal data structure
 * 4. Recipe Preferences - User preferences for meals
 * 5. Meals - Meal planning (uses preferences)
 * 6. Shopping List - Derived from meals
 * 7. PIN - Security layer
 * 8. Users - User profiles, auth, sync
 * 9. Calendar - Calendar events (uses users)
 * 
 * JUNIOR DEV NOTE: Why does order matter?
 * Inner providers can use outer providers, but not vice versa.
 * For example, CalendarProvider uses UserProvider, so User must be outer.
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - App content
 */
// Log provider initialization
export const AppProviders = ({ children }) => {
    console.log('[PROVIDERS] Initializing AppProviders...');
    return (
        <UIProvider>
            <ThemeProvider>
                <MealCategoryProvider>
                    <RecipePreferencesProvider>
                        <MealProvider>
                            <ShoppingListProvider>
                                <PinProvider>
                                    <UserProvider>
                                        <CalendarProvider>
                                            <CssBaseline />
                                            {children}
                                        </CalendarProvider>
                                    </UserProvider>
                                </PinProvider>
                            </ShoppingListProvider>
                        </MealProvider>
                    </RecipePreferencesProvider>
                </MealCategoryProvider>
            </ThemeProvider>
        </UIProvider>
    );
};
