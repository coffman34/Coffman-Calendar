import React from 'react';
import { Snackbar, Alert } from '@mui/material';
import { useUI } from '../modules/ui/useUI';

const GlobalSnackbar = () => {
    const { snackbar, hideNotification } = useUI();

    return (
        <Snackbar
            open={snackbar.open}
            autoHideDuration={4000}
            onClose={hideNotification}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
            <Alert
                onClose={hideNotification}
                severity={snackbar.severity}
                variant="filled"
                sx={{ width: '100%' }}
            >
                {snackbar.message}
            </Alert>
        </Snackbar>
    );
};

export default GlobalSnackbar;
