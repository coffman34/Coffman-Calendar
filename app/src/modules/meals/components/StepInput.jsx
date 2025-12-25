/**
 * @fileoverview Step Input Component with Ingredient Linking
 * @module modules/meals/components/StepInput
 * 
 * JUNIOR DEV NOTE: This component replaces the simple text area for instructions.
 * It allows users to:
 * 1. Add discrete steps.
 * 2. Link specific ingredients to each step (for Cook Mode display).
 * 3. Reorder steps (future enhancement, currently append-only).
 */

import React, { useState } from 'react';
import {
    Box, TextField, IconButton, Typography, Button, Paper,
    Chip, Autocomplete, Select, MenuItem, InputAdornment
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import LinkIcon from '@mui/icons-material/Link';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { INGREDIENT_NAMES, getIngredientAisle } from '../constants/ingredients';
import { AISLE_CATEGORIES } from '../constants/aisles';

/**
 * Common units for ingredient measurement
 */
const UNITS = [
    '', 'cup', 'tbsp', 'tsp', 'oz', 'lb', 'g', 'kg', 'ml', 'L',
    'piece', 'slice', 'clove', 'bunch', 'can', 'package'
];

/**
 * StepInput Component
 * 
 * @param {Array} steps - Array of step objects { id, text, ingredientIds }
 * @param {Array} ingredients - Array of available ingredients { id, name, ... }
 * @param {Function} onChange - Callback for step updates
 * @param {Function} onIngredientsChange - Callback for ingredient updates
 */
const StepInput = ({ steps = [], ingredients = [], onChange, onIngredientsChange }) => {

    const handleAddStep = () => {
        const newStep = {
            id: `step-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            text: '',
            ingredientIds: []
        };
        onChange([...steps, newStep]);
    };

    const handleUpdateStep = (id, field, value) => {
        onChange(steps.map(step =>
            step.id === id ? { ...step, [field]: value } : step
        ));
    };

    const handleDeleteStep = (id) => {
        onChange(steps.filter(step => step.id !== id));
    };

    // --- Ingredient Creation Logic per Step ---
    const [ingInputs, setIngInputs] = useState({}); // { stepId: { name, amount, unit } }

    const getStepInput = (stepId) => ingInputs[stepId] || { name: '', amount: '', unit: '' };

    const updateStepInput = (stepId, field, value) => {
        setIngInputs(prev => ({
            ...prev,
            [stepId]: { ...getStepInput(stepId), [field]: value }
        }));
    };

    const handleAddIngredientToStep = (stepId) => {
        const input = getStepInput(stepId);
        if (!input.name.trim()) return;

        // 1. Create new ingredient
        const newIngredient = {
            id: `ing-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            name: input.name.trim(),
            amount: parseFloat(input.amount) || 1,
            unit: input.unit,
            aisle: getIngredientAisle(input.name) || 'pantry',
            original: `${input.amount} ${input.unit} ${input.name}`.trim()
        };

        // 2. Add to global list
        // Check for exact duplicate? For now, allow duplicates as they might be separate additions
        const newIngredientsList = [...ingredients, newIngredient];
        onIngredientsChange(newIngredientsList);

        // 3. Link to this step
        const step = steps.find(s => s.id === stepId);
        if (step) {
            handleUpdateStep(stepId, 'ingredientIds', [...(step.ingredientIds || []), newIngredient.id]);
        }

        // 4. Reset input
        updateStepInput(stepId, 'name', '');
        updateStepInput(stepId, 'amount', '');
        updateStepInput(stepId, 'unit', '');
    };

    const handleRemoveIngredientFromStep = (stepId, ingId) => {
        // Just unlink it from the step? Or remove from global?
        // User request: "Ingredient list will populate from steps". 
        // So if I ensure the step is the SOURCE, removing it here should probably remove it globally 
        // IF it's not used elsewhere. But that's complex.
        // Simple Link/Unlink first. User can delete from global list if needed?
        // Actually, user said "only input ingredients in the step". 
        // So let's unlink.
        const step = steps.find(s => s.id === stepId);
        if (step) {
            handleUpdateStep(stepId, 'ingredientIds', step.ingredientIds.filter(id => id !== ingId));
        }
    };

    return (
        <Box>
            <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
                Instructions & Ingredients
            </Typography>

            {steps.map((step, index) => (
                <Paper key={step.id} variant="outlined" sx={{ p: 2, mb: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="caption" fontWeight="bold" color="primary">
                            STEP {index + 1}
                        </Typography>
                        <IconButton size="small" onClick={() => handleDeleteStep(step.id)} color="error">
                            <DeleteIcon fontSize="small" />
                        </IconButton>
                    </Box>

                    {/* Step Instruction */}
                    <TextField
                        fullWidth
                        multiline
                        placeholder={`What to do in step ${index + 1}...`}
                        value={step.text}
                        onChange={(e) => handleUpdateStep(step.id, 'text', e.target.value)}
                        size="small"
                    />

                    {/* step-specific Ingredient Inputs */}
                    <Box sx={{ bgcolor: 'action.hover', p: 1.5, borderRadius: 1 }}>
                        <Typography variant="caption" fontWeight="bold" sx={{ mb: 1, display: 'block' }}>
                            Add Ingredients needed for this step:
                        </Typography>

                        <Box sx={{ display: 'flex', gap: 1, mb: 1, alignItems: 'center' }}>
                            <TextField
                                size="small"
                                placeholder="#"
                                value={getStepInput(step.id).amount}
                                onChange={e => updateStepInput(step.id, 'amount', e.target.value)}
                                sx={{ width: 60 }}
                                type="number"
                            />
                            <Select
                                size="small"
                                value={getStepInput(step.id).unit}
                                onChange={e => updateStepInput(step.id, 'unit', e.target.value)}
                                displayEmpty
                                sx={{ width: 80 }}
                            >
                                <MenuItem value=""><em>Unit</em></MenuItem>
                                {UNITS.map(u => <MenuItem key={u} value={u}>{u}</MenuItem>)}
                            </Select>
                            <Autocomplete
                                freeSolo
                                options={INGREDIENT_NAMES}
                                value={getStepInput(step.id).name}
                                onChange={(_, val) => updateStepInput(step.id, 'name', val || '')}
                                onInputChange={(_, val) => updateStepInput(step.id, 'name', val)}
                                sx={{ flex: 1 }}
                                renderInput={(params) => (
                                    <TextField {...params} placeholder="Ingredient (e.g. Flour)" size="small" />
                                )}
                            />
                            <IconButton
                                size="small"
                                onClick={() => handleAddIngredientToStep(step.id)}
                                disabled={!getStepInput(step.id).name}
                                color="primary"
                            >
                                <AddIcon />
                            </IconButton>
                        </Box>

                        {/* Linked Ingredients List */}
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            {ingredients
                                .filter(ing => step.ingredientIds?.includes(ing.id))
                                .map(ing => (
                                    <Chip
                                        key={ing.id}
                                        label={`${ing.amount} ${ing.unit} ${ing.name}`}
                                        size="small"
                                        onDelete={() => handleRemoveIngredientFromStep(step.id, ing.id)}
                                        color="secondary"
                                        variant="outlined"
                                    />
                                ))
                            }
                        </Box>

                        {/* Option to link existing unused ingredients? (Optional, skipping for now to reduce clutter as requested) */}
                    </Box>
                </Paper>
            ))}

            <Button
                startIcon={<AddIcon />}
                onClick={handleAddStep}
                variant="dashed"
                fullWidth
                sx={{ border: '1px dashed #ccc', color: 'text.secondary' }}
            >
                Add Step
            </Button>

            {steps.length === 0 && (
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1, textAlign: 'center' }}>
                    Start by adding a step, then add ingredients directly to it.
                </Typography>
            )}
        </Box>
    );
};

export default StepInput;
