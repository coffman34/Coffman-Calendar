import React from 'react';
import { Dialog, DialogContent, Box, Typography, IconButton, Button, Divider } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { format, parseISO } from 'date-fns';
import { useMealCategories } from './useMealCategories';

const RecipeDetailPopup = ({ open, onClose, meal, dateKey, categoryId, onEdit, onDelete }) => {
    const { categories } = useMealCategories();
    const category = categories.find(c => c.id === categoryId);

    if (!meal) return null;

    const formattedDate = dateKey ? format(parseISO(dateKey), 'EEEE, MMMM d') : '';

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth
            PaperProps={{ sx: { borderRadius: 3, overflow: 'visible' } }}>
            <DialogContent sx={{ p: 0 }}>
                <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box>
                        <Typography variant="h5" fontWeight="bold">{meal.name}</Typography>
                        <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                            <Button size="small" startIcon={<EditIcon />} onClick={() => onEdit?.(meal)}>Edit</Button>
                            <Button size="small" startIcon={<DeleteIcon />} color="error" onClick={() => onDelete?.(meal)}>Delete</Button>
                        </Box>
                    </Box>
                    <IconButton onClick={onClose}><CloseIcon /></IconButton>
                </Box>

                <Divider />

                <Box sx={{ p: 2 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>{formattedDate}</Typography>
                    {category && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                            <Typography variant="caption" fontWeight="bold">Category</Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <Box sx={{ width: 16, height: 16, borderRadius: '50%', bgcolor: category.color }} />
                                <Typography variant="body2">{category.name}</Typography>
                            </Box>
                        </Box>
                    )}

                    {meal.instructions && (
                        <>
                            <Typography variant="caption" fontWeight="bold" display="block" sx={{ mt: 2 }}>INGREDIENTS:</Typography>
                            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', mt: 1 }}>{meal.instructions}</Typography>
                        </>
                    )}
                </Box>
            </DialogContent>
        </Dialog>
    );
};

export default RecipeDetailPopup;
