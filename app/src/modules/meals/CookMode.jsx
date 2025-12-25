/**
 * @fileoverview Cook Mode - Kitchen Tablet View
 * @module modules/meals/CookMode
 * 
 * JUNIOR DEV NOTE: This is a distraction-free cooking interface optimized
 * for viewing from across a kitchen counter.
 * 
 * KEY FEATURES:
 * - Large-scale text for readability at distance
 * - Step-by-step navigation (not one long block)
 * - Built-in timer buttons
 * - Wake-lock to prevent screen dimming
 * - Picture-in-Picture ready for YouTube
 * 
 * DESIGN PATTERN: Fullscreen Modal
 * Takes over the entire screen with high contrast for kitchen use.
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    Dialog, Box, Typography, IconButton, Button, LinearProgress, Fab
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import TimerIcon from '@mui/icons-material/Timer';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { cacheActiveRecipe, clearCachedRecipe } from '../../services/recipeApi';

/**
 * CookMode Component
 * 
 * @param {Object} props
 * @param {boolean} props.open - Whether cook mode is active
 * @param {Function} props.onClose - Close callback
 * @param {Object} props.recipe - Recipe with steps array
 */
const CookMode = ({ open, onClose, recipe }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [timerSeconds, setTimerSeconds] = useState(0);
    const [timerRunning, setTimerRunning] = useState(false);
    const wakeLockRef = useRef(null);

    const steps = (recipe?.steps && recipe.steps.length > 0)
        ? recipe.steps
        : (recipe?.instructions ? [{ text: recipe.instructions, ingredientIds: [] }] : []);
    const totalSteps = steps.length;

    // ========================================================================
    // WAKE LOCK - Prevent screen from dimming
    // ========================================================================

    /**
     * JUNIOR DEV NOTE: The Screen Wake Lock API keeps the screen on.
     * Essential for kitchen use where hands are often busy/messy.
     */
    useEffect(() => {
        const requestWakeLock = async () => {
            if (!open || !('wakeLock' in navigator)) return;

            try {
                wakeLockRef.current = await navigator.wakeLock.request('screen');
                console.log('Wake lock acquired');
            } catch (err) {
                console.warn('Wake lock failed:', err);
            }
        };

        requestWakeLock();

        return () => {
            if (wakeLockRef.current) {
                wakeLockRef.current.release();
                wakeLockRef.current = null;
            }
        };
    }, [open]);

    // ========================================================================
    // OFFLINE CACHE - Cache recipe when entering Cook Mode
    // ========================================================================

    useEffect(() => {
        if (open && recipe) {
            cacheActiveRecipe(recipe);
        }
        return () => {
            if (!open) clearCachedRecipe();
        };
    }, [open, recipe]);

    // ========================================================================
    // TIMER
    // ========================================================================

    useEffect(() => {
        let interval;
        if (timerRunning && timerSeconds > 0) {
            interval = setInterval(() => {
                setTimerSeconds(prev => {
                    if (prev <= 1) {
                        setTimerRunning(false);
                        // Play audio alert
                        new Audio('/timer-done.mp3').play().catch(() => { });
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [timerRunning, timerSeconds]);

    const formatTime = (secs) => {
        const m = Math.floor(secs / 60);
        const s = secs % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    const startTimer = (minutes) => {
        setTimerSeconds(minutes * 60);
        setTimerRunning(true);
    };

    // ========================================================================
    // NAVIGATION
    // ========================================================================

    const goNext = useCallback(() => {
        if (currentStep < totalSteps - 1) setCurrentStep(prev => prev + 1);
    }, [currentStep, totalSteps]);

    const goPrev = useCallback(() => {
        if (currentStep > 0) setCurrentStep(prev => prev - 1);
    }, [currentStep]);

    // Keyboard navigation
    useEffect(() => {
        const handleKey = (e) => {
            if (e.key === 'ArrowRight') goNext();
            if (e.key === 'ArrowLeft') goPrev();
            if (e.key === 'Escape') onClose();
        };
        if (open) window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [open, goNext, goPrev, onClose]);

    if (!recipe) return null;

    const progress = totalSteps > 0 ? ((currentStep + 1) / totalSteps) * 100 : 0;
    const isComplete = currentStep === totalSteps - 1;

    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullScreen
            PaperProps={{ sx: { bgcolor: '#1a1a2e', color: '#eee' } }}
        >
            {/* Header */}
            <Box sx={{
                p: 2, display: 'flex', justifyContent: 'space-between',
                alignItems: 'center', borderBottom: '1px solid #333'
            }}>
                <Typography variant="h5" fontWeight="bold">{recipe.name}</Typography>
                <IconButton onClick={onClose} sx={{ color: '#eee' }}>
                    <CloseIcon />
                </IconButton>
            </Box>

            {/* Progress */}
            <LinearProgress
                variant="determinate"
                value={progress}
                sx={{ height: 6, bgcolor: '#333', '& .MuiLinearProgress-bar': { bgcolor: '#00d9ff' } }}
            />

            {/* Step Content */}
            <Box sx={{
                flex: 1, display: 'flex', flexDirection: 'column',
                justifyContent: 'center', alignItems: 'center', p: 4, textAlign: 'center'
            }}>
                <Typography variant="overline" sx={{ color: '#888', mb: 2 }}>
                    Step {currentStep + 1} of {totalSteps}
                </Typography>

                <Typography variant="h3" sx={{
                    maxWidth: '800px', lineHeight: 1.4, fontWeight: 500,
                    fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' },
                    mb: 4
                }}>
                    {typeof steps[currentStep] === 'object' ? steps[currentStep].text : (steps[currentStep] || 'No instructions available')}
                </Typography>

                {/* Linked Ingredients Display */}
                {/* JUNIOR DEV NOTE: Debugging Logic for visibility */}
                {(() => {
                    const step = steps[currentStep];
                    if (typeof step !== 'object' || !step.ingredientIds?.length) return null;

                    // Log for debugging
                    console.group(`CookMode Step ${currentStep + 1} Debug`);
                    console.log('Step Data:', step);
                    console.log('Recipe Ingredients:', recipe.ingredients);

                    const ingredientsToRender = step.ingredientIds.map(ingId => {
                        // Loose equality check for ID safety (string vs number)
                        const ing = recipe.ingredients?.find(i => i.id == ingId);
                        if (!ing) {
                            console.warn(`Missing ingredient for ID: ${ingId}`);
                            return null;
                        }
                        return ing;
                    }).filter(Boolean);

                    console.log('Resolved Ingredients:', ingredientsToRender);
                    console.groupEnd();

                    if (ingredientsToRender.length === 0) return null;

                    return (
                        <Box sx={{
                            display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center',
                            opacity: 1, // Force opacity 1 just in case
                            animation: 'fadeIn 0.5s ease-in',
                            '@keyframes fadeIn': {
                                '0%': { opacity: 0, transform: 'translateY(10px)' },
                                '100%': { opacity: 1, transform: 'translateY(0)' }
                            }
                        }}>
                            {ingredientsToRender.map(ing => (
                                <Box key={ing.id} sx={{
                                    bgcolor: 'rgba(0, 217, 255, 0.15)', border: '1px solid rgba(0, 217, 255, 0.3)',
                                    borderRadius: 4, px: 3, py: 1, display: 'flex', alignItems: 'center', gap: 1,
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                                }}>
                                    <Typography variant="h6" fontWeight="bold" color="#00d9ff">
                                        {ing.amount} {ing.unit}
                                    </Typography>
                                    <Typography variant="h6" color="#ffffff">
                                        {ing.name}
                                    </Typography>
                                </Box>
                            ))}
                        </Box>
                    );
                })()}
            </Box>

            {/* Timer Display */}
            {timerSeconds > 0 && (
                <Box sx={{
                    position: 'fixed', top: 80, right: 24, bgcolor: 'primary.main',
                    borderRadius: 2, px: 3, py: 1, boxShadow: 3
                }}>
                    <Typography variant="h4" fontWeight="bold">{formatTime(timerSeconds)}</Typography>
                </Box>
            )}

            {/* Timer Quick Buttons */}
            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', mb: 2 }}>
                {[1, 5, 10, 15, 30].map(min => (
                    <Button
                        key={min}
                        variant="outlined"
                        startIcon={<TimerIcon />}
                        onClick={() => startTimer(min)}
                        sx={{ color: '#00d9ff', borderColor: '#00d9ff' }}
                    >
                        {min}m
                    </Button>
                ))}
            </Box>

            {/* Navigation */}
            <Box sx={{
                display: 'flex', justifyContent: 'space-between',
                alignItems: 'center', p: 3, borderTop: '1px solid #333'
            }}>
                <Fab
                    color="primary"
                    onClick={goPrev}
                    disabled={currentStep === 0}
                    sx={{ bgcolor: '#333', '&:disabled': { bgcolor: '#222' } }}
                >
                    <ArrowBackIcon />
                </Fab>

                <Typography variant="body2" sx={{ color: '#888' }}>
                    Tap arrows or use ← → keys
                </Typography>

                <Fab
                    color="primary"
                    onClick={isComplete ? onClose : goNext}
                    sx={{ bgcolor: isComplete ? '#00d9ff' : '#333' }}
                >
                    {isComplete ? <CheckCircleIcon /> : <ArrowForwardIcon />}
                </Fab>
            </Box>
        </Dialog>
    );
};

export default CookMode;
