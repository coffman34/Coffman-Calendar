/**
 * @fileoverview Google Connect Button with defensive UX
 * @module components/GoogleConnectButton
 * 
 * DEFENSIVE UX FEATURES:
 * - Loading state during OAuth redirect
 * - Visual feedback for connection status
 */

import React, { useState } from 'react';
import { Button, Box, Chip, CircularProgress } from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import LinkOffIcon from '@mui/icons-material/LinkOff';
import { initiateGoogleLogin, disconnectGoogle } from '../services/googleAuth';
import { useUser } from '../modules/users/useUser';

const GoogleConnectButton = ({ userId, compact = false }) => {
    const { isUserConnected, updateUserToken } = useUser();
    const connected = isUserConnected(userId);

    // Loading states for defensive UX
    const [isConnecting, setIsConnecting] = useState(false);
    const [isDisconnecting, setIsDisconnecting] = useState(false);

    /**
     * Handle connect with loading state
     * 
     * JUNIOR DEV NOTE: Even though OAuth redirects away,
     * showing a loading state prevents double-clicks and
     * gives visual feedback that something is happening.
     */
    const handleConnect = () => {
        setIsConnecting(true);
        // OAuth will redirect, but show loading just in case
        initiateGoogleLogin(userId);
        // Reset after 5s in case redirect fails
        setTimeout(() => setIsConnecting(false), 5000);
    };

    const handleDisconnect = async () => {
        if (isDisconnecting) return;
        setIsDisconnecting(true);
        try {
            disconnectGoogle(userId);
            updateUserToken(userId, null);
        } finally {
            setIsDisconnecting(false);
        }
    };

    const isProcessing = isConnecting || isDisconnecting;

    if (compact) {
        return connected ? (
            <Chip
                icon={isDisconnecting ? <CircularProgress size={14} /> : <GoogleIcon sx={{ fontSize: 16 }} />}
                label="Connected"
                size="small"
                color="success"
                onDelete={handleDisconnect}
                deleteIcon={<LinkOffIcon sx={{ fontSize: 14 }} />}
                disabled={isProcessing}
            />
        ) : (
            <Chip
                icon={isConnecting ? <CircularProgress size={14} /> : <GoogleIcon sx={{ fontSize: 16 }} />}
                label={isConnecting ? 'Connecting...' : 'Connect'}
                size="small"
                variant="outlined"
                onClick={handleConnect}
                disabled={isProcessing}
                sx={{ cursor: isProcessing ? 'wait' : 'pointer' }}
            />
        );
    }

    return (
        <Box>
            {connected ? (
                <Button
                    variant="outlined"
                    color="error"
                    startIcon={isDisconnecting ? <CircularProgress size={16} /> : <LinkOffIcon />}
                    onClick={handleDisconnect}
                    disabled={isProcessing}
                    size="small"
                >
                    {isDisconnecting ? 'Disconnecting...' : 'Disconnect Google'}
                </Button>
            ) : (
                <Button
                    variant="contained"
                    startIcon={isConnecting ? <CircularProgress size={16} color="inherit" /> : <GoogleIcon />}
                    onClick={handleConnect}
                    disabled={isProcessing}
                    sx={{ bgcolor: '#4285f4', '&:hover': { bgcolor: '#3367d6' } }}
                >
                    {isConnecting ? 'Connecting...' : 'Connect Google Calendar'}
                </Button>
            )}
        </Box>
    );
};

export default GoogleConnectButton;
