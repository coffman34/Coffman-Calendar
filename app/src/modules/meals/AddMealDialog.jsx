/**
 * @fileoverview Add Meal Dialog with Structured Ingredients
 * @module modules/meals/AddMealDialog
 * 
 * JUNIOR DEV NOTE: This dialog now supports:
 * - Structured ingredient input (for shopping lists)
 * - YouTube URL (for video recipes)
 * - Auto-parsing instructions into steps (for Cook Mode)
 */

import React, { useState, useEffect } from 'react';
import {
    Dialog, DialogContent, DialogActions, Button, TextField, Box,
    Tabs, Tab, List, ListItemButton, ListItemText, Switch,
    FormControlLabel, Chip, Typography, Collapse
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { format } from 'date-fns';
import DeleteIcon from '@mui/icons-material/Delete';
import { useMealCategories } from './useMealCategories';
import { useMeals } from './useMeals';
import IngredientInput from './components/IngredientInput';
import StepInput from './components/StepInput';
import { parseStepsFromInstructions } from './utils/recipeSchema';

const AddMealDialog = ({ open, onClose, initialDate, initialCategory, initialMeal, isRecipeMode = false }) => {
    const { categories } = useMealCategories();
    const { recipes, addMeal, updateMeal, deleteMeal, saveRecipe, deleteRecipe } = useMeals();

    // Defensive: ensure recipes is always an array
    const safeRecipes = Array.isArray(recipes) ? recipes : [];

    // Tab state
    const [tab, setTab] = useState(0);
    const [filterCat, setFilterCat] = useState(null);
    const [selectedRecipe, setSelectedRecipe] = useState(null);

    // Form fields
    const [name, setName] = useState('');
    const [date, setDate] = useState(initialDate || format(new Date(), 'yyyy-MM-dd'));
    const [categoryId, setCategoryId] = useState(initialCategory || 'dinner');
    const [instructions, setInstructions] = useState('');
    const [steps, setSteps] = useState([]); // New structured steps state
    const [ingredients, setIngredients] = useState([]);
    const [youtubeUrl, setYoutubeUrl] = useState('');
    const [showAdvanced, setShowAdvanced] = useState(false);

    // Defensive UX
    const [isSaving, setIsSaving] = useState(false);

    // Sync state when dialog opens
    useEffect(() => {
        if (open) {
            setDate(initialDate || format(new Date(), 'yyyy-MM-dd'));
            setCategoryId(initialCategory || 'dinner');

            if (initialMeal) {
                // Edit Mode
                setTab(1); // Force "New Entry" tab (custom edit)
                setName(initialMeal.name || '');
                setInstructions(initialMeal.instructions || '');
                // Defensively parse steps if they don't exist or are empty objects
                setSteps(initialMeal.steps && initialMeal.steps.length > 0 ? initialMeal.steps : parseStepsFromInstructions(initialMeal.instructions));
                setIngredients(initialMeal.ingredients || []);
                setYoutubeUrl(initialMeal.youtubeUrl || '');
                setSelectedRecipe(null);
            } else {
                // Create Mode
                setName(''); setInstructions(''); setSteps([]); setIngredients([]);
                setYoutubeUrl(''); setSelectedRecipe(null);
            }
        }
    }, [open, initialDate, initialCategory, initialMeal]);

    const handleAdd = () => {
        if (isSaving) return;
        if (!name.trim() && !selectedRecipe) return;

        setIsSaving(true);

        // Build meal object with extended schema
        // JUNIOR DEV NOTE: We track originRecipeId to allow updates to propagate back to the master recipe
        const baseData = tab === 0 && selectedRecipe
            ? { ...selectedRecipe, originRecipeId: selectedRecipe.id }
            : {
                name: name.trim(),
                instructions,
                ingredients,
                youtubeUrl: youtubeUrl.trim() || null,
                // Use explicit steps if available, else fall back to parsing manual text
                steps: steps.length > 0 ? steps : parseStepsFromInstructions(instructions),
                sourceApi: 'manual',
                originRecipeId: initialMeal?.originRecipeId // Preserve origin link on edit
            };

        const mealData = {
            ...baseData,
            id: initialMeal?.id || baseData.id || Date.now().toString()
        };

        if (!mealData.name?.trim()) {
            setIsSaving(false);
            return;
        }

        if (initialMeal) {
            // Update Logic
            if (isRecipeMode) {
                // Recipe Edit Mode: Just update the recipe (happens below), skip meal scheduling
                // We don't return here because the saveRecipe call is at the end
            } else {
                // Scheduled Meal Edit Mode
                const dateChanged = initialDate !== date;
                const catChanged = initialCategory !== categoryId;

                if (dateChanged || catChanged) {
                    // Move: Delete old -> Add new
                    deleteMeal(initialDate, initialCategory, initialMeal.id);
                    addMeal(date, categoryId, mealData);
                } else {
                    // Update in place
                    updateMeal(date, categoryId, initialMeal.id, mealData);
                }
            }
        } else {
            // Create Logic
            if (!isRecipeMode) {
                addMeal(date, categoryId, mealData);
            }
        }

        // Always save to recipes as per user request (Recipe Box serves as the database)
        // Only save if we are in "New Entry" mode (tab 1) or edited a manual entry
        if (tab === 1 || !selectedRecipe) {
            const recipeToSave = { ...mealData, categoryId };

            // Smart Update: If this came from a master recipe, update IT instead of duplicating
            if (mealData.originRecipeId) {
                recipeToSave.id = mealData.originRecipeId;
            }

            saveRecipe(recipeToSave);
        }

        setIsSaving(false);
        resetAndClose();
    };

    const handleDelete = () => {
        if (window.confirm(isRecipeMode ? "Delete this saved recipe?" : "Delete this meal?")) {
            if (isRecipeMode) {
                deleteRecipe(initialMeal.id);
            } else {
                deleteMeal(initialDate, initialCategory, initialMeal.id);
            }
            resetAndClose();
        }
    };

    const resetAndClose = () => {
        setTab(0); setSelectedRecipe(null); setName(''); setInstructions('');
        setIngredients([]); setYoutubeUrl('');
        setFilterCat(null); setShowAdvanced(false);
        onClose();
    };

    const filteredRecipes = filterCat ? safeRecipes.filter(r => r.categoryId === filterCat) : safeRecipes;

    return (
        <Dialog open={open} onClose={resetAndClose} fullWidth maxWidth="sm"
            PaperProps={{ sx: { borderRadius: 2, maxHeight: '90vh' } }}>

            {/* Header */}
            <Box sx={{ p: 2, borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
                <Typography variant="h6" fontWeight="bold">Add Meal</Typography>
            </Box>

            <DialogContent sx={{ p: 2 }}>
                {/* Tabs */}
                <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
                    <Tab label="From Recipes" />
                    <Tab label="New Entry" />
                </Tabs>

                {tab === 0 ? (
                    /* Recipe Selection */
                    <>
                        <Box sx={{ display: 'flex', gap: 0.5, mb: 1, flexWrap: 'wrap' }}>
                            <Chip label="All" size="small" onClick={() => setFilterCat(null)}
                                variant={filterCat ? 'outlined' : 'filled'} />
                            {categories.map(c => (
                                <Chip key={c.id} label={c.name} size="small"
                                    onClick={() => setFilterCat(c.id)}
                                    variant={filterCat === c.id ? 'filled' : 'outlined'} />
                            ))}
                        </Box>
                        <List sx={{ maxHeight: 200, overflow: 'auto', border: '1px solid #eee', borderRadius: 1 }}>
                            {filteredRecipes.length === 0 && (
                                <Typography variant="body2" sx={{ p: 2, textAlign: 'center', color: 'text.secondary' }}>
                                    No saved recipes
                                </Typography>
                            )}
                            {filteredRecipes.map(r => (
                                <ListItemButton key={r.id} selected={selectedRecipe?.id === r.id}
                                    onClick={() => setSelectedRecipe(r)}>
                                    <ListItemText primary={r.name}
                                        secondary={r.ingredients?.length ? `${r.ingredients.length} ingredients` : null} />
                                </ListItemButton>
                            ))}
                        </List>
                    </>
                ) : (
                    /* New Entry Form */
                    <>
                        <TextField fullWidth label="Meal Name" value={name}
                            onChange={e => setName(e.target.value)} sx={{ mb: 2 }} />

                        {/* Ingredients Input: Only show if NOT using steps, or make read-only? 
                           User requested "Only input ingredients in the step". 
                           So we hide this inputs block if we are using steps workflow. 
                           Actually, just hiding it simplifies the UI as requested. 
                           We can show a read-only summary if needed, but let's stick to user request.
                        */}
                        {steps.length === 0 && (
                            <Box sx={{ mb: 2 }}>
                                <IngredientInput value={ingredients} onChange={setIngredients} />
                            </Box>
                        )}

                        <StepInput
                            steps={steps}
                            ingredients={ingredients}
                            onChange={setSteps}
                            onIngredientsChange={setIngredients}
                        />

                        {/* Synchronization Note */}
                        {steps.length === 0 && instructions && (
                            <Button size="small" onClick={() => setSteps(parseStepsFromInstructions(instructions))}>
                                Convert "Simple Text" to Steps
                            </Button>
                        )}

                        {/* Advanced Options */}
                        <Button size="small" onClick={() => setShowAdvanced(!showAdvanced)}
                            endIcon={<ExpandMoreIcon sx={{ transform: showAdvanced ? 'rotate(180deg)' : 'none' }} />}>
                            {showAdvanced ? 'Hide' : 'Show'} Advanced
                        </Button>
                        <Collapse in={showAdvanced}>
                            <TextField fullWidth multiline rows={3} label="Raw Instructions (Legacy)"
                                value={instructions} onChange={e => setInstructions(e.target.value)}
                                helperText="Legacy text view. Recommended: Use the Step Builder above."
                                sx={{ mb: 2, mt: 1 }} />

                            <TextField fullWidth label="YouTube URL (optional)" value={youtubeUrl}
                                onChange={e => setYoutubeUrl(e.target.value)}
                                placeholder="https://youtube.com/watch?v=..."
                                sx={{ mt: 1 }} size="small" />
                        </Collapse>
                    </>
                )}

                {/* Date & Category (Hide in Recipe Mode) */}
                {!isRecipeMode && (
                    <Box sx={{ display: 'flex', gap: 2, my: 2 }}>
                        <TextField type="date" label="Date" value={date}
                            onChange={e => setDate(e.target.value)} size="small"
                            InputLabelProps={{ shrink: true }} sx={{ flex: 1 }} />
                        <TextField select label="Category" value={categoryId}
                            onChange={e => setCategoryId(e.target.value)} size="small"
                            SelectProps={{ native: true }} sx={{ flex: 1 }}>
                            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </TextField>
                    </Box>
                )}


            </DialogContent>

            <DialogActions sx={{ p: 2, gap: 1 }}>
                {initialMeal && (
                    <Button onClick={handleDelete} color="error" startIcon={<DeleteIcon />}>
                        Delete
                    </Button>
                )}
                <Box sx={{ flex: 1 }} />
                <Button onClick={resetAndClose} disabled={isSaving}>Cancel</Button>
                <Button onClick={handleAdd} variant="contained" disabled={isSaving}
                    sx={{ bgcolor: 'warning.main', '&:hover': { bgcolor: 'warning.dark' } }}>
                    {isSaving ? 'Saving...' : (initialMeal ? 'Save Changes' : 'Add Meal')}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default AddMealDialog;
