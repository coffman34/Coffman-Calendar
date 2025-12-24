import React from 'react';
import { Box, Typography } from '@mui/material';

const MealCell = ({ meals = [], categoryColor, onTap, onLongPress }) => {
    const handleContextMenu = (e) => {
        e.preventDefault();
        onLongPress?.();
    };

    if (meals.length === 0) {
        return (
            <Box
                onClick={onTap}
                sx={{
                    height: '100%',
                    minHeight: 60,
                    cursor: 'pointer',
                    '&:hover': { bgcolor: 'rgba(0,0,0,0.02)' },
                }}
            />
        );
    }

    return (
        <Box
            onClick={onTap}
            onContextMenu={handleContextMenu}
            sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, p: 0.5 }}
        >
            {meals.map((meal) => (
                <Box
                    key={meal.id}
                    sx={{
                        bgcolor: categoryColor || '#e0e0e0',
                        borderRadius: 1,
                        p: 1,
                        cursor: 'pointer',
                        minHeight: 40,
                    }}
                >
                    <Typography variant="caption" sx={{ fontWeight: 500, fontSize: '0.75rem' }}>
                        {meal.name}
                    </Typography>
                </Box>
            ))}
        </Box>
    );
};

export default MealCell;
