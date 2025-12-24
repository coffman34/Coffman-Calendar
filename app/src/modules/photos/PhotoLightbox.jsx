import React, { useState } from 'react';
import { Box, IconButton, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '../users/useUser';

const PhotoLightbox = ({ open, photos, currentIndex, onClose, onNavigate }) => {
    const { users } = useUser();
    const photo = photos[currentIndex];
    const [scale, setScale] = useState(1);

    if (!photo) return null;

    const owner = users.find(u => u.id === photo.ownerId);

    const handleNext = (e) => {
        e.stopPropagation();
        onNavigate((currentIndex + 1) % photos.length);
        setScale(1);
    };

    const handlePrev = (e) => {
        e.stopPropagation();
        onNavigate((currentIndex - 1 + photos.length) % photos.length);
        setScale(1);
    };

    const handleZoom = (e) => {
        e.stopPropagation();
        setScale(prev => prev === 1 ? 2 : 1);
    };

    return (
        <AnimatePresence>
            {open && (
                <Box
                    component={motion.div}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    sx={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        bgcolor: 'black',
                        zIndex: 9999,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden'
                    }}
                    onClick={onClose}
                >
                    <IconButton
                        onClick={onClose}
                        sx={{ position: 'absolute', top: 16, right: 16, color: 'white', bgcolor: 'rgba(0,0,0,0.5)', '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' } }}
                    >
                        <CloseIcon />
                    </IconButton>

                    {photos.length > 1 && (
                        <>
                            <IconButton
                                onClick={handlePrev}
                                sx={{ position: 'absolute', left: 16, color: 'white', bgcolor: 'rgba(0,0,0,0.3)', '&:hover': { bgcolor: 'rgba(0,0,0,0.5)' } }}
                            >
                                <ArrowBackIcon />
                            </IconButton>
                            <IconButton
                                onClick={handleNext}
                                sx={{ position: 'absolute', right: 16, color: 'white', bgcolor: 'rgba(0,0,0,0.3)', '&:hover': { bgcolor: 'rgba(0,0,0,0.5)' } }}
                            >
                                <ArrowForwardIcon />
                            </IconButton>
                        </>
                    )}

                    <Box sx={{ position: 'absolute', bottom: 24, left: 24, color: 'white', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                        <Typography variant="h6">{owner?.name || 'Shared Photo'}</Typography>
                        <Typography variant="body2" sx={{ opacity: 0.8 }}>{currentIndex + 1} of {photos.length}</Typography>
                    </Box>

                    <motion.div
                        drag={photo.type !== 'video'}
                        dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                        dragElastic={0.2}
                        onDragEnd={(_, info) => {
                            if (info.offset.x > 100) handlePrev(new Event('click'));
                            else if (info.offset.x < -100) handleNext(new Event('click'));
                        }}
                        style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                        {photo.type === 'video' ? (
                            <Box
                                component="video"
                                key={photo.id}
                                src={photo.url}
                                controls
                                autoPlay
                                sx={{
                                    maxWidth: '95%',
                                    maxHeight: '95%',
                                    outline: 'none'
                                }}
                                onClick={(e) => e.stopPropagation()}
                            />
                        ) : (
                            <motion.img
                                key={photo.id}
                                src={photo.url}
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: scale, opacity: 1 }}
                                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                                style={{
                                    maxWidth: '95%',
                                    maxHeight: '95%',
                                    objectFit: 'contain',
                                    cursor: scale > 1 ? 'grab' : 'zoom-in'
                                }}
                                onClick={handleZoom}
                            />
                        )}
                    </motion.div>
                </Box>
            )}
        </AnimatePresence>
    );
};

export default PhotoLightbox;
