/**
 * @fileoverview Screensaver component with photo/video slideshow
 * @module components/Screensaver
 * 
 * EDUCATIONAL NOTES FOR JUNIOR DEVELOPERS:
 * 
 * WHY THIS FILE EXISTS:
 * The kiosk should show a screensaver after inactivity.
 * This displays family photos and videos in a slideshow.
 * 
 * DESIGN PATTERN: Presentational Component + Custom Hook
 * The component handles presentation, the hook handles logic.
 * 
 * REFACTORING NOTE:
 * Before: 131 lines with inline slideshow logic
 * After: ~70 lines using extracted hook
 */

import React, { useState, useEffect } from 'react';
import { Box, Typography, Fade } from '@mui/material';
import { useUser } from '../modules/users/useUser';
import { useMediaSlideshow } from '../hooks/useMediaSlideshow';
import CollageFrame from './CollageFrame';
import { STORAGE_KEYS } from '../utils/constants';

/**
 * Screensaver Component
 * 
 * WHAT IT DOES:
 * Displays a fullscreen slideshow of family photos and videos.
 * 
 * HOW IT WORKS:
 * 1. Get all photos from all users
 * 2. Use slideshow hook to cycle through them
 * 3. Load selected frame overlay (optional)
 * 4. Show clock if no photos available
 * 
 * FEATURES:
 * - Auto-advancing slideshow
 * - Video playback support
 * - Optional decorative frame overlay
 * - Fade in/out animation
 * - Touch to wake
 * 
 * @param {Object} props
 * @param {boolean} props.isIdle - Whether screensaver should be active
 */
const Screensaver = ({ isIdle }) => {
    // ========================================================================
    // HOOKS
    // ========================================================================

    // Get all photos from all users
    const { allPhotos } = useUser();

    // Slideshow logic
    const {
        currentItem,
        videoUrl,
        handleVideoEnded,
        videoRef,
    } = useMediaSlideshow(allPhotos, isIdle);

    // Frame overlay state
    const [frameUrl, setFrameUrl] = useState(null);

    // ========================================================================
    // EFFECTS
    // ========================================================================

    /**
     * Load selected frame overlay
     * 
     * WHAT IT DOES:
     * Loads a decorative frame image to overlay on photos.
     * 
     * WHY WE NEED IT:
     * Users can select a frame (like a picture frame) to make
     * the slideshow look nicer. This loads their selection.
     * 
     * JUNIOR DEV NOTE: What's a frame?
     * Think of it like a physical picture frame. It's an image
     * with a transparent center that overlays the photo.
     */
    useEffect(() => {
        const loadFrame = async () => {
            const selectedFilename = localStorage.getItem(STORAGE_KEYS.SELECTED_FRAME);

            if (selectedFilename) {
                setFrameUrl(`/api/frames/storage/${selectedFilename}`);
            } else {
                setFrameUrl(null);
            }
        };

        loadFrame();
    }, [isIdle]);

    // ========================================================================
    // RENDERING
    // ========================================================================

    return (
        <Fade in={isIdle} timeout={1000}>
            <Box
                sx={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100vw',
                    height: '100vh',
                    bgcolor: 'black',
                    zIndex: 9999,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    pointerEvents: isIdle ? 'auto' : 'none', // Clickable only when active
                }}
            >
                {allPhotos.length > 0 ? (
                    // Photo/Video slideshow
                    <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
                        {/* Media layer (behind frame) */}
                        {currentItem?.type === 'video' && videoUrl ? (
                            // Video playback
                            <video
                                ref={videoRef}
                                src={videoUrl}
                                autoPlay
                                muted
                                onEnded={handleVideoEnded}
                                style={{
                                    position: 'absolute',
                                    top: '50%',
                                    left: '50%',
                                    transform: 'translate(-50%, -50%)',
                                    maxWidth: '100%',
                                    maxHeight: '100%',
                                    objectFit: 'contain',
                                    zIndex: 1,
                                }}
                            />
                        ) : (
                            // Photo display
                            <Box
                                component="img"
                                src={currentItem?.url || currentItem?.thumbnail}
                                alt="Screensaver"
                                sx={{
                                    position: 'absolute',
                                    top: '50%',
                                    left: '50%',
                                    transform: 'translate(-50%, -50%)',
                                    maxWidth: '90%',
                                    maxHeight: '90%',
                                    objectFit: 'contain',
                                    zIndex: 1,
                                }}
                            />
                        )}

                        {/* Frame overlay (above photo) */}
                        {frameUrl && <CollageFrame src={frameUrl} />}
                    </Box>
                ) : (
                    // No photos - show clock
                    <Box textAlign="center" color="white">
                        <Typography variant="h1" fontWeight="bold" sx={{ opacity: 0.7 }}>
                            {new Date().toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                            })}
                        </Typography>
                        <Typography variant="h5" sx={{ opacity: 0.5, mt: 2 }}>
                            Touch to wake
                        </Typography>
                    </Box>
                )}
            </Box>
        </Fade>
    );
};

export default Screensaver;

/**
 * REFACTORING IMPROVEMENTS:
 * 
 * 1. Extracted slideshow logic to useMediaSlideshow hook
 * 2. Cleaner component structure
 * 3. Better documentation
 * 4. Easier to test (hook can be tested separately)
 * 5. Easier to understand (presentation vs logic)
 */
