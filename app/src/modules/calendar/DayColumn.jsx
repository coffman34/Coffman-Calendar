import React, { useState } from 'react';
import { Box, Typography, IconButton, Paper } from '@mui/material';
import { format, isSameDay } from 'date-fns';
import AddIcon from '@mui/icons-material/Add';
import EventCard from './EventCard';
import MealSection from './MealSection';
import WeatherSection from './WeatherSection';
import EventDetailPopup from './EventDetailPopup';

const DayColumn = ({ day, events, onAddEvent, onEditEvent, onDeleteEvent }) => {
    const [selectedEvent, setSelectedEvent] = useState(null);
    const dayEvents = events.filter(e => isSameDay(e.date, day));
    const isToday = isSameDay(day, new Date());
    const dateKey = format(day, 'yyyy-MM-dd');

    return (
        <Paper
            elevation={isToday ? 4 : 1}
            sx={{
                flex: 1,
                minWidth: 140,
                display: 'flex',
                flexDirection: 'column',
                // JUNIOR DEV NOTE: Explicit white ensures contrast against
                // themed parent cards (which may be pink, blue, etc.)
                bgcolor: '#FFFFFF',
                borderRadius: 2,
                m: 1, // Increased gutter (8px) per user request
                overflow: 'hidden',
                border: isToday ? '2px solid #FF6B35' : '1px solid rgba(0,0,0,0.08)',
                position: 'relative',
                zIndex: isToday ? 1 : 0,
                transition: 'all 0.3s ease',
                boxShadow: isToday ? '0 4px 16px rgba(255,107,53,0.2)' : '0 2px 8px rgba(0,0,0,0.06)',
                '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 20px rgba(0,0,0,0.1)'
                }
            }}
        >
            {/* Day Header */}
            <Box sx={{ p: 1, borderBottom: '1px solid #eee', textAlign: 'center' }}>
                <Typography variant="subtitle2" fontWeight="bold">
                    {format(day, 'EEE')}
                    <Typography component="span" variant="caption" sx={{ ml: 0.5, opacity: 0.7 }}>
                        {dayEvents.length} events
                    </Typography>
                </Typography>
                <Box sx={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Typography variant="h6" fontWeight={isToday ? 'bold' : 'normal'}
                        sx={{
                            color: isToday ? '#fff' : 'text.primary', bgcolor: isToday ? '#FF6B35' : 'transparent',
                            borderRadius: '50%', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                        {format(day, 'd')}
                    </Typography>
                </Box>
            </Box>

            {/* Meal Planner - now uses context internally */}
            <MealSection day={dateKey} />

            {/* Events */}
            <Box
                sx={{ flex: 1, p: 1, overflowY: 'auto', cursor: 'pointer' }}
                onClick={() => onAddEvent(day)}
            >
                {dayEvents.map(event => (
                    <EventCard
                        key={event.id}
                        event={event}
                        onClick={(event, ev) => {
                            // Don't trigger the background click
                            if (ev && typeof ev.stopPropagation === 'function') ev.stopPropagation();
                            setSelectedEvent(event);
                        }}
                    />
                ))}
            </Box>

            {/* Weather Forecast at bottom */}
            <WeatherSection day={dateKey} />

            {/* Event Detail Popup */}
            <EventDetailPopup event={selectedEvent} open={!!selectedEvent} onClose={() => setSelectedEvent(null)}
                onEdit={(e) => { setSelectedEvent(null); onEditEvent(e); }}
                onDelete={(e) => { setSelectedEvent(null); onDeleteEvent(e); }} />
        </Paper>
    );
};

export default DayColumn;
