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

import React from 'react';
import {
    Box, TextField, IconButton, Typography, Button, Paper,
    Chip, Autocomplete
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import LinkIcon from '@mui/icons-material/Link';

/**
 * StepInput Component
 * 
 * @param {Array} steps - Array of step objects { id, text, ingredientIds }
 * @param {Array} ingredients - Array of available ingredients { id, name, ... }
 * @param {Function} onChange - Callback for step updates
 */
const StepInput = ({ steps = [], ingredients = [], onChange }) => {

    const handleAddStep = () => {
        const newStep = {
            id: `step-${Date.now()}`,
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

    return (
        <Box>
            <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
                Instructions & Ingredient Links
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

                    {/* Ingredient Linking */}
                    <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <LinkIcon fontSize="small" color="action" />
                            <Typography variant="caption" color="text.secondary">
                                Link ingredients needed for this step:
                            </Typography>
                        </Box>

                        <Autocomplete
                            multiple
                            size="small"
                            options={ingredients}
                            getOptionLabel={(option) => `${option.amount} ${option.unit} ${option.name}`}
                            value={ingredients.filter(ing => step.ingredientIds?.includes(ing.id))}
                            onChange={(_, newValue) => {
                                handleUpdateStep(step.id, 'ingredientIds', newValue.map(ing => ing.id));
                            }}
                            renderInput={(params) => (
                                <TextField {...params} placeholder="Select ingredients..." size="small" />
                            )}
                            renderTags={(value, getTagProps) =>
                                value.map((option, index) => (
                                    <Chip
                                        variant="outlined"
                                        label={`${option.amount} ${option.unit} ${option.name}`}
                                        size="small"
                                        {...getTagProps({ index })}
                                    />
                                ))
                            }
                        />
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
                    No steps added yet. Add steps or paste text in the simple view.
                </Typography>
            )}
        </Box>
    );
};

export default StepInput;
