import React from 'react';
import { Paper, Box, Typography } from '@mui/material';
import { useTheme } from '../theme/useTheme';

const AppCard = ({ title, children, action, gradient, sx = {} }) => {
    const { themeConfig } = useTheme();

    return (
        <Paper
            elevation={0}
            sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                borderRadius: `${themeConfig.borderRadius}px`,
                bgcolor: 'background.paper',
                border: '1px solid rgba(0,0,0,0.05)',
                boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                ...sx
            }}
        >
            {title && (
                <Box
                    sx={{
                        p: 3,
                        pb: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        background: gradient || 'transparent',
                        minHeight: 72, // Standardize header height preventing layout jumps
                    }}
                >
                    <Typography
                        variant="h6"
                        fontWeight="bold"
                        sx={{ color: gradient ? 'white' : 'text.primary' }}
                    >
                        {title}
                    </Typography>
                    {action && <Box>{action}</Box>}
                </Box>
            )}
            <Box sx={{ flexGrow: 1, overflow: 'auto', p: 0 }}>
                {children}
            </Box>
        </Paper>
    );
};

export default AppCard;
