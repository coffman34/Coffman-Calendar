import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { format, startOfWeek, addDays, addWeeks, isSameDay } from 'date-fns';
import DayColumn from './DayColumn';
import AddEventDialog from './AddEventDialog';

const WeeklyView = ({ currentDate = new Date(), events = [], onAddEvent, onEditEvent }) => {
    const weekStart = startOfWeek(currentDate);
    const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
    const nextWeekStart = addWeeks(weekStart, 1);
    const nextWeekDays = Array.from({ length: 7 }, (_, i) => addDays(nextWeekStart, i));

    const allEvents = events;

    return (
        <Box sx={{ display: 'flex', height: '100%', overflow: 'hidden', position: 'relative' }}>
            {days.map(day => (
                <DayColumn
                    key={day.toString()}
                    day={day}
                    events={allEvents}
                    onAddEvent={onAddEvent}
                    onEditEvent={onEditEvent}
                />
            ))}
            <Paper elevation={3} sx={{
                minWidth: 160,
                display: 'flex',
                flexDirection: 'column',
                bgcolor: '#fafafa',
                borderRadius: 2,
                ml: 1,
                boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                overflow: 'hidden'
            }}>
                <Box sx={{ p: 1, textAlign: 'center', borderBottom: '1px solid #eee', bgcolor: '#fff' }}>
                    <Typography variant="subtitle2" fontWeight="bold">Next Week</Typography>
                    <Typography variant="caption" color="text.secondary">
                        {format(nextWeekStart, 'MMM d')} - {format(addDays(nextWeekStart, 6), 'd')}
                    </Typography>
                </Box>
                <Box sx={{ flex: 1, overflowY: 'auto', p: 1 }}>
                    {nextWeekDays.map(day => {
                        const dayEvents = allEvents.filter(e => isSameDay(e.date, day));
                        if (dayEvents.length === 0) return null;
                        return (
                            <Box key={day.toString()} sx={{ mb: 2 }}>
                                <Typography variant="caption" fontWeight="bold" color="primary" sx={{ display: 'block', mb: 0.5, borderBottom: '1px solid #ddd' }}>
                                    {format(day, 'EEE d')}
                                </Typography>
                                {dayEvents.map(event => (
                                    <Box
                                        key={event.id}
                                        onClick={() => onEditEvent?.(event)}
                                        sx={{
                                            p: 1,
                                            mb: 0.5,
                                            borderRadius: 1,
                                            bgcolor: '#fff',
                                            borderLeft: '3px solid',
                                            borderColor: event.colorId ? `#${['a4bdfc', '7ae7bf', 'dbadff', 'ff887c', 'fbd75b'][event.colorId % 5]}` : 'primary.main',
                                            cursor: 'pointer',
                                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                            transition: 'box-shadow 0.2s ease, transform 0.2s ease',
                                            '&:hover': {
                                                bgcolor: '#f5f5f5',
                                                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                                transform: 'translateY(-1px)'
                                            }
                                        }}
                                    >
                                        <Typography variant="caption" sx={{ fontWeight: 500, display: 'block', lineHeight: 1.2 }}>
                                            {event.emoji} {event.summary}
                                        </Typography>
                                        {event.startTime && (
                                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                                                {event.startTime}
                                            </Typography>
                                        )}
                                    </Box>
                                ))}
                            </Box>
                        );
                    })}
                    {!nextWeekDays.some(day => allEvents.some(e => isSameDay(e.date, day))) && (
                        <Typography variant="body2" color="text.disabled" sx={{ textAlign: 'center', mt: 4 }}>
                            No events scheduled
                        </Typography>
                    )}
                </Box>
            </Paper>
        </Box>
    );
};

export default WeeklyView;
