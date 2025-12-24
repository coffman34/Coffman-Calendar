import React from 'react';
import { Paper, Box, Typography, Chip, IconButton } from '@mui/material';

// Color tag mapping (matches Google Calendar colorId)
const COLOR_TAGS = {
    1: { bg: '#a4bdfc', name: 'Lavender' },
    2: { bg: '#7ae7bf', name: 'Sage' },
    3: { bg: '#dbadff', name: 'Grape' },
    4: { bg: '#ff887c', name: 'Flamingo' },
    5: { bg: '#fbd75b', name: 'Banana' },
    6: { bg: '#ffb878', name: 'Tangerine' },
    7: { bg: '#46d6db', name: 'Peacock' },
    8: { bg: '#e1e1e1', name: 'Graphite' },
    9: { bg: '#5484ed', name: 'Blueberry' },
    10: { bg: '#51b749', name: 'Basil' },
    11: { bg: '#dc2127', name: 'Tomato' }
};

const getEventColor = (colorId) => COLOR_TAGS[colorId]?.bg || COLOR_TAGS[1].bg;

const EventCard = ({ event, onClick }) => {
    const bgColor = getEventColor(event.colorId || 1);

    return (
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Paper
                elevation={3}
                onClick={(e) => onClick && onClick(event, e)}
                sx={{
                    p: 1.5,
                    mb: 1,
                    backgroundColor: bgColor,
                    borderRadius: 2,
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    transition: 'box-shadow 0.2s ease, transform 0.2s ease',
                    '&:hover': {
                        boxShadow: '0 6px 20px rgba(0,0,0,0.2)',
                        transform: 'translateY(-2px)'
                    }
                }}
            >
                <Box display="flex" alignItems="center" gap={0.5}>
                    {event.emoji && <span>{event.emoji}</span>}
                    <Typography variant="body2" fontWeight={600} noWrap>{event.summary}</Typography>
                </Box>
                {event.time && <Typography variant="caption" color="text.secondary">{event.time}</Typography>}
            </Paper>
        </motion.div>
    );
};

export { COLOR_TAGS };
export default EventCard;
