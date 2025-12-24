/**
 * @fileoverview Module routing configuration and component
 * @module routing/ModuleRouter
 * 
 * EDUCATIONAL NOTES FOR JUNIOR DEVELOPERS:
 * 
 * WHY THIS FILE EXISTS:
 * The app has multiple "modules" (Calendar, Tasks, Meals, etc.).
 * This file handles:
 * - Defining which modules exist
 * - Routing to the correct module
 * - Animating transitions between modules
 * 
 * DESIGN PATTERN: Router Pattern + Configuration
 * We separate routing logic from the main App component.
 */

import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import CalendarView from '../modules/calendar/CalendarView';
import TasksView from '../modules/tasks/TasksView';
import RewardsView from '../modules/rewards/RewardsView';
import MealsView from '../modules/meals/MealsView';
import PhotosView from '../modules/photos/PhotosView';
import ListView from '../modules/lists/ListView';
import SleepView from '../modules/sleep/SleepView';
import SettingsView from '../modules/settings/SettingsView';
import MainLayout from '../components/MainLayout';
import GlobalSnackbar from '../components/GlobalSnackbar';

/**
 * Module configuration
 * 
 * WHAT IT DOES:
 * Defines all available modules and their components.
 * 
 * WHY A CONFIGURATION OBJECT?
 * - Easy to add new modules (just add to this object)
 * - Type-safe (can see all modules at a glance)
 * - Testable (can verify all modules are defined)
 * 
 * JUNIOR DEV NOTE: Why not use React Router?
 * This is a kiosk app with simple navigation. React Router would be
 * overkill. This simple object-based routing is easier to understand.
 */
const MODULES = {
    calendar: CalendarView,
    tasks: TasksView,
    rewards: RewardsView,
    meals: MealsView,
    photos: PhotosView,
    lists: ListView,
    sleep: SleepView,
    settings: SettingsView,
};

/**
 * Animation configuration for module transitions
 * 
 * JUNIOR DEV NOTE: What are these values?
 * - initial: Starting state (invisible, shifted right)
 * - animate: End state (visible, centered)
 * - exit: Leaving state (invisible, shifted left)
 * - duration: How long the animation takes (0.3 seconds)
 */
const TRANSITION_CONFIG = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
    transition: { duration: 0.3 },
};

/**
 * Module Router Component
 * 
 * WHAT IT DOES:
 * Handles navigation between app modules with animations.
 * 
 * HOW IT WORKS:
 * 1. Track current module in state
 * 2. Render the corresponding component
 * 3. Animate transitions with Framer Motion
 * 4. Handle escape key to close app (kiosk mode)
 * 
 * @returns {React.ReactElement} Router component
 */
export const ModuleRouter = () => {
    // ========================================================================
    // STATE
    // ========================================================================

    /**
     * Currently active module
     * 
     * JUNIOR DEV NOTE: Why default to 'calendar'?
     * The calendar is the most important view for a family calendar app.
     * Users should see it first when they open the app.
     */
    const [currentModule, setCurrentModule] = useState('calendar');

    // ========================================================================
    // EFFECTS
    // ========================================================================

    /**
     * Handle escape key to close app (kiosk mode)
     * 
     * WHAT IT DOES:
     * Listens for Escape key and closes the window.
     * 
     * WHY WE NEED IT:
     * In kiosk mode, there's no window chrome (close button).
     * Escape key provides a way to exit for maintenance.
     * 
     * JUNIOR DEV NOTE: Why cleanup function?
     * When the component unmounts, we remove the event listener.
     * This prevents memory leaks.
     */
    useEffect(() => {
        const handleEsc = (event) => {
            if (event.key === 'Escape') {
                window.close();
            }
        };

        window.addEventListener('keydown', handleEsc);

        // Cleanup function
        return () => window.removeEventListener('keydown', handleEsc);
    }, []);

    // ========================================================================
    // RENDERING
    // ========================================================================

    /**
     * Renders the current module component
     * 
     * WHAT IT DOES:
     * Looks up the component for the current module and renders it.
     * 
     * JUNIOR DEV NOTE: Why || CalendarView?
     * If someone passes an invalid module name, we fall back to Calendar.
     * This prevents the app from crashing.
     */
    const ModuleComponent = MODULES[currentModule] || CalendarView;

    return (
        <>
            <MainLayout
                currentModule={currentModule}
                onModuleSelect={setCurrentModule}
            >
                {/* AnimatePresence enables exit animations */}
                <AnimatePresence mode="wait">
                    {/* 
            motion.div animates the module transitions
            
            JUNIOR DEV NOTE: Why key={currentModule}?
            Framer Motion uses the key to detect when the component changes.
            When the key changes, it triggers the exit/enter animations.
          */}
                    <motion.div
                        key={currentModule}
                        initial={TRANSITION_CONFIG.initial}
                        animate={TRANSITION_CONFIG.animate}
                        exit={TRANSITION_CONFIG.exit}
                        transition={TRANSITION_CONFIG.transition}
                        style={{ height: '100%' }}
                    >
                        <ModuleComponent />
                    </motion.div>
                </AnimatePresence>
            </MainLayout>

            {/* Global notification snackbar */}
            <GlobalSnackbar />
        </>
    );
};

/**
 * REFACTORING NOTE:
 * 
 * Before: All routing logic in App.jsx
 * After: Separated into this file
 * 
 * Benefits:
 * - App.jsx is now just 10 lines
 * - Routing logic is isolated and testable
 * - Easy to add new modules
 * - Animation config is centralized
 */
