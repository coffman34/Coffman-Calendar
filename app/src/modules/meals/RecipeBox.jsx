/**
 * @fileoverview Recipe Box with Spoonacular Search
 * @module modules/meals/RecipeBox
 * 
 * JUNIOR DEV NOTE: This component now has two modes:
 * 1. Browse saved recipes (original functionality)
 * 2. Search new recipes from Spoonacular API
 * 
 * Users can save API recipes to their "Family Book" for later use.
 */

import React, { useState, useCallback } from 'react';
import {
    Box, Typography, IconButton, List, ListItemButton, ListItemText,
    TextField, Paper, InputAdornment, CircularProgress, Chip, Button, Divider
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SearchIcon from '@mui/icons-material/Search';
import BookmarkAddIcon from '@mui/icons-material/BookmarkAdd';
import { useMealCategories } from './useMealCategories';
import { useMeals } from './useMeals';
import { searchRecipes, getRecipeDetails, isApiConfigured } from '../../services/recipeApi';

// Debounce helper
const useDebounce = (fn, delay) => {
    const timeoutRef = React.useRef(null);
    return useCallback((...args) => {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => fn(...args), delay);
    }, [fn, delay]);
};

const RecipeBox = ({ open, onClose, onSelectRecipe }) => {
    const { categories } = useMealCategories();
    const { recipes, saveRecipe } = useMeals();

    // Defensive: ensure recipes is always an array
    const safeRecipes = Array.isArray(recipes) ? recipes : [];

    const [filterCat, setFilterCat] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [apiEnabled, setApiEnabled] = useState(null);
    const [savingId, setSavingId] = useState(null);

    // Check API status on mount
    React.useEffect(() => {
        isApiConfigured().then(setApiEnabled);
    }, []);

    // Debounced search
    const performSearch = useCallback(async (query) => {
        if (!query.trim()) {
            setSearchResults([]);
            return;
        }
        setIsSearching(true);
        try {
            const results = await searchRecipes(query);
            setSearchResults(results);
        } catch (err) {
            console.error('Search failed:', err);
            setSearchResults([]);
        } finally {
            setIsSearching(false);
        }
    }, []);

    const debouncedSearch = useDebounce(performSearch, 500);

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
        if (apiEnabled) debouncedSearch(e.target.value);
    };

    // Save recipe from API to local storage
    const handleSaveToFamily = async (result) => {
        setSavingId(result.spoonacularId);
        try {
            const fullRecipe = await getRecipeDetails(result.spoonacularId);
            saveRecipe({ ...fullRecipe, id: Date.now().toString() });
        } catch (err) {
            console.error('Failed to save recipe:', err);
        } finally {
            setSavingId(null);
        }
    };

    if (!open) return null;

    const filtered = filterCat ? safeRecipes.filter(r => r.categoryId === filterCat) : safeRecipes;
    const showingSearch = searchQuery.trim().length > 0 && apiEnabled;

    return (
        <Paper sx={{ width: 320, height: '100%', borderRadius: 3, p: 2, display: 'flex', flexDirection: 'column' }}>
            {/* Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <IconButton onClick={onClose} size="small"><ArrowBackIcon /></IconButton>
                <Typography variant="h6" fontWeight="bold">Recipe Box</Typography>
            </Box>

            {/* Search Input */}
            {apiEnabled && (
                <TextField
                    fullWidth size="small" placeholder="Search by ingredients..."
                    value={searchQuery} onChange={handleSearchChange}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                {isSearching ? <CircularProgress size={20} /> : <SearchIcon />}
                            </InputAdornment>
                        )
                    }}
                    sx={{ mb: 2 }}
                />
            )}

            {/* Category Filter (for saved recipes) */}
            {!showingSearch && (
                <Box sx={{ display: 'flex', gap: 0.5, mb: 1, flexWrap: 'wrap' }}>
                    <Chip label="All" size="small" variant={filterCat ? 'outlined' : 'filled'} onClick={() => setFilterCat(null)} />
                    {categories.map(c => (
                        <Chip key={c.id} label={c.name} size="small"
                            variant={filterCat === c.id ? 'filled' : 'outlined'}
                            onClick={() => setFilterCat(c.id)} />
                    ))}
                </Box>
            )}

            <Divider sx={{ my: 1 }} />

            {/* Results */}
            <List sx={{ flex: 1, overflow: 'auto' }}>
                {showingSearch ? (
                    // API Search Results
                    searchResults.length === 0 && !isSearching ? (
                        <Typography variant="body2" color="text.secondary" sx={{ p: 2, textAlign: 'center' }}>
                            No recipes found
                        </Typography>
                    ) : (
                        searchResults.map(r => (
                            <ListItemButton key={r.spoonacularId} sx={{ borderRadius: 1, mb: 0.5 }}>
                                <ListItemText
                                    primary={r.name}
                                    secondary={`Uses ${r.usedIngredientCount} ingredients`}
                                />
                                <Button
                                    size="small" startIcon={<BookmarkAddIcon />}
                                    onClick={() => handleSaveToFamily(r)}
                                    disabled={savingId === r.spoonacularId}
                                >
                                    {savingId === r.spoonacularId ? 'Saving...' : 'Save'}
                                </Button>
                            </ListItemButton>
                        ))
                    )
                ) : (
                    // Saved Recipes
                    filtered.length === 0 ? (
                        <Typography variant="body2" color="text.secondary" sx={{ p: 2, textAlign: 'center' }}>
                            No saved recipes
                        </Typography>
                    ) : (
                        filtered.map(r => (
                            <ListItemButton key={r.id} onClick={() => onSelectRecipe?.(r)} sx={{ borderRadius: 1 }}>
                                <ListItemText primary={r.name} secondary={r.instructions?.slice(0, 50)} />
                            </ListItemButton>
                        ))
                    )
                )}
            </List>
        </Paper>
    );
};

export default RecipeBox;
