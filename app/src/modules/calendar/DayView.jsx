import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, IconButton } from '@mui/material';
import { format, isSameDay, startOfDay, addHours } from 'date-fns';
import AddIcon from '@mui/icons-material/Add';
import EventCard from './EventCard';
import EventDetailPopup from './EventDetailPopup';

const HOUR_HEIGHT = 60; // pixels per hour
const HOURS = Array.from({ length: 24 }, (_, i) => i);

const DayView = ({ currentDate, events = [], onAddEvent, onEditEvent }) => {
    const [currentTime, setCurrentTime] = useState(new Date());

    // Update time indicator every minute
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    const dayEvents = events.filter(e => isSameDay(e.date, currentDate));
    const isToday = isSameDay(currentDate, new Date());

    // Calculate time bar position
    const timeBarTop = (currentTime.getHours() + currentTime.getMinutes() / 60) * HOUR_HEIGHT;

    return (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Day Header */}
            <Box sx={{ p: 2, borderBottom: '1px solid #eee', display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{
                    bgcolor: isToday ? '#FF6B35' : 'grey.200',
                    color: isToday ? '#fff' : 'text.primary',
                    borderRadius: '50%',
                    width: 48,
                    height: 48,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}>
                    <Typography variant="h5" fontWeight="bold">{format(currentDate, 'd')}</Typography>
                </Box>
                <Box>
                    <Typography variant="h6" fontWeight="bold">{format(currentDate, 'EEEE')}</Typography>
                    <Typography variant="body2" color="text.secondary">{format(currentDate, 'MMMM yyyy')}</Typography>
                </Box>
            </Box>

            {/* Time Grid */}
            <Box
                sx={{ flex: 1, overflow: 'auto', position: 'relative', cursor: 'pointer' }}
                onClick={(e) => {
                    if (e.target === e.currentTarget) {
                        onAddEvent?.(currentDate);
                    }
                }}
            >
                {/* Orange time bar for today */}
                {isToday && (
                    <Box sx={{
                        position: 'absolute',
                        left: 60,
                        right: 0,
                        top: timeBarTop,
                        height: 2,
                        bgcolor: '#FF6B35',
                        zIndex: 10,
                        pointerEvents: 'none',
                        '&::before': {
                            content: '""',
                            position: 'absolute',
                            left: -6,
                            top: -4,
                            width: 10,
                            height: 10,
                            borderRadius: '50%',
                            bgcolor: '#FF6B35',
                        }
                    }} />
                )}

                {HOURS.map(hour => (
                    <Box key={hour} sx={{ display: 'flex', height: HOUR_HEIGHT, borderBottom: '1px solid #f0f0f0' }}>
                        <Box sx={{ width: 60, pr: 1, textAlign: 'right', pt: 0.5 }}>
                            <Typography variant="caption" color="text.secondary">
                                {format(addHours(startOfDay(currentDate), hour), 'h a')}
                            </Typography>
                        </Box>
                        <Box sx={{ flex: 1, position: 'relative', borderLeft: '1px solid #eee' }} />
                    </Box>
                ))}

                {/* Events positioned by time */}
                {dayEvents.filter(e => !e.isAllDay && e.startTime).map(event => {
                    const [h, m] = (event.startTime || '00:00').split(':').map(Number);
                    const top = (h + m / 60) * HOUR_HEIGHT;
                    return (
                        <Box
                            key={event.id}
                            sx={{ position: 'absolute', left: 65, right: 8, top }}
                            onClick={(e) => {
                                e.stopPropagation();
                                onEditEvent?.(event);
                            }}
                        >
                            <EventCard
                                event={event}
                                onClick={(event, e) => {
                                    if (e && typeof e.stopPropagation === 'function') e.stopPropagation();
                                    onEditEvent?.(event);
                                }}
                            />
                        </Box>
                    );
                })}
            </Box>

            {/* Add Event */}
            <Box sx={{ p: 1, borderTop: '1px solid #eee', textAlign: 'center' }}>
                <IconButton color="primary" onClick={() => onAddEvent?.(currentDate)}><AddIcon /></IconButton>
            </Box>
        </Box>
    );
};

export default DayView;
