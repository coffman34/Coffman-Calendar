import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, Paper, Chip } from '@mui/material';
import { format, startOfDay, addDays, addHours, isSameDay } from 'date-fns';
import EventCard from './EventCard';
import EventDetailPopup from './EventDetailPopup';
import { useMeals } from '../meals/useMeals';
import { useMealCategories } from '../meals/useMealCategories';

const HOURS = Array.from({ length: 24 }, (_, i) => i);

const ScheduleView = ({ currentDate, onEditEvent, onDeleteEvent }) => {
    const { getMealsForDate } = useMeals();
    const { visibleCategories } = useMealCategories();
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [hourHeight, setHourHeight] = useState(50); // Pinch to change this
    const containerRef = useRef(null);

    // Number of days to show (responsive)
    const daysToShow = 5;
    const days = Array.from({ length: daysToShow }, (_, i) => addDays(currentDate, i));

    // Update time indicator every minute
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    // Pinch-to-zoom handler for touch devices
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        let initialDistance = 0;
        let initialHourHeight = hourHeight;

        const handleTouchStart = (e) => {
            if (e.touches.length === 2) {
                const dx = e.touches[0].clientX - e.touches[1].clientX;
                const dy = e.touches[0].clientY - e.touches[1].clientY;
                initialDistance = Math.hypot(dx, dy);
                initialHourHeight = hourHeight;
            }
        };

        const handleTouchMove = (e) => {
            if (e.touches.length === 2) {
                const dx = e.touches[0].clientX - e.touches[1].clientX;
                const dy = e.touches[0].clientY - e.touches[1].clientY;
                const distance = Math.hypot(dx, dy);
                const scale = distance / initialDistance;
                const newHeight = Math.min(100, Math.max(30, initialHourHeight * scale));
                setHourHeight(newHeight);
            }
        };

        container.addEventListener('touchstart', handleTouchStart);
        container.addEventListener('touchmove', handleTouchMove);
        return () => {
            container.removeEventListener('touchstart', handleTouchStart);
            container.removeEventListener('touchmove', handleTouchMove);
        };
    }, [hourHeight]);

    const timeBarTop = (currentTime.getHours() + currentTime.getMinutes() / 60) * hourHeight;

    return (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Day Headers */}
            <Box sx={{ display: 'flex', borderBottom: '1px solid #eee' }}>
                <Box sx={{ width: 50 }} /> {/* Time column spacer */}
                {days.map((day) => {
                    const isToday = isSameDay(day, new Date());
                    return (
                        <Box key={day.toString()} sx={{ flex: 1, p: 1, textAlign: 'center', borderLeft: '1px solid #eee' }}>
                            <Typography variant="caption" color="text.secondary">{format(day, 'EEE')}</Typography>
                            <Typography
                                variant="body1"
                                fontWeight={isToday ? 'bold' : 'normal'}
                                sx={{
                                    color: isToday ? '#fff' : 'text.primary',
                                    bgcolor: isToday ? '#FF6B35' : 'transparent',
                                    borderRadius: '50%',
                                    width: 32,
                                    height: 32,
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                {format(day, 'd')}
                            </Typography>
                        </Box>
                    );
                })}
            </Box>

            {/* Meal Row */}
            <Box sx={{ display: 'flex', borderBottom: '1px solid #eee', bgcolor: 'rgba(255,152,0,0.03)' }}>
                <Box sx={{ width: 50, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Typography variant="caption" color="warning.main" sx={{ fontSize: 10 }}>🍽️</Typography>
                </Box>
                {days.map((day) => {
                    const dateKey = format(day, 'yyyy-MM-dd');
                    const dayMeals = getMealsForDate(dateKey);
                    const allMeals = visibleCategories.flatMap(cat =>
                        (dayMeals[cat.id] || []).map(m => ({ ...m, color: cat.color }))
                    );
                    return (
                        <Box key={`meals-${dateKey}`} sx={{ flex: 1, p: 0.5, borderLeft: '1px solid #eee', display: 'flex', flexWrap: 'wrap', gap: 0.25 }}>
                            {allMeals.slice(0, 3).map((meal) => (
                                <Chip key={meal.id} label={meal.name} size="small"
                                    sx={{ height: 18, fontSize: '0.65rem', bgcolor: meal.color, '& .MuiChip-label': { px: 0.5 } }} />
                            ))}
                            {allMeals.length > 3 && <Typography variant="caption" color="text.secondary">+{allMeals.length - 3}</Typography>}
                        </Box>
                    );
                })}
            </Box>

            {/* Time Grid with pinch-to-zoom */}
            <Box ref={containerRef} sx={{ flex: 1, overflow: 'auto', position: 'relative' }}>
                {/* Orange time bar for today column */}
                {days.some((d) => isSameDay(d, new Date())) && (
                    <Box sx={{
                        position: 'absolute',
                        left: 50 + days.findIndex((d) => isSameDay(d, new Date())) * (100 / daysToShow) + '%',
                        width: `${100 / daysToShow}%`,
                        top: timeBarTop,
                        height: 2,
                        bgcolor: '#FF6B35',
                        zIndex: 10,
                    }} />
                )}

                {HOURS.map((hour) => (
                    <Box key={hour} sx={{ display: 'flex', height: hourHeight }}>
                        <Box sx={{ width: 50, pr: 0.5, textAlign: 'right', pt: 0.5 }}>
                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: 10 }}>
                                {format(addHours(startOfDay(currentDate), hour), 'ha')}
                            </Typography>
                        </Box>
                        {days.map((day) => (
                            <Box key={day.toString()} sx={{ flex: 1, borderLeft: '1px solid #f0f0f0', borderBottom: '1px solid #f5f5f5' }} />
                        ))}
                    </Box>
                ))}
            </Box>

            <EventDetailPopup
                event={selectedEvent}
                open={!!selectedEvent}
                onClose={() => setSelectedEvent(null)}
                onEdit={(e) => { setSelectedEvent(null); onEditEvent?.(e); }}
                onDelete={(e) => { setSelectedEvent(null); onDeleteEvent?.(e); }}
            />
        </Box>
    );
};

export default ScheduleView;
