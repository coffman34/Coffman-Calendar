/**
 * @fileoverview Ingredient Input Component
 * @module modules/meals/components/IngredientInput
 * 
 * JUNIOR DEV NOTE: This component allows users to add structured ingredients
 * when creating a recipe. Structured ingredients enable:
 * - Shopping list generation with proper quantities
 * - Ingredient-based recipe search
 * - Serving size scaling
 */

import React, { useState } from 'react';
import {
    Box, TextField, IconButton, List, ListItem, ListItemText,
    ListItemSecondaryAction, Typography, Select, MenuItem, InputAdornment,
    Autocomplete
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { AISLE_CATEGORIES } from '../constants/aisles';
import { INGREDIENT_NAMES, getIngredientAisle } from '../constants/ingredients';

/**
 * Common units for ingredient measurement
 */
const UNITS = [
    '', 'cup', 'tbsp', 'tsp', 'oz', 'lb', 'g', 'kg', 'ml', 'L',
    'piece', 'slice', 'clove', 'bunch', 'can', 'package'
];

/**
 * IngredientInput Component
 * 
 * @param {Array} value - Current ingredients array
 * @param {Function} onChange - Callback when ingredients change
 */
const IngredientInput = ({ value = [], onChange }) => {
    const [name, setName] = useState('');
    const [amount, setAmount] = useState('');
    const [unit, setUnit] = useState('');
    const [aisle, setAisle] = useState('pantry');

    // Auto-select aisle when name changes
    const handleNameChange = (newName) => {
        setName(newName);
        if (newName) {
            const suggestedAisle = getIngredientAisle(newName);
            if (suggestedAisle) {
                setAisle(suggestedAisle);
            }
        }
    };

    const handleAdd = () => {
        if (!name.trim()) return;

        const newIngredient = {
            id: Date.now().toString(),
            name: name.trim(),
            amount: parseFloat(amount) || 1,
            unit,
            aisle,
            original: `${amount} ${unit} ${name}`.trim()
        };

        onChange([...value, newIngredient]);

        // Reset inputs
        setName('');
        setAmount('');
        setUnit('');
        // Keep aisle as is or reset? Resetting to pantry is safer default
        setAisle('pantry');
    };

    const handleRemove = (id) => {
        onChange(value.filter(ing => ing.id !== id));
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAdd();
        }
    };

    return (
        <Box>
            <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
                Ingredients
            </Typography>

            {/* Input Row */}
            <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                <TextField
                    size="small"
                    placeholder="Amount"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    sx={{ width: 70 }}
                    type="number"
                    inputProps={{ min: 0, step: 0.25 }}
                />
                <Select
                    size="small"
                    value={unit}
                    onChange={e => setUnit(e.target.value)}
                    displayEmpty
                    sx={{ width: 90 }}
                >
                    <MenuItem value=""><em>Unit</em></MenuItem>
                    {UNITS.map(u => <MenuItem key={u} value={u}>{u || '(none)'}</MenuItem>)}
                </Select>

                <Autocomplete
                    freeSolo
                    options={INGREDIENT_NAMES}
                    value={name}
                    onChange={(_, newValue) => handleNameChange(newValue || '')}
                    onInputChange={(_, newInputValue) => handleNameChange(newInputValue)}
                    sx={{ flex: 1, minWidth: 150 }}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            size="small"
                            placeholder="Ingredient name"
                            onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    // Small delay to let autocomplete settle if needed, but usually fine
                                    handleAdd();
                                }
                            }}
                        />
                    )}
                />

                <Select
                    size="small"
                    value={aisle}
                    onChange={e => setAisle(e.target.value)}
                    sx={{ width: 120 }}
                >
                    {AISLE_CATEGORIES.map(a => (
                        <MenuItem key={a.id} value={a.id}>{a.icon} {a.name}</MenuItem>
                    ))}
                </Select>

                <IconButton size="small" onClick={handleAdd} disabled={!name.trim()} sx={{ border: '1px solid #ddd' }}>
                    <AddIcon />
                </IconButton>
            </Box>

            {/* Ingredient List */}
            {value.length > 0 && (
                <List dense sx={{ bgcolor: 'action.hover', borderRadius: 1, maxHeight: 150, overflow: 'auto' }}>
                    {value.map(ing => (
                        <ListItem key={ing.id}>
                            <ListItemText
                                primary={`${ing.amount} ${ing.unit} ${ing.name}`}
                                secondary={AISLE_CATEGORIES.find(a => a.id === ing.aisle)?.name}
                            />
                            <ListItemSecondaryAction>
                                <IconButton edge="end" size="small" onClick={() => handleRemove(ing.id)}>
                                    <DeleteIcon fontSize="small" />
                                </IconButton>
                            </ListItemSecondaryAction>
                        </ListItem>
                    ))}
                </List>
            )}

            {value.length === 0 && (
                <Typography variant="caption" color="text.secondary">
                    Add ingredients for shopping list generation
                </Typography>
            )}
        </Box>
    );
};

export default IngredientInput;
