import React from 'react';
import { Button, Box, Typography, Chip } from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import LinkOffIcon from '@mui/icons-material/LinkOff';
import { initiateGoogleLogin, disconnectGoogle } from '../services/googleAuth';
import { useUser } from '../modules/users/useUser';

const GoogleConnectButton = ({ userId, compact = false }) => {
    const { isUserConnected, updateUserToken } = useUser();
    const connected = isUserConnected(userId);

    const handleConnect = () => initiateGoogleLogin(userId);

    const handleDisconnect = () => {
        disconnectGoogle(userId);
        updateUserToken(userId, null);
    };

    if (compact) {
        return connected ? (
            <Chip
                icon={<GoogleIcon sx={{ fontSize: 16 }} />}
                label="Connected"
                size="small"
                color="success"
                onDelete={handleDisconnect}
                deleteIcon={<LinkOffIcon sx={{ fontSize: 14 }} />}
            />
        ) : (
            <Chip
                icon={<GoogleIcon sx={{ fontSize: 16 }} />}
                label="Connect"
                size="small"
                variant="outlined"
                onClick={handleConnect}
                sx={{ cursor: 'pointer' }}
            />
        );
    }

    return (
        <Box>
            {connected ? (
                <Button
                    variant="outlined"
                    color="error"
                    startIcon={<LinkOffIcon />}
                    onClick={handleDisconnect}
                    size="small"
                >
                    Disconnect Google
                </Button>
            ) : (
                <Button
                    variant="contained"
                    startIcon={<GoogleIcon />}
                    onClick={handleConnect}
                    sx={{ bgcolor: '#4285f4', '&:hover': { bgcolor: '#3367d6' } }}
                >
                    Connect Google Calendar
                </Button>
            )}
        </Box>
    );
};

export default GoogleConnectButton;
