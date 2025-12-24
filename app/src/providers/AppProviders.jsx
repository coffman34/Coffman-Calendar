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
 * 4. Meals - Meal planning
 * 5. PIN - Security layer
 * 6. Users - User profiles, auth, sync
 * 7. Calendar - Calendar events
 * 
 * JUNIOR DEV NOTE: Why does order matter?
 * Inner providers can use outer providers, but not vice versa.
 * For example, CalendarProvider uses UserProvider, so User must be outer.
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - App content
 */
export const AppProviders = ({ children }) => {
    return (
        <UIProvider>
            <ThemeProvider>
                <MealCategoryProvider>
                    <MealProvider>
                        <PinProvider>
                            <UserProvider>
                                <CalendarProvider>
                                    {/* Material-UI CSS reset */}
                                    <CssBaseline />
                                    {children}
                                </CalendarProvider>
                            </UserProvider>
                        </PinProvider>
                    </MealProvider>
                </MealCategoryProvider>
            </ThemeProvider>
        </UIProvider>
    );
};

/**
 * REFACTORING NOTE:
 * 
 * Before: All providers nested in App.jsx (hard to read)
 * After: Providers composed here (clean separation)
 * 
 * To add a new provider:
 * 1. Import it at the top
 * 2. Add it to the nesting (consider the order!)
 * 3. Document why it's in that position
 */
