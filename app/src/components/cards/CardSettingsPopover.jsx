import React, { useState } from 'react';
import { Popover, Box, Typography, ToggleButtonGroup, ToggleButton, TextField, Button } from '@mui/material';

const variantOptions = [
    { value: 'blue-purple', label: 'Blue-Purple', bg: 'linear-gradient(135deg, #60A5FA 0%, #8B5CF6 100%)' },
    { value: 'teal-green', label: 'Teal-Green', bg: 'linear-gradient(135deg, #34D399 0%, #059669 100%)' },
    { value: 'white', label: 'White', bg: '#FFFFFF' },
];

const CardSettingsPopover = ({ anchorEl, onClose, currentVariant, currentTitle, onSave }) => {
    const [variant, setVariant] = useState(currentVariant);
    const [title, setTitle] = useState(currentTitle || '');
    const [prevProps, setPrevProps] = useState({ currentVariant, currentTitle, anchorEl });

    // Adjust state during render if props change
    if (prevProps.currentVariant !== currentVariant ||
        prevProps.currentTitle !== currentTitle ||
        prevProps.anchorEl !== anchorEl) {
        setPrevProps({ currentVariant, currentTitle, anchorEl });
        setVariant(currentVariant);
        setTitle(currentTitle || '');
    }

    const handleSave = () => {
        onSave({ variant, title });
    };

    return (
        <Popover
            open={Boolean(anchorEl)}
            anchorEl={anchorEl}
            onClose={onClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
            <Box sx={{ p: 2, width: 260 }}>
                <Typography variant="subtitle2" sx={{ mb: 1.5 }}>Card Style</Typography>

                <ToggleButtonGroup
                    value={variant}
                    exclusive
                    onChange={(e, v) => v && setVariant(v)}
                    sx={{ mb: 2, display: 'flex', gap: 1 }}
                >
                    {variantOptions.map((opt) => (
                        <ToggleButton
                            key={opt.value}
                            value={opt.value}
                            sx={{
                                flex: 1,
                                background: opt.bg,
                                border: variant === opt.value ? '2px solid #8B5CF6' : '1px solid #E5E7EB',
                                '&.Mui-selected': { background: opt.bg },
                            }}
                        >
                            <Box sx={{ width: 20, height: 20 }} />
                        </ToggleButton>
                    ))}
                </ToggleButtonGroup>

                <TextField
                    fullWidth
                    size="small"
                    label="Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    sx={{ mb: 2 }}
                />

                <Button fullWidth variant="contained" onClick={handleSave}>
                    Save
                </Button>
            </Box>
        </Popover>
    );
};

export default CardSettingsPopover;
