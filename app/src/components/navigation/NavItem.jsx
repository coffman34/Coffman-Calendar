/**
 * @fileoverview Navigation item component
 * @module components/navigation/NavItem
 * 
 * EDUCATIONAL NOTES FOR JUNIOR DEVELOPERS:
 * 
 * WHY THIS FILE EXISTS:
 * Each navigation button has the same structure (icon + label).
 * Instead of duplicating this code, we create a reusable component.
 * 
 * DESIGN PATTERN: Presentational Component
 * This component only handles presentation (how it looks).
 * It doesn't know about routing or state - just displays what it's given.
 */

import React from 'react';
import { Box, Typography } from '@mui/material';

/**
 * Navigation Item Component
 * 
 * WHAT IT DOES:
 * Renders a single navigation button with icon and label.
 * 
 * WHY SEPARATE COMPONENT?
 * - Reusable (used in sidebar and bottom nav)
 * - Testable in isolation
 * - Styling in one place
 * 
 * @param {Object} props
 * @param {Object} props.item - Nav item { id, label, icon }
 * @param {boolean} props.isActive - Whether this item is currently selected
 * @param {Function} props.onClick - Click handler
 */
const NavItem = ({ item, isActive, onClick }) => {
    const Icon = item.icon;

    return (
        <Box
            onClick={onClick}
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                p: 1,
                minWidth: 64,
                cursor: 'pointer',
                borderRadius: 2,
                // Active state styling
                bgcolor: isActive ? 'rgba(239, 154, 154, 0.3)' : 'transparent',
                color: isActive ? 'primary.main' : 'text.secondary',
                // Hover effect
                '&:hover': {
                    bgcolor: isActive ? 'rgba(239, 154, 154, 0.3)' : 'action.hover',
                },
                // Smooth transitions
                transition: 'all 0.2s ease-in-out',
            }}
        >
            <Icon sx={{ fontSize: 24 }} />
            <Typography variant="caption" sx={{ mt: 0.5, fontSize: 11 }}>
                {item.label}
            </Typography>
        </Box>
    );
};

export default NavItem;

/**
 * JUNIOR DEV NOTE: Material-UI sx prop
 * 
 * The sx prop is Material-UI's way of styling components.
 * It's like inline styles but with superpowers:
 * - Access to theme values (colors, spacing, etc.)
 * - Pseudo-selectors (&:hover)
 * - Responsive breakpoints
 * - Type-safe
 * 
 * Example:
 * - p: 1 = padding: theme.spacing(1) = 8px
 * - bgcolor: 'primary.main' = background-color: theme.palette.primary.main
 */
