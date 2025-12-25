import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, Button, CircularProgress, Alert, Grid, Paper, IconButton } from '@mui/material';
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary';
import CloseIcon from '@mui/icons-material/Close';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import { createPickerSession, pollPickerSession, getPickedMediaItems } from '../services/googlePhotos';
import { useUser } from '../modules/users/useUser';

const STORAGE_KEY = 'screensaver_photos';

const PhotoPicker = ({ userId, onPhotosSelected }) => {
    const { getUserPhotos, setUserPhotos, getFreshToken } = useUser();
    const [status, setStatus] = useState('idle');
    const [error, setError] = useState(null);
    const photos = getUserPhotos(userId);
    const pollRef = useRef(null);

    const updatePhotos = (newPhotos) => {
        setUserPhotos(userId, newPhotos);
        onPhotosSelected?.(newPhotos);
    };

    const removePhoto = (id) => {
        updatePhotos(photos.filter(p => p.id !== id));
    };

    const clearAll = () => {
        updatePhotos([]);
    };

    const startPicking = async () => {
        try {
            const token = await getFreshToken(userId);
            if (!token) { setError('Not connected to Google.'); return; }

            setStatus('picking');
            setError(null);

            const session = await createPickerSession(token);
            window.open(session.pickerUri + '/autoclose', 'photoPicker', 'width=800,height=600');
            setStatus('polling');

            // JUNIOR DEV NOTE: We pass userId so polling can refresh token if needed
            pollForCompletion(userId, session.id);
        } catch (e) {
            setError(e.message);
            setStatus('error');
        }
    };

    const pollForCompletion = async (currentUserId, sessionId) => {
        const poll = async () => {
            try {
                // Always get fresh token for polling
                const token = await getFreshToken(currentUserId);
                if (!token) throw new Error('Session expired');

                const session = await pollPickerSession(token, sessionId);
                if (session.mediaItemsSet) {
                    clearInterval(pollRef.current);

                    // Download items with fresh token
                    const newItems = await getPickedMediaItems(token, sessionId, currentUserId);

                    const existingIds = new Set(photos.map(p => p.id));
                    const merged = [...photos, ...newItems.filter(i => !existingIds.has(i.id))];
                    setUserPhotos(currentUserId, merged);
                    onPhotosSelected?.(merged);
                    setStatus('done');
                }
            } catch (e) {
                clearInterval(pollRef.current);
                setError(e.message);
                setStatus('error');
            }
        };
        pollRef.current = setInterval(poll, 3000);
        poll();
    };

    useEffect(() => () => clearInterval(pollRef.current), []);

    return (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="subtitle2" color="text.secondary">
                    {photos.length > 0 ? `${photos.length} photos` : 'Select photos for screensaver'}
                </Typography>
                <Box display="flex" gap={1}>
                    {photos.length > 0 && (
                        <Button size="small" color="error" startIcon={<DeleteSweepIcon />} onClick={clearAll}>
                            Clear All
                        </Button>
                    )}
                    <Button
                        variant="contained"
                        startIcon={status === 'polling' ? <CircularProgress size={16} /> : <PhotoLibraryIcon />}
                        onClick={startPicking}
                        disabled={status === 'polling'}
                    >
                        {status === 'polling' ? 'Waiting...' : 'Add Photos'}
                    </Button>
                </Box>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            {photos.length > 0 && (
                <Grid container spacing={1}>
                    {photos.map(photo => (
                        <Grid key={photo.id} size={{ xs: 3, sm: 2 }}>
                            <Paper sx={{
                                height: 80,
                                position: 'relative',
                                backgroundImage: photo.thumbnail ? `url(${photo.thumbnail})` : (photo.url ? `url(${photo.url})` : 'none'),
                                backgroundSize: 'cover',
                                backgroundPosition: 'center'
                            }}>
                                <IconButton
                                    size="small"
                                    onClick={() => removePhoto(photo.id)}
                                    sx={{
                                        position: 'absolute',
                                        top: 2,
                                        right: 2,
                                        bgcolor: 'rgba(0,0,0,0.5)',
                                        color: 'white',
                                        '&:hover': { bgcolor: 'error.main' }
                                    }}
                                >
                                    <CloseIcon fontSize="small" />
                                </IconButton>
                            </Paper>
                        </Grid>
                    ))}
                </Grid>
            )}
        </Box>
    );
};

export default PhotoPicker;
