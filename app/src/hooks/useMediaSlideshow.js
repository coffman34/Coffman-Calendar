/**
 * @fileoverview Custom hook for media slideshow logic
 * @module hooks/useMediaSlideshow
 * 
 * EDUCATIONAL NOTES FOR JUNIOR DEVELOPERS:
 * 
 * WHY THIS FILE EXISTS:
 * The screensaver needs to cycle through photos and videos.
 * This hook encapsulates all the slideshow logic.
 * 
 * DESIGN PATTERN: Custom Hook Pattern
 * Extracts stateful slideshow logic for reuse and testing.
 */

import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Configuration constants
 */
const PHOTO_DURATION = 10000; // 10 seconds
const VIDEO_MAX_DURATION = 60000; // 60 seconds

/**
 * Hook for managing media slideshow
 * 
 * @param {Array} media - Array of media items { type, url, thumbnail }
 * @param {boolean} isActive - Whether slideshow is active
 * @returns {Object} { currentItem, currentIndex, goToNext, videoRef }
 */
export const useMediaSlideshow = (media, isActive) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [videoUrl, setVideoUrl] = useState(null);
    const videoRef = useRef(null);
    const timerRef = useRef(null);

    /**
     * Advances to next media item
     * 
     * JUNIOR DEV NOTE: We use useCallback so this is stable for useEffect dependencies.
     */
    const goToNext = useCallback(() => {
        if (!media.length) return;
        setCurrentIndex(prev => (prev + 1) % media.length);
        setVideoUrl(null);
    }, [media.length]);

    const currentItem = media[currentIndex];

    /**
     * Shuffle media on activation
     * JUNIOR DEV NOTE: We use useEffect to avoid impure function calls during render.
     */
    useEffect(() => {
        if (isActive && media.length > 0) {
            setCurrentIndex(Math.floor(Math.random() * media.length));
        }
    }, [isActive, media.length]);

    /** Load video URL when needed */
    useEffect(() => {
        if (!currentItem || currentItem.type !== 'video' || !isActive) {
            setVideoUrl(prev => prev === null ? prev : null);
            return;
        }
        setVideoUrl(prev => prev === currentItem.url ? prev : currentItem.url);
    }, [currentItem, isActive]);

    /** Auto-advance slideshow */
    useEffect(() => {
        if (!isActive || media.length === 0) return;

        const duration = currentItem?.type === 'video'
            ? VIDEO_MAX_DURATION
            : PHOTO_DURATION;

        timerRef.current = setTimeout(goToNext, duration);

        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, [isActive, media.length, currentIndex, currentItem?.type, goToNext]);

    /** Handle video end event */
    const handleVideoEnded = useCallback(() => {
        if (timerRef.current) clearTimeout(timerRef.current);
        goToNext();
    }, [goToNext]);

    return {
        currentItem,
        currentIndex,
        videoUrl,
        goToNext,
        handleVideoEnded,
        videoRef,
    };
};
