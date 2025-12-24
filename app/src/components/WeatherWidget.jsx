import React from 'react';
import { Box, Typography } from '@mui/material';
import WbSunnyIcon from '@mui/icons-material/WbSunny';

// Placeholder weather widget - will connect to API later
const WeatherWidget = () => {
    const temp = 66; // Placeholder
    const condition = 'Sunny';

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                p: 2,
                bgcolor: 'rgba(255, 193, 7, 0.1)',
                borderRadius: 3,
                mb: 2,
            }}
        >
            <WbSunnyIcon sx={{ fontSize: 48, color: '#FFC107', mb: 1 }} />
            <Typography variant="h3" fontWeight="bold">
                {temp}°F
            </Typography>
            <Typography variant="body2" color="text.secondary">
                {condition}
            </Typography>
        </Box>
    );
};

export default WeatherWidget;
