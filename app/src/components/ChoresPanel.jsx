import React, { useState } from 'react';
import { Box, Typography, Checkbox, Paper, Chip } from '@mui/material';
import { format } from 'date-fns';

// Demo chores - daily reset
const DAILY_CHORES = [
    { id: 1, name: 'Make bed', emoji: '🛏️' },
    { id: 2, name: 'Brush teeth', emoji: '🪥' },
    { id: 3, name: 'Clean room', emoji: '🧹' },
    { id: 4, name: 'Do homework', emoji: '📚' },
    { id: 5, name: 'Feed pets', emoji: '🐕' },
];

const ChoresPanel = () => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const [completedChores, setCompletedChores] = useState({});
    const [lastResetDate, setLastResetDate] = useState(today);

    // Reset chores daily - Adjust state when day changes
    if (lastResetDate !== today) {
        setCompletedChores({});
        setLastResetDate(today);
    }

    const toggleChore = (id) => {
        setCompletedChores(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const isOverdue = (choreId) => {
        const now = new Date();
        return now.getHours() >= 20 && !completedChores[choreId]; // After 8pm
    };

    return (
        <Box sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
                Daily Chores
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 2 }}>
                {format(new Date(), 'EEEE, MMM d')}
            </Typography>

            <Box sx={{ flex: 1, overflowY: 'auto' }}>
                {DAILY_CHORES.map(chore => (
                    <ChoreItem
                        key={chore.id}
                        chore={chore}
                        completed={!!completedChores[chore.id]}
                        overdue={isOverdue(chore.id)}
                        onToggle={() => toggleChore(chore.id)}
                    />
                ))}
            </Box>
        </Box>
    );
};

const ChoreItem = ({ chore, completed, overdue, onToggle }) => (
    <Paper
        elevation={0}
        onClick={onToggle}
        sx={{
            p: 1.5, mb: 1, display: 'flex', alignItems: 'center', gap: 1,
            bgcolor: completed ? 'rgba(76,175,80,0.1)' : overdue ? 'rgba(244,67,54,0.1)' : 'white',
            border: overdue ? '2px solid #f44336' : '1px solid #eee',
            borderRadius: 2, cursor: 'pointer',
            '&:active': { transform: 'scale(0.98)' },
        }}
    >
        <Checkbox checked={completed} sx={{ p: 0.5 }} />
        <Typography sx={{ fontSize: '1.5rem' }}>{chore.emoji}</Typography>
        <Typography sx={{ flex: 1, textDecoration: completed ? 'line-through' : 'none', opacity: completed ? 0.6 : 1 }}>
            {chore.name}
        </Typography>
        {overdue && <Chip label="OVERDUE" size="small" color="error" />}
    </Paper>
);

export default ChoresPanel;
