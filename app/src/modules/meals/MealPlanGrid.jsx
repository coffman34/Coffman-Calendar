/**
 * @fileoverview Weekly Meal Planning Grid
 * @module modules/meals/MealPlanGrid
 * 
 * JUNIOR DEV NOTE: This displays a 7-day grid with meal categories.
 * Now includes "Veto Warnings" - if any family member dislikes a
 * scheduled meal, a warning icon appears to alert the planner.
 */

import React from 'react';
import { Box, Typography, Paper, Tooltip } from '@mui/material';
import { format, startOfWeek, addDays, isSameDay } from 'date-fns';
import WarningIcon from '@mui/icons-material/Warning';
import MealCell from './MealCell';
import { useMealCategories } from './useMealCategories';
import { useMeals } from './useMeals';
import { useRecipePreferences } from './contexts/RecipePreferencesContext';
import { useUser } from '../users/useUser';

const MealPlanGrid = ({ onCellTap, onMealTap }) => {
    const { visibleCategories } = useMealCategories();
    const { getMealsForDate } = useMeals();
    const { getDislikers } = useRecipePreferences();
    const { users } = useUser();
    const weekStart = startOfWeek(new Date());
    const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

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

                        return (
                            <Paper key={`${cat.id}-${dateKey}`} elevation={0}
                                sx={{
                                    borderRadius: 1, minHeight: 80, bgcolor: '#fafafa', position: 'relative',
                                    border: vetoNames ? '2px solid #ff9800' : '1px solid #f0f0f0'
                                }}>
                                {/* Veto Warning Icon */}
                                {vetoNames && (
                                    <Tooltip title={`${vetoNames} dislike${vetoNames.includes(',') ? '' : 's'} this meal`}>
                                        <WarningIcon sx={{
                                            position: 'absolute', top: 4, right: 4,
                                            fontSize: 16, color: '#ff9800', cursor: 'help'
                                        }} />
                                    </Tooltip>
                                )}
                                <MealCell meals={cellMeals} categoryColor={cat.color}
                                    onTap={() => cellMeals.length > 0 ? onMealTap?.(cellMeals[0], dateKey, cat.id) : onCellTap?.(dateKey, cat.id)}
                                    onLongPress={() => onCellTap?.(dateKey, cat.id)} />
                            </Paper>
                        );
                    })}
                </Box>
            ))}
        </Box>
    );
};

export default MealPlanGrid;
