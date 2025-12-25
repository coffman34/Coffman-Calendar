/**
 * @fileoverview Weekly Meal Planning Grid with Drag-and-Drop Support
 * @module modules/meals/MealPlanGrid
 * 
 * JUNIOR DEV NOTE: This displays a 7-day grid with meal categories.
 * 
 * KEY FEATURES:
 * 1. "Veto Warnings" - Shows warning if family member dislikes a meal
 * 2. DRAG-AND-DROP - Two types supported:
 *    a) Recipe drops from RecipeBox (adds new meal)
 *    b) Meal moves within the grid (rearranges existing meals)
 * 
 * HOW DROP HANDLING WORKS:
 * 1. onDragOver - Must call preventDefault() to allow drop
 * 2. onDrop - Parses data and checks 'type' field:
 *    - type: 'meal' -> Call onMealMove (move existing meal)
 *    - no type -> Call onRecipeDrop (add from recipe box)
 * 3. Visual feedback shows which cell is the drop target
 */

import React, { useState } from 'react';
import { Box, Typography, Paper, Tooltip } from '@mui/material';
import { format, startOfWeek, addDays, isSameDay } from 'date-fns';
import WarningIcon from '@mui/icons-material/Warning';
import MealCell from './MealCell';
import { useMealCategories } from './useMealCategories';
import { useMeals } from './useMeals';
import { useRecipePreferences } from './contexts/RecipePreferencesContext';
import { useUser } from '../users/useUser';

/**
 * MealPlanGrid Component
 * 
 * @param {Function} onCellTap - Called when empty cell is tapped
 * @param {Function} onMealTap - Called when meal is tapped
 * @param {Function} onRecipeDrop - Called when recipe is dropped (dateKey, categoryId, recipe)
 * @param {Function} onMealMove - Called when meal is moved (sourceDateKey, sourceCategoryId, targetDateKey, targetCategoryId, meal)
 */
