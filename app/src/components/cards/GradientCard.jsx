import React, { useState } from 'react';
import { Box, IconButton, Typography } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import CardSettingsPopover from './CardSettingsPopover';
import { gradientStyles } from './gradientStyles';

/**
 * GradientCard Component
 * 
 * A reusable card component with support for multiple gradient variants
 * and built-in settings popover.
 * 
 * WHY WE USE Box:
 * Using Box from MUI allows us to easily apply custom styles and responsive
 * padding/margin using sx props.
 */
const GradientCard = ({
    id,
    title,
    subtitle,
    variant = 'white',
    icon: Icon,
    children,
    onSettingsChange,
    showSettings = true,
    sx = {}
}) => {
    const [anchorEl, setAnchorEl] = useState(null);
    const style = gradientStyles[variant] || gradientStyles.white;

    const handleSettingsClick = (e) => {
        e.stopPropagation();
        setAnchorEl(e.currentTarget);
    };

    const handleSave = (newSettings) => {
        onSettingsChange?.(id, newSettings);
        setAnchorEl(null);
    };

    return (
        <Box
            sx={{
                ...style,
                borderRadius: '8px',
                padding: 2.5,
                boxShadow: '0 4px 16px rgba(0,0,0,0.05)',
                position: 'relative',
                height: '100%',
                ...sx,
            }}
        >
            {showSettings && (
                <IconButton
                    size="small"
                    onClick={handleSettingsClick}
                    sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        color: variant === 'white' ? 'text.secondary' : 'rgba(255,255,255,0.7)',
                        '&:hover': { color: variant === 'white' ? 'text.primary' : '#FFFFFF' },
                    }}
                >
                    <SettingsIcon fontSize="small" />
                </IconButton>
            )}

            {Icon && (
                <Box sx={{
                    width: 40, height: 40, borderRadius: '8px',
                    bgcolor: variant === 'white' ? 'primary.light' : 'rgba(255,255,255,0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2
                }}>
                    <Icon sx={{ color: variant === 'white' ? 'primary.main' : '#FFFFFF' }} />
                </Box>
            )}

            {title && (
                <Typography variant="h6" fontWeight={600} sx={{ mb: 0.5, pr: 4 }}>
                    {title}
                </Typography>
            )}
            {subtitle && (
                <Typography
                    variant="body2"
                    sx={{ opacity: variant === 'white' ? 1 : 0.8, color: variant === 'white' ? 'text.secondary' : 'inherit' }}
                >
                    {subtitle}
                </Typography>
            )}

            {children}

            <CardSettingsPopover
                anchorEl={anchorEl}
                onClose={() => setAnchorEl(null)}
                currentVariant={variant}
                currentTitle={title}
                onSave={handleSave}
            />
        </Box>
    );
};

export default GradientCard;
