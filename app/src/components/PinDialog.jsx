import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, IconButton, Paper } from '@mui/material';
import BackspaceIcon from '@mui/icons-material/Backspace';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * @fileoverview PIN Entry Dialog Component
 * 
 * JUNIOR DEV NOTE: This implements a 4-digit PIN pad for protecting settings.
 * Key feature: Auto-submits when 4 digits are entered (no "Unlock" tap needed).
 * 
 * WHY AUTO-SUBMIT?
 * On a family kiosk, fewer taps = less frustration. When the user enters
 * their 4th digit, we immediately verify - providing instant feedback.
 */
const PinDialog = ({ onSuccess, title = 'Enter PIN', autoSubmit = true }) => {
    const [pin, setPin] = useState('');
    const [error, setError] = useState(false);

    /**
     * Handle PIN auto-submission when 4 digits are reached
     * 
     * JUNIOR DEV NOTE: We use useEffect instead of checking in handleDigit
     * because React state updates are asynchronous. By reacting to `pin`
     * changes, we ensure we have the actual 4-digit value.
     */
    useEffect(() => {
        if (autoSubmit && pin.length === 4) {
            const success = onSuccess(pin);
            if (!success) {
                setError(true);
                setPin('');
            }
        }
    }, [pin, autoSubmit, onSuccess]);

    const handleDigit = (digit) => {
        if (pin.length < 4) {
            setPin(prev => prev + digit);
            setError(false);
        }
    };

    const handleBackspace = () => {
        setPin(prev => prev.slice(0, -1));
        setError(false);
    };

    const handleSubmit = () => {
        if (pin.length === 4) {
            const success = onSuccess(pin);
            if (!success) {
                setError(true);
                setPin('');
            }
        }
    };

    const digits = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'back'];

    return (
        <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="100%" p={4}>
            <motion.div animate={error ? { x: [-20, 20, -10, 10, 0] } : {}} transition={{ duration: 0.4 }}>
                <Paper elevation={4} sx={{ p: 4, borderRadius: 4, minWidth: 300, textAlign: 'center' }}>
                    <Typography variant="h5" mb={3} fontWeight="bold">{title}</Typography>

                    <Box display="flex" justifyContent="center" gap={1.5} mb={3}>
                        {[0, 1, 2, 3].map(i => (
                            <Box key={i} sx={{ width: 20, height: 20, borderRadius: '50%', bgcolor: pin.length > i ? (error ? 'error.main' : 'primary.main') : 'grey.300', transition: 'all 0.2s' }} />
                        ))}
                    </Box>

                    <AnimatePresence>
                        {error && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <Typography color="error" variant="body2" mb={2}>Incorrect PIN</Typography>
                        </motion.div>}
                    </AnimatePresence>

                    <Box display="grid" gridTemplateColumns="repeat(3, 1fr)" gap={1.5} maxWidth={240} mx="auto">
                        {digits.map((d, idx) => d === '' ? <Box key={idx} /> : d === 'back' ? (
                            <IconButton key={idx} onClick={handleBackspace} sx={{ width: 64, height: 64 }}>
                                <BackspaceIcon />
                            </IconButton>
                        ) : (
                            <Button key={idx} variant="outlined" onClick={() => handleDigit(d)} sx={{ width: 64, height: 64, fontSize: '1.5rem', borderRadius: 2 }}>
                                {d}
                            </Button>
                        ))}
                    </Box>

                    <Button variant="contained" fullWidth size="large" onClick={handleSubmit} disabled={pin.length !== 4} sx={{ mt: 3, py: 1.5, borderRadius: 2 }}>
                        Unlock
                    </Button>
                </Paper>
            </motion.div>
        </Box>
    );
};

export default PinDialog;
