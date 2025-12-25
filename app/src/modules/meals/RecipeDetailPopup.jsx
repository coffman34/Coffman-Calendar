/**
 * @fileoverview Recipe Detail Popup
 * @module modules/meals/RecipeDetailPopup
 * 
 * JUNIOR DEV NOTE: This popup shows full recipe details including:
 * - YouTube video player (if recipe has youtubeUrl)
 * - User preference buttons (favorite/like/dislike)
 * - "Start Cooking" button to launch Cook Mode
 * - Structured ingredients list and instructions
 */

import React, { useState } from 'react';
import {
    Dialog, DialogContent, Box, Typography, IconButton, Button, Divider, Chip
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import { format, parseISO } from 'date-fns';
import { useMealCategories } from './useMealCategories';
import { useUser } from '../users/useUser';
import CookMode from './CookMode';

/**
 * YouTube embed component using lite-youtube approach
 * JUNIOR DEV NOTE: We embed via iframe for simplicity; react-player is optional
 */
const YouTubeEmbed = ({ url }) => {
    if (!url) return null;

    // Extract video ID from various YouTube URL formats
    const videoId = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([^?&]+)/)?.[1];
    if (!videoId) return null;

    return (
        <Box sx={{
            position: 'relative', paddingTop: '56.25%', mb: 2, borderRadius: 2, overflow: 'hidden'
        }}>
            <iframe
                src={`https://www.youtube.com/embed/${videoId}`}
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope"
                allowFullScreen
                title="Recipe video"
            />
        </Box>
    );
};

/**
 * RecipeDetailPopup Component
 */
const RecipeDetailPopup = ({
    open, onClose, meal, dateKey, categoryId, onEdit, onDelete,
    // Optional: preference handlers from parent
    preference = null, onPreferenceChange
}) => {
    const { categories } = useMealCategories();
    const { currentUser } = useUser();
    const [cookModeOpen, setCookModeOpen] = useState(false);

    const category = categories.find(c => c.id === categoryId);
    if (!meal) return null;

    const formattedDate = dateKey ? format(parseISO(dateKey), 'EEEE, MMMM d') : '';
    const hasSteps = meal.steps && meal.steps.length > 0;
    const hasIngredients = meal.ingredients && meal.ingredients.length > 0;

    const handlePreference = (pref) => {
        if (onPreferenceChange && currentUser) {
            onPreferenceChange(currentUser.id, meal.id, preference === pref ? null : pref);
        }
    };

    return (
        <>
            <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth
                PaperProps={{ sx: { borderRadius: 3, maxHeight: '90vh' } }}>
                <DialogContent sx={{ p: 0 }}>
                    {/* YouTube Video (if available) */}
                    {meal.youtubeUrl && (
                        <Box sx={{ p: 2, pb: 0 }}>
                            <YouTubeEmbed url={meal.youtubeUrl} />
                        </Box>
                    )}

                    {/* Header */}
                    <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Box sx={{ flex: 1 }}>
                            <Typography variant="h5" fontWeight="bold">{meal.name}</Typography>
                            <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
                                <Button size="small" startIcon={<EditIcon />} onClick={() => onEdit?.(meal)}>Edit</Button>
                                <Button size="small" startIcon={<DeleteIcon />} color="error" onClick={() => onDelete?.(meal)}>Delete</Button>
                                {hasSteps && (
                                    <Button
                                        size="small"
                                        variant="contained"
                                        startIcon={<PlayArrowIcon />}
                                        onClick={() => setCookModeOpen(true)}
                                        sx={{ bgcolor: '#ff6b35', '&:hover': { bgcolor: '#e55a2b' } }}
                                    >
                                        Start Cooking
                                    </Button>
                                )}
                            </Box>
                        </Box>
                        <IconButton onClick={onClose}><CloseIcon /></IconButton>
                    </Box>

                    {/* Preference Buttons */}
                    {onPreferenceChange && currentUser && (
                        <Box sx={{ px: 2, pb: 1, display: 'flex', gap: 1 }}>
                            <Chip
                                icon={preference === 'favorite' ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                                label="Favorite"
                                onClick={() => handlePreference('favorite')}
                                color={preference === 'favorite' ? 'error' : 'default'}
                                variant={preference === 'favorite' ? 'filled' : 'outlined'}
                            />
                            <Chip
                                icon={<ThumbUpIcon />}
                                label="Like"
                                onClick={() => handlePreference('like')}
                                color={preference === 'like' ? 'success' : 'default'}
                                variant={preference === 'like' ? 'filled' : 'outlined'}
                            />
                            <Chip
                                icon={<ThumbDownIcon />}
                                label="Dislike"
                                onClick={() => handlePreference('dislike')}
                                color={preference === 'dislike' ? 'warning' : 'default'}
                                variant={preference === 'dislike' ? 'filled' : 'outlined'}
                            />
                        </Box>
                    )}

                    <Divider />

                    {/* Content */}
                    <Box sx={{ p: 2, maxHeight: 400, overflow: 'auto' }}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>{formattedDate}</Typography>

                        {category && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: category.color }} />
                                <Typography variant="body2">{category.name}</Typography>
                            </Box>
                        )}

                        {/* Structured Ingredients */}
                        {hasIngredients && (
                            <>
                                <Typography variant="subtitle2" fontWeight="bold" sx={{ mt: 2 }}>INGREDIENTS</Typography>
                                <Box component="ul" sx={{ pl: 2, mt: 1 }}>
                                    {meal.ingredients.map((ing, i) => (
                                        <Typography component="li" variant="body2" key={i}>
                                            {ing.amount} {ing.unit} {ing.name}
                                        </Typography>
                                    ))}
                                </Box>
                            </>
                        )}

                        {/* Instructions */}
                        {meal.instructions && (
                            <>
                                <Typography variant="subtitle2" fontWeight="bold" sx={{ mt: 2 }}>INSTRUCTIONS</Typography>
                                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', mt: 1 }}>
                                    {meal.instructions}
                                </Typography>
                            </>
                        )}
                    </Box>
                </DialogContent>
            </Dialog>

            {/* Cook Mode */}
            <CookMode
                open={cookModeOpen}
                onClose={() => setCookModeOpen(false)}
                recipe={meal}
            />
        </>
    );
};

export default RecipeDetailPopup;
