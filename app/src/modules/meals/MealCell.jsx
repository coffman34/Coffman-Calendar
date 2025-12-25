/**
 * @fileoverview Draggable Meal Cell Component
 * @module modules/meals/MealCell
 * 
 * JUNIOR DEV NOTE: Each meal within a cell is now DRAGGABLE.
 * This allows users to rearrange meals by dragging them to different
 * days or categories on the grid.
 * 
 * HOW IT WORKS:
 * 1. Each meal box has draggable="true"
 * 2. onDragStart stores the meal data + source location
 * 3. MealPlanGrid handles the drop and calls the move handler
 * 
 * DATA STRUCTURE PASSED ON DRAG:
 * {
 *   type: 'meal',  // Distinguishes from recipe drops
 *   meal: {...},   // The meal object
 *   sourceDateKey: '2024-01-15',
 *   sourceCategoryId: 'breakfast'
 * }
 */

import React from 'react';
import { Box, Typography } from '@mui/material';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';

/**
 * MealCell Component
 * 
 * @param {Array} meals - Array of meal objects for this cell
 * @param {string} categoryColor - Background color for meal chips
 * @param {string} dateKey - Date key for this cell (needed for drag source)
 * @param {string} categoryId - Category ID for this cell (needed for drag source)
 * @param {Function} onTap - Called when cell/meal is tapped
 * @param {Function} onLongPress - Called on right-click/long-press
 */
const MealCell = ({ meals = [], categoryColor, dateKey, categoryId, onTap, onLongPress }) => {
    const handleContextMenu = (e) => {
        e.preventDefault();
        onLongPress?.();
    };

    /**
     * Handle drag start for a meal
     * 
     * JUNIOR DEV NOTE: We store BOTH the meal data AND the source location.
     * The source location is needed so the drop handler knows where to
     * remove the meal from when doing a "move" operation.
     */
    const handleDragStart = (e, meal) => {
        // Stop propagation to prevent parent handlers from interfering
        e.stopPropagation();

        const dragData = {
            type: 'meal', // Distinguishes from 'recipe' drops
            meal: meal,
            sourceDateKey: dateKey,
            sourceCategoryId: categoryId,
        };

        console.log('DRAG START:', dragData); // DEBUG

        e.dataTransfer.setData('application/json', JSON.stringify(dragData));
        e.dataTransfer.effectAllowed = 'copyMove'; // Allow both to ensure compatibility with drop targets
    };

    if (meals.length === 0) {
        return (
            <Box
                onClick={onTap}
                sx={{
                    height: '100%',
                    minHeight: 60,
                    cursor: 'pointer',
                    '&:hover': { bgcolor: 'rgba(0,0,0,0.02)' },
                }}
            />
        );
    }

    return (
        <Box
            onClick={onTap}
            onContextMenu={handleContextMenu}
            sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, p: 0.5 }}
        >
            {meals.map((meal) => (
                <Box
                    key={meal.id}
                    draggable="true"
                    onDragStart={(e) => handleDragStart(e, meal)}
                    sx={{
                        bgcolor: categoryColor || '#e0e0e0',
                        borderRadius: 1,
                        p: 1,
                        cursor: 'grab',
                        minHeight: 40,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5,
                        transition: 'all 0.2s ease',
                        '&:hover': {
                            transform: 'scale(1.02)',
                            boxShadow: 2,
                        },
                        '&:active': {
                            cursor: 'grabbing',
                            transform: 'scale(0.98)',
                            opacity: 0.8,
                        },
                    }}
                >
                    {/* Drag Handle Icon */}
                    <DragIndicatorIcon sx={{ fontSize: 16, opacity: 0.5 }} />

                    <Typography variant="caption" sx={{ fontWeight: 500, fontSize: '0.75rem', flex: 1 }}>
                        {meal.name}
                    </Typography>
                </Box>
            ))}
        </Box>
    );
};

export default MealCell;
