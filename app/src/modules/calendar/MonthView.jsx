import React from 'react';
import { Box, Typography, Paper, IconButton } from '@mui/material';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay } from 'date-fns';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const MonthView = ({ currentDate, events = [], onDayClick, onAddEvent }) => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const calendarStart = startOfWeek(monthStart);
    const calendarEnd = endOfWeek(monthEnd);

    // Build array of weeks
    const weeks = [];
    let day = calendarStart;
    while (day <= calendarEnd) {
        const week = [];
        for (let i = 0; i < 7; i++) {
            week.push(day);
            day = addDays(day, 1);
        }
        weeks.push(week);
    }

    const getEventsForDay = (day) => events.filter(e => isSameDay(e.date, day));

    return (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', p: 2 }}>
            {/* Weekday Headers */}
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', mb: 1 }}>
                {WEEKDAYS.map(wd => (
                    <Typography key={wd} variant="caption" fontWeight="bold" textAlign="center" color="text.secondary">
                        {wd}
                    </Typography>
                ))}
            </Box>

            {/* Calendar Grid */}
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                {weeks.map((week, wi) => (
                    <Box key={wi} sx={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', minHeight: 80 }}>
                        {week.map((d) => {
                            const isCurrentMonth = isSameMonth(d, currentDate);
                            const isToday = isSameDay(d, new Date());
                            const dayEvents = getEventsForDay(d);

                            return (
                                <Paper
                                    key={d.toString()}
                                    elevation={0}
                                    onClick={() => onAddEvent?.(d)}
                                    sx={{
                                        p: 0.5,
                                        m: 0.25,
                                        borderRadius: 1,
                                        cursor: 'pointer',
                                        bgcolor: isCurrentMonth ? 'background.paper' : 'grey.50',
                                        opacity: isCurrentMonth ? 1 : 0.5,
                                        border: '1px solid',
                                        borderColor: isToday ? 'primary.main' : 'divider',
                                        '&:hover': { bgcolor: 'action.hover' },
                                    }}
                                >
                                    <Box sx={{ display: 'flex', justifyContent: 'center', mb: 0.5 }}>
                                        <Typography
                                            variant="body2"
                                            fontWeight={isToday ? 'bold' : 'normal'}
                                            onClick={(e) => {
                                                e.stopPropagation(); // Don't trigger add event
                                                onDayClick?.(d);
                                            }}
                                            sx={{
                                                color: isToday ? '#fff' : 'text.primary',
                                                bgcolor: isToday ? 'primary.main' : 'transparent',
                                                borderRadius: '50%',
                                                width: 28,
                                                height: 28,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                '&:hover': { opacity: 0.8 }
                                            }}
                                        >
                                            {format(d, 'd')}
                                        </Typography>
                                    </Box>
                                    {/* Event dots */}
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 0.25 }}>
                                        {dayEvents.slice(0, 3).map((e, idx) => (
                                            <Box key={idx} sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: e.colorId ? `#${['a4bdfc', '7ae7bf', 'dbadff', 'ff887c', 'fbd75b'][e.colorId % 5]}` : 'primary.main' }} />
                                        ))}
                                        {dayEvents.length > 3 && (
                                            <Typography variant="caption" sx={{ fontSize: 8 }}>+{dayEvents.length - 3}</Typography>
                                        )}
                                    </Box>
                                </Paper>
                            );
                        })}
                    </Box>
                ))}
            </Box>
        </Box>
    );
};

export default MonthView;
