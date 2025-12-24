import React, { useState, useEffect } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Box,
    Tabs, Tab, List, ListItemButton, ListItemText, Switch, FormControlLabel, Chip, Typography
} from '@mui/material';
import { format } from 'date-fns';
import { useMealCategories } from './useMealCategories';
import { useMeals } from './useMeals';

const AddMealDialog = ({ open, onClose, initialDate, initialCategory }) => {
    const { categories } = useMealCategories();
    const { recipes, addMeal, saveRecipe } = useMeals();
    const [tab, setTab] = useState(0);
    const [filterCat, setFilterCat] = useState(null);
    const [selectedRecipe, setSelectedRecipe] = useState(null);
    const [name, setName] = useState('');
    const [date, setDate] = useState(initialDate || format(new Date(), 'yyyy-MM-dd'));
    const [categoryId, setCategoryId] = useState(initialCategory || 'dinner');
    const [instructions, setInstructions] = useState('');
    const [saveToRecipes, setSaveToRecipes] = useState(false);

    // Sync state when dialog opens with new props
    useEffect(() => {
        if (open) {
            setDate(initialDate || format(new Date(), 'yyyy-MM-dd'));
            setCategoryId(initialCategory || 'dinner');
        }
    }, [open, initialDate, initialCategory]);

    const handleAdd = () => {
        if (!name.trim() && !selectedRecipe) return;

        const mealId = Date.now().toString();
        const meal = tab === 0 && selectedRecipe
            ? { ...selectedRecipe, id: mealId }
            : { name, instructions };

        if (!meal.name?.trim()) return;
        addMeal(date, categoryId, meal);
        if (saveToRecipes || (tab === 1 && name.trim())) {
            saveRecipe({ name: meal.name, instructions: meal.instructions, categoryId });
        }
        resetAndClose();
    };

    const resetAndClose = () => {
        setTab(0); setSelectedRecipe(null); setName(''); setInstructions('');
        setSaveToRecipes(false); setFilterCat(null);
        onClose();
    };

    const filteredRecipes = filterCat ? recipes.filter(r => r.categoryId === filterCat) : recipes;

    return (
        <Dialog
            open={open}
            onClose={resetAndClose}
            fullWidth
            maxWidth="sm"
            PaperProps={{
                sx: {
                    borderRadius: '8px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                    overflow: 'hidden'
                }
            }}
        >
            <Box sx={{
                p: 2.5,
                pb: 1.5,
                borderBottom: '1px solid rgba(0,0,0,0.05)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
            }}>
                <Typography variant="h6" fontWeight="bold">Add Meal</Typography>
            </Box>

            <DialogContent sx={{ p: 3 }}>
                <Tabs
                    value={tab}
                    onChange={(_, v) => setTab(v)}
                    sx={{
                        mb: 3,
                        '& .MuiTabs-indicator': { height: 3, borderRadius: '3px' }
                    }}
                >
                    <Tab label="From Recipes" />
                    <Tab label="New Entry" />
                </Tabs>

                {tab === 0 ? (
                    <>
                        <Box sx={{ display: 'flex', gap: 0.5, mb: 1, flexWrap: 'wrap' }}>
                            <Chip
                                label="All"
                                onClick={() => setFilterCat(null)}
                                variant={filterCat ? 'outlined' : 'filled'}
                                size="small"
                                sx={{ borderRadius: '6px' }}
                            />
                            {categories.map(c => (
                                <Chip
                                    key={c.id}
                                    label={c.name}
                                    onClick={() => setFilterCat(c.id)}
                                    variant={filterCat === c.id ? 'filled' : 'outlined'}
                                    size="small"
                                    sx={{
                                        borderRadius: '6px',
                                        bgcolor: filterCat === c.id ? c.color : 'transparent',
                                        '&:hover': { bgcolor: filterCat === c.id ? c.color : 'rgba(0,0,0,0.04)' }
                                    }}
                                />
                            ))}
                        </Box>
                        <List sx={{
                            maxHeight: 250,
                            overflow: 'auto',
                            border: '1px solid rgba(0,0,0,0.08)',
                            borderRadius: '8px',
                            mt: 1.5
                        }}>
                            {filteredRecipes.length === 0 && <ListItemText primary="No saved recipes" sx={{ p: 2, textAlign: 'center', opacity: 0.6 }} />}
                            {filteredRecipes.map(r => (
                                <ListItemButton
                                    key={r.id}
                                    selected={selectedRecipe?.id === r.id}
                                    onClick={() => setSelectedRecipe(r)}
                                    sx={{
                                        '&.Mui-selected': {
                                            bgcolor: 'rgba(139, 92, 246, 0.08)',
                                            '&:hover': { bgcolor: 'rgba(139, 92, 246, 0.12)' }
                                        }
                                    }}
                                >
                                    <ListItemText primary={r.name} secondary={r.instructions?.slice(0, 50)} />
                                </ListItemButton>
                            ))}
                        </List>
                    </>
                ) : (
                    <TextField
                        fullWidth
                        label="What Are We Eating?"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        sx={{ mb: 2 }}
                        variant="outlined"
                    />
                )}
                <Box sx={{ display: 'flex', gap: 2, my: 3, flexWrap: 'wrap' }}>
                    <TextField
                        type="date"
                        label="Date"
                        value={date}
                        onChange={e => setDate(e.target.value)}
                        size="small"
                        InputLabelProps={{ shrink: true }}
                        sx={{ flex: 1, minWidth: '150px' }}
                    />
                    <TextField
                        select
                        label="Category"
                        value={categoryId}
                        onChange={e => setCategoryId(e.target.value)}
                        size="small"
                        SelectProps={{ native: true }}
                        sx={{ flex: 1, minWidth: '150px' }}
                    >
                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </TextField>
                </Box>
                <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="Instructions (optional)"
                    value={instructions}
                    onChange={e => setInstructions(e.target.value)}
                    sx={{ mb: 2 }}
                />
                <FormControlLabel
                    control={<Switch checked={saveToRecipes} onChange={e => setSaveToRecipes(e.target.checked)} color="primary" />}
                    label="Save to Recipes"
                />
            </DialogContent>
            <DialogActions sx={{ p: 2.5, pt: 1.5, gap: 1 }}>
                <Button
                    onClick={resetAndClose}
                    sx={{ color: 'text.secondary' }}
                >
                    Cancel
                </Button>
                <Button
                    onClick={handleAdd}
                    variant="contained"
                    disableElevation
                    sx={{
                        bgcolor: 'warning.main',
                        px: 4,
                        '&:hover': { bgcolor: 'warning.dark' }
                    }}
                >
                    Add
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default AddMealDialog;
