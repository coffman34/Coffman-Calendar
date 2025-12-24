/**
 * @fileoverview Navigation configuration
 * @module config/navigation
 * 
 * EDUCATIONAL NOTES FOR JUNIOR DEVELOPERS:
 * 
 * WHY THIS FILE EXISTS:
 * The navigation bar shows icons for each app module.
 * Instead of hardcoding this in the component, we define it here.
 * 
 * BENEFITS:
 * - Easy to add/remove/reorder nav items
 * - Icons and labels in one place
 * - Can be used by multiple components
 * - Testable independently
 * 
 * DESIGN PATTERN: Configuration Object Pattern
 */

import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary';
import ListAltIcon from '@mui/icons-material/ListAlt';
import BedtimeIcon from '@mui/icons-material/Bedtime';
import SettingsIcon from '@mui/icons-material/Settings';

/**
 * Navigation items configuration
 * 
 * WHAT IT CONTAINS:
 * Each nav item has:
 * - id: Unique identifier (matches module name)
 * - label: Display text
 * - icon: Material-UI icon component
 * 
 * JUNIOR DEV NOTE: Why this structure?
 * - id: Used for routing ("calendar", "tasks", etc.)
 * - label: Shown to users
 * - icon: Visual representation
 * 
 * ORDER MATTERS:
 * Items appear in the nav bar in this order.
 * Most important items should be first.
 */
export const NAV_ITEMS = [
    { id: 'calendar', label: 'Calendar', icon: CalendarMonthIcon },
    { id: 'tasks', label: 'Tasks', icon: TaskAltIcon },
    { id: 'rewards', label: 'Rewards', icon: EmojiEventsIcon },
    { id: 'meals', label: 'Meals', icon: RestaurantIcon },
    { id: 'photos', label: 'Photos', icon: PhotoLibraryIcon },
    { id: 'lists', label: 'Lists', icon: ListAltIcon },
    { id: 'sleep', label: 'Sleep', icon: BedtimeIcon },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
];

/**
 * Gets a nav item by ID
 * 
 * @param {string} id - Nav item ID
 * @returns {Object|null} Nav item or null if not found
 */
export const getNavItemById = (id) => {
    return NAV_ITEMS.find(item => item.id === id) || null;
};

/**
 * Checks if a nav item ID is valid
 * 
 * @param {string} id - Nav item ID to check
 * @returns {boolean} True if valid
 */
export const isValidNavItem = (id) => {
    return NAV_ITEMS.some(item => item.id === id);
};
