/**
 * @fileoverview Photo gallery view component
 * @module modules/photos/PhotosView
 * 
 * EDUCATIONAL NOTES FOR JUNIOR DEVELOPERS:
 * 
 * WHY THIS FILE EXISTS:
 * Displays all photos from all family members in a unified gallery.
 * Photos are selected in Settings and aggregated here for viewing.
 * 
 * FEATURES:
 * - Grid layout of all family photos
 * - Photo and video support
 * - Lightbox for full-screen viewing
 * - Shows photo owner
 * - Empty state when no photos selected
 */

import React, { useState } from 'react';
import { Box, Typography, ImageList, ImageListItem, Paper } from '@mui/material';
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import { useUser } from '../users/useUser';
import PhotoLightbox from './PhotoLightbox';

const PhotosView = () => {
    const { allPhotos, users } = useUser();
    const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(null);

    const handlePhotoClick = (index) => {
        setSelectedPhotoIndex(index);
    };

    if (!allPhotos || allPhotos.length === 0) {
        return (
            <Box sx={{ p: 6, textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <Paper elevation={0} sx={{ p: 4, borderRadius: 4, bgcolor: 'background.paper', border: '1px solid rgba(0,0,0,0.05)' }}>
                    <PhotoLibraryIcon sx={{ fontSize: 80, color: 'text.disabled', mb: 2, opacity: 0.5 }} />
                    <Typography variant="h5" color="text.secondary" gutterBottom fontWeight="bold">
                        No Photos Yet
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Go to Settings and connect a user's Google Photos to see them here.
                    </Typography>
                </Paper>
            </Box>
        );
    }

    return (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <Box sx={{ p: 3, pb: 2 }}>
                <Typography variant="h4" fontWeight="bold">Photo Library</Typography>
                <Typography variant="body2" color="text.secondary">
                    Aggregate of {allPhotos.length} photos shared from {Object.keys(users).length} family members
                </Typography>
            </Box>

            <Box sx={{ flexGrow: 1, overflow: 'auto', p: 3, pt: 1 }}>
                <ImageList cols={3} gap={12} sx={{ mb: 4 }}>
                    {allPhotos.map((photo, index) => {
                        const owner = users.find(u => u.id === photo.ownerId);
                        return (
                            <ImageListItem
                                key={photo.id}
                                onClick={() => handlePhotoClick(index)}
                                sx={{
                                    cursor: 'pointer',
                                    borderRadius: '8px',
                                    overflow: 'hidden',
                                    transition: 'transform 0.2s',
                                    '&:hover': { transform: 'scale(1.02)' },
                                    bgcolor: 'black'
                                }}
                            >
                                {photo.type === 'video' ? (
                                    <Box sx={{ position: 'relative', height: '200px' }}>
                                        <Box
                                            component="img"
                                            src={photo.thumbnail || photo.url}
                                            sx={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8 }}
                                        />
                                        <Box sx={{
                                            position: 'absolute', top: '50%', left: '50%',
                                            transform: 'translate(-50%, -50%)',
                                            color: 'white', opacity: 0.8
                                        }}>
                                            <PlayCircleOutlineIcon sx={{ fontSize: 48 }} />
                                        </Box>
                                    </Box>
                                ) : (
                                    <img
                                        src={photo.url}
                                        alt={photo.filename}
                                        loading="lazy"
                                        style={{ width: '100%', height: '200px', objectFit: 'cover' }}
                                    />
                                )}
                                <Box sx={{
                                    position: 'absolute',
                                    bottom: 0,
                                    left: 0,
                                    right: 0,
                                    p: 1,
                                    background: 'linear-gradient(transparent, rgba(0,0,0,0.6))',
                                    color: 'white',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1
                                }}>
                                    <Typography variant="caption" sx={{ fontSize: '10px', opacity: 0.9 }}>
                                        {owner?.name || 'Shared'}
                                    </Typography>
                                </Box>
                            </ImageListItem>
                        );
                    })}
                </ImageList>
            </Box>

            <PhotoLightbox
                open={selectedPhotoIndex !== null}
                photos={allPhotos}
                currentIndex={selectedPhotoIndex || 0}
                onClose={() => setSelectedPhotoIndex(null)}
                onNavigate={setSelectedPhotoIndex}
            />
        </Box>
    );
};

export default PhotosView;
