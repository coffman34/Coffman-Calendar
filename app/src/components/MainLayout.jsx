/**
 * @fileoverview Main application layout component
 * @module components/MainLayout
 * 
 * EDUCATIONAL NOTES FOR JUNIOR DEVELOPERS:
 * 
 * WHY THIS FILE EXISTS:
 * The app needs a consistent layout across all views:
 * - Navigation (sidebar or bottom bar)
 * - Info bar (date, time, weather)
 * - Content area
 * - Screensaver
 * 
 * This component provides that structure.
 * 
 * DESIGN PATTERN: Layout Component Pattern
 * Wraps content with consistent chrome (nav, header, etc.).
 * 
 * REFACTORING NOTE:
 * Before: 141 lines with inline nav items and styling
 * After: ~80 lines using extracted components and config
 */

import React from 'react';
import { Box, Paper, useMediaQuery } from '@mui/material';
import { NAV_ITEMS } from '../config/navigation';
import NavItem from './navigation/NavItem';
import useIdleTimer from '../hooks/useIdleTimer';
import Screensaver from './Screensaver';
import InfoBar from './InfoBar';

/**
 * Main Layout Component
 * 
 * WHAT IT DOES:
 * Provides the app's layout structure with responsive navigation.
 * 
 * HOW IT WORKS:
 * - Landscape: Sidebar navigation on left
 * - Portrait: Bottom navigation bar
 * - Always: Info bar at top, content in middle
 * - Idle: Shows screensaver overlay
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Main content
 * @param {Function} props.onModuleSelect - Module selection handler
 * @param {string} props.currentModule - Currently active module
 */
const MainLayout = ({ children, onModuleSelect, currentModule }) => {
    // ========================================================================
    // HOOKS
    // ========================================================================

    /**
     * Idle timer for screensaver with wake delay protection
     * 
     * JUNIOR DEV NOTE: Why 30000ms?
     * 30 seconds (30,000 milliseconds) of inactivity triggers the screensaver.
     * 
     * DEFENSIVE UX: isWaking
     * When waking from screensaver, isWaking is true for 500ms.
     * This prevents the wake touch from accidentally clicking UI elements.
     */
    const { isIdle, setIdle, isWaking } = useIdleTimer(30000);

    /**
     * Detect device orientation
     * 
     * JUNIOR DEV NOTE: What is useMediaQuery?
     * It's a Material-UI hook that checks CSS media queries.
     * Returns true if the query matches, false otherwise.
     * Updates automatically when orientation changes!
     */
    const isPortrait = useMediaQuery('(orientation: portrait)');

    // ========================================================================
    // HANDLERS
    // ========================================================================

    /**
     * Handles navigation item clicks
     * 
     * WHAT IT DOES:
     * - If "Sleep" is clicked, activate screensaver
     * - Otherwise, navigate to the selected module
     * 
     * JUNIOR DEV NOTE: Why special case for sleep?
     * "Sleep" isn't a real module - it's just the screensaver.
     * We handle it specially to activate idle mode.
     * 
     * @param {string} id - Nav item ID
     */
    const handleNavClick = (id) => {
        if (id === 'sleep') {
            setIdle(true);
        } else {
            onModuleSelect(id);
        }
    };

    // ========================================================================
    // RENDERING
    // ========================================================================

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: isPortrait ? 'column' : 'row',
                height: '100vh',
                overflow: 'hidden',
                bgcolor: 'background.default',
                p: 2,
                gap: 2,
            }}
        >
            {/* Screensaver overlay (shown when idle) */}
            <Screensaver isIdle={isIdle} />

            {/* 
             * DEFENSIVE UX: Wake Delay Overlay
             * 
             * WHAT IT DOES:
             * Blocks all touch/click input for 500ms after waking from screensaver.
             * 
             * WHY:
             * The touch that dismisses the screensaver would otherwise immediately
             * trigger a click on whatever UI element is beneath it.
             * 
             * HOW:
             * This invisible overlay captures all pointer events during isWaking=true.
             */}
            {isWaking && (
                <Box
                    sx={{
                        position: 'fixed',
                        inset: 0,
                        zIndex: 9998, // Just below screensaver (9999)
                        pointerEvents: 'all',
                        cursor: 'default',
                    }}
                />
            )}

            {/* Sidebar Navigation (landscape only) */}
            {!isPortrait && (
                <Paper
                    elevation={0}
                    sx={{
                        width: 80,
                        flexShrink: 0,
                        borderRadius: 2,
                        bgcolor: '#F9FAFB',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        py: 2,
                        gap: 1,
                    }}
                >
                    {NAV_ITEMS.map(item => (
                        <NavItem
                            key={item.id}
                            item={item}
                            isActive={currentModule === item.id}
                            onClick={() => handleNavClick(item.id)}
                        />
                    ))}
                </Paper>
            )}

            {/* Main Content Area */}
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                }}
            >
                {/* Info Bar (date, time, weather) */}
                <InfoBar />

                {/* Content */}
                <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
                    {children}
                </Box>
            </Box>

            {/* Bottom Navigation (portrait only) */}
            {isPortrait && (
                <Paper
                    elevation={0}
                    sx={{
                        display: 'flex',
                        justifyContent: 'space-around',
                        alignItems: 'center',
                        borderRadius: 2,
                        bgcolor: '#F9FAFB',
                        py: 1,
                        flexShrink: 0,
                    }}
                >
                    {NAV_ITEMS.map(item => (
                        <NavItem
                            key={item.id}
                            item={item}
                            isActive={currentModule === item.id}
                            onClick={() => handleNavClick(item.id)}
                        />
                    ))}
                </Paper>
            )}
        </Box>
    );
};

export default MainLayout;

/**
 * REFACTORING IMPROVEMENTS:
 * 
 * 1. Extracted NavItem component (reusable)
 * 2. Extracted NAV_ITEMS config (easy to modify)
 * 3. Extracted useIdleTimer hook (testable)
 * 4. Cleaner structure (easier to understand)
 * 5. Better comments (educational)
 * 
 * RESPONSIVE DESIGN:
 * - Landscape: Sidebar on left (desktop/tablet horizontal)
 * - Portrait: Bottom bar (tablet vertical/phone)
 * - Automatic switching based on orientation
 */