const MealPlanGrid = ({ onCellTap, onMealTap, onRecipeDrop, onMealMove }) => {
    const { visibleCategories } = useMealCategories();
    const { getMealsForDate } = useMeals();
    const { getDislikers } = useRecipePreferences();
    const { users } = useUser();
    const weekStart = startOfWeek(new Date());
    const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

    /**
     * Track which cell is currently being dragged over
     * 
     * JUNIOR DEV NOTE: We use this state to show visual feedback.
     * Format: "categoryId-dateKey" or null if not dragging over any cell.
     */
    const [dragOverCell, setDragOverCell] = useState(null);

    /**
     * Get names of users who dislike a meal (for veto warning tooltip)
     */
    const getVetoWarning = (mealId) => {
        const dislikerIds = getDislikers(mealId);
        if (dislikerIds.length === 0) return null;

        const names = dislikerIds
            .map(id => users?.find(u => u.id === id)?.name || 'Someone')
            .join(', ');
        return names;
    };

    /**
     * Handle drag over - MUST prevent default to allow drop
     * 
     * JUNIOR DEV NOTE: The browser's default behavior is to NOT allow drops.
     * We must call preventDefault() to override this.
     */
    const handleDragOver = (e, dateKey, categoryId) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
        setDragOverCell(`${categoryId}-${dateKey}`);
    };

    /**
     * Handle drag leave - clear visual feedback
     */
    const handleDragLeave = () => {
        setDragOverCell(null);
    };

    /**
     * Handle drop - parse data and route to appropriate handler
     * 
     * JUNIOR DEV NOTE: We check the 'type' field to determine what was dropped:
     * - type: 'meal' = An existing meal being moved (has source location)
     * - no type = A recipe from RecipeBox (new meal to add)
     */
    const handleDrop = (e, dateKey, categoryId) => {
        e.preventDefault();
        setDragOverCell(null);

        try {
            const rawData = e.dataTransfer.getData('application/json');
            if (!rawData) return;

            const data = JSON.parse(rawData);

            // Check if this is a meal move (has source location)
            if (data.type === 'meal') {
                console.log('DROP (Meal Move):', {
                    source: `${data.sourceDateKey}/${data.sourceCategoryId}`,
                    target: `${dateKey}/${categoryId}`,
                    meal: data.meal
                });

                // Don't move to the same cell
                if (data.sourceDateKey === dateKey && data.sourceCategoryId === categoryId) {
                    console.log('Aborting move: source === target');
                    return;
                }
                // Call move handler: source -> target
                onMealMove?.(
                    data.sourceDateKey,
                    data.sourceCategoryId,
                    dateKey,
                    categoryId,
                    data.meal
                );
            } else {
                console.log('DROP (Recipe):', data);
                // Recipe drop from RecipeBox
                onRecipeDrop?.(dateKey, categoryId, data);
            }
        } catch (err) {
            console.error('Failed to parse dropped data:', err);
        }
    };

    return (
        <Box sx={{ flex: 1, overflow: 'auto' }}>
            {/* Day Headers Row */}
            <Box sx={{ display: 'grid', gridTemplateColumns: '60px repeat(7, 1fr)', gap: 0.5, mb: 0.5 }}>
                <Box />
                {days.map((day) => {
                    const isToday = isSameDay(day, new Date());
                    return (
                        <Box key={day.toString()} sx={{ textAlign: 'center', py: 1 }}>
                            <Typography variant="caption" color="text.secondary">{format(day, 'EEE')}</Typography>
                            <Typography variant="body2" fontWeight={isToday ? 'bold' : 'normal'}
                                sx={{
                                    bgcolor: isToday ? '#FF6B35' : 'transparent', color: isToday ? '#fff' : 'inherit',
                                    borderRadius: '50%', width: 28, height: 28, display: 'inline-flex',
                                    alignItems: 'center', justifyContent: 'center', mx: 'auto'
                                }}>
                                {format(day, 'd')}
                            </Typography>
                        </Box>
                    );
                })}
            </Box>

            {/* Category Rows */}
            {visibleCategories.map((cat) => (
                <Box key={cat.id} sx={{ display: 'grid', gridTemplateColumns: '60px repeat(7, 1fr)', gap: 0.5, mb: 0.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Typography variant="caption" sx={{
                            writingMode: 'vertical-rl', transform: 'rotate(180deg)',
                            fontWeight: 600, color: cat.color
                        }}>
                            {cat.name}
                        </Typography>
                    </Box>
                    {days.map((day) => {
                        const dateKey = format(day, 'yyyy-MM-dd');
                        const dayMeals = getMealsForDate(dateKey);
                        const cellMeals = dayMeals[cat.id] || [];

                        // Check for veto warnings on this cell's meals
                        const vetoNames = cellMeals.length > 0 ? getVetoWarning(cellMeals[0].id) : null;

                        // Check if this cell is currently a drop target
                        const isDragTarget = dragOverCell === `${cat.id}-${dateKey}`;

                        return (
                            <Paper
                                key={`${cat.id}-${dateKey}`}
                                elevation={isDragTarget ? 4 : 0}
                                onDragOver={(e) => handleDragOver(e, dateKey, cat.id)}
                                onDragLeave={handleDragLeave}
                                onDrop={(e) => handleDrop(e, dateKey, cat.id)}
                                sx={{
                                    borderRadius: 1,
                                    minHeight: 80,
                                    bgcolor: isDragTarget ? 'primary.light' : '#FFFFFF',
                                    position: 'relative',
                                    border: vetoNames
                                        ? '2px solid #ff9800'
                                        : isDragTarget
                                            ? '2px dashed'
                                            : '1px solid #f0f0f0',
                                    borderColor: isDragTarget ? 'primary.main' : undefined,
                                    transition: 'all 0.2s ease',
                                    transform: isDragTarget ? 'scale(1.02)' : 'none',
                                }}
                            >
                                {/* Veto Warning Icon */}
                                {vetoNames && (
                                    <Tooltip title={`${vetoNames} dislike${vetoNames.includes(',') ? '' : 's'} this meal`}>
                                        <WarningIcon sx={{
                                            position: 'absolute', top: 4, right: 4,
                                            fontSize: 16, color: '#ff9800', cursor: 'help'
                                        }} />
                                    </Tooltip>
                                )}
                                <MealCell
                                    meals={cellMeals}
                                    categoryColor={cat.color}
                                    dateKey={dateKey}
                                    categoryId={cat.id}
                                    onTap={() => cellMeals.length > 0 ? onMealTap?.(cellMeals[0], dateKey, cat.id) : onCellTap?.(dateKey, cat.id)}
                                    onLongPress={() => onCellTap?.(dateKey, cat.id)}
                                />
                            </Paper>
                        );
                    })}
                </Box>
            ))}
        </Box>
    );
};

export default MealPlanGrid;
