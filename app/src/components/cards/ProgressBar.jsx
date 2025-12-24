import React from 'react';
import { Box } from '@mui/material';

const ProgressBar = ({ progress = 0, variant = 'white' }) => {
    const isOnGradient = variant !== 'white';

    return (
        <Box
            sx={{
                width: '100%',
                height: 6,
                borderRadius: 3,
                bgcolor: isOnGradient ? 'rgba(255,255,255,0.3)' : 'rgba(139,92,246,0.2)',
                overflow: 'hidden',
                mt: 2,
            }}
        >
            <Box
                sx={{
                    width: `${Math.min(100, Math.max(0, progress))}%`,
                    height: '100%',
                    borderRadius: 3,
                    bgcolor: isOnGradient ? '#FFFFFF' : 'primary.main',
                    transition: 'width 0.3s ease',
                }}
            />
        </Box>
    );
};

export default ProgressBar;
