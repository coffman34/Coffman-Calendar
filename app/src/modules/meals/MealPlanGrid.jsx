import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { format, startOfWeek, addDays, isSameDay } from 'date-fns';
import MealCell from './MealCell';
import { useMealCategories } from './useMealCategories';
import { useMeals } from './useMeals';

const MealPlanGrid = ({ onCellTap, onMealTap }) => {
    const { visibleCategories } = useMealCategories();
    const { getMealsForDate } = useMeals();
    const weekStart = startOfWeek(new Date());
    const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

    return (
        <Box sx={{ flex: 1, overflow: 'auto' }}>
            {/* Day Headers Row */}
            <Box sx={{ display: 'grid', gridTemplateColumns: '60px repeat(7, 1fr)', gap: 0.5, mb: 0.5 }}>
                <Box /> {/* Empty corner cell */}
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
                    {/* Category Label */}
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Typography variant="caption" sx={{
                            writingMode: 'vertical-rl', transform: 'rotate(180deg)',
                            fontWeight: 600, color: cat.color
                        }}>
                            {cat.name}
                        </Typography>
                    </Box>
                    {/* Day Cells for this category */}
                    {days.map((day) => {
                        const dateKey = format(day, 'yyyy-MM-dd');
                        const dayMeals = getMealsForDate(dateKey);
                        const cellMeals = dayMeals[cat.id] || [];
                        return (
                            <Paper key={`${cat.id}-${dateKey}`} elevation={0}
                                sx={{ borderRadius: 1, border: '1px solid #f0f0f0', minHeight: 80, bgcolor: '#fafafa' }}>
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
