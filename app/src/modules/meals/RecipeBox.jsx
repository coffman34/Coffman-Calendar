/**
 * @fileoverview Recipe Box with Drag-and-Drop Support
 * @module modules/meals/RecipeBox
 * 
 * JUNIOR DEV NOTE: This component is ALWAYS visible and has TWO key features:
 * 1. Browse saved recipes (original functionality)
 * 2. DRAG recipes onto the meal grid to assign them
 * 
 * HOW DRAG-AND-DROP WORKS:
 * We use the HTML5 Drag and Drop API (native browser feature):
 * 1. draggable="true" - Makes element draggable
 * 2. onDragStart - Fires when drag begins, stores recipe data
 * 3. The MealPlanGrid handles onDrop to receive the recipe
 * 
 * WHY HTML5 DnD over libraries like react-dnd?
 * - No extra dependencies (lighter bundle)
 * - Works well for our simple use case
 * - Touch-friendly on most modern browsers
 */

import React, { useState, useCallback } from 'react';
import {
    Box, Typography, List, TextField, Paper, InputAdornment,
    CircularProgress, Chip, Button, Divider
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import BookmarkAddIcon from '@mui/icons-material/BookmarkAdd';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import VisibilityIcon from '@mui/icons-material/Visibility';
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

/**
 * Draggable Recipe Item Component
 * 
 * JUNIOR DEV NOTE: We extract this to handle drag events cleanly.
 * The key is storing the recipe data in dataTransfer so the drop
 * target can access it.
 */
const DraggableRecipeItem = ({ recipe, onClick }) => {
    /**
     * Handle drag start - stores recipe data for drop target
     * 
     * JUNIOR DEV NOTE: We use JSON.stringify because dataTransfer
     * only accepts string data. The drop target will JSON.parse it.
     */
    const handleDragStart = (e) => {
        // 1. Set the data type and payload
        e.dataTransfer.setData('application/json', JSON.stringify(recipe));
        // 2. Set visual effect (copy cursor instead of move)
        e.dataTransfer.effectAllowed = 'copy';
    };

    return (
        <Box
            draggable="true"
            onDragStart={handleDragStart}
            onClick={onClick}
            sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                p: 1.5,
                mb: 0.5,
                borderRadius: 2,
                bgcolor: 'background.paper',
                border: '1px solid',
                borderColor: 'divider',
                cursor: 'grab',
                transition: 'all 0.2s ease',
                '&:hover': {
                    bgcolor: 'action.hover',
                    borderColor: 'primary.main',
                    transform: 'translateX(4px)',
                },
                '&:active': {
                    cursor: 'grabbing',
                    transform: 'scale(0.98)',
                },
            }}
        >
            {/* Drag Handle Icon */}
            <DragIndicatorIcon sx={{ color: 'text.secondary', fontSize: 20 }} />

            {/* Recipe Info */}
            <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="body2" fontWeight={500} noWrap>
                    {recipe.name}
                </Typography>
                {recipe.instructions && (
                    <Typography variant="caption" color="text.secondary" noWrap>
                        {recipe.instructions.slice(0, 40)}...
                    </Typography>
                )}
            </Box>
        </Box>
    );
};

/**
 * RecipeBox Component - Always-Open Recipe Sidebar
 * 
 * WHAT CHANGED:
 * - Removed open/onClose props - now always visible
 * - Added drag-and-drop support for recipes
 * - Styled as a persistent sidebar panel
 */
const RecipeBox = ({ onSelectRecipe, onPreviewRecipe }) => {
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
    const [previewingId, setPreviewingId] = useState(null);

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

    /**
     * Preview API recipe details
     */
    const handlePreview = async (result) => {
        setPreviewingId(result.spoonacularId);
        try {
            const fullRecipe = await getRecipeDetails(result.spoonacularId);
            onPreviewRecipe?.(fullRecipe);
        } catch (err) {
            console.error('Failed to preview recipe:', err);
        } finally {
            setPreviewingId(null);
        }
    };

    const filtered = filterCat ? safeRecipes.filter(r => r.categoryId === filterCat) : safeRecipes;
    const showingSearch = searchQuery.trim().length > 0 && apiEnabled;

    return (
        <Paper
            elevation={2}
            sx={{
                width: 280,
                height: '100%',
                borderRadius: 3,
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                bgcolor: '#FFFFFF',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            }}
        >
            {/* Header */}
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 1.5, color: 'primary.main' }}>
                📖 Recipe Box
            </Typography>

            {/* Drag Hint */}
            <Typography variant="caption" color="text.secondary" sx={{ mb: 1.5 }}>
                Drag recipes to the calendar to assign
            </Typography>

            {/* Search Input */}
            {apiEnabled && (
                <TextField
                    fullWidth
                    size="small"
                    placeholder="Search by ingredients..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                {isSearching ? <CircularProgress size={20} /> : <SearchIcon />}
                            </InputAdornment>
                        )
                    }}
                    sx={{ mb: 1.5 }}
                />
            )}

            {/* Category Filter (for saved recipes) */}
            {!showingSearch && (
                <Box sx={{ display: 'flex', gap: 0.5, mb: 1, flexWrap: 'wrap' }}>
                    <Chip
                        label="All"
                        size="small"
                        variant={filterCat ? 'outlined' : 'filled'}
                        onClick={() => setFilterCat(null)}
                    />
                    {categories.map(c => (
                        <Chip
                            key={c.id}
                            label={c.name}
                            size="small"
                            variant={filterCat === c.id ? 'filled' : 'outlined'}
                            onClick={() => setFilterCat(c.id)}
                        />
                    ))}
                </Box>
            )}

            <Divider sx={{ my: 1 }} />

            {/* Recipe List */}
            <List sx={{ flex: 1, overflow: 'auto', p: 0 }}>
                {showingSearch ? (
                    // API Search Results (not draggable until saved)
                    searchResults.length === 0 && !isSearching ? (
                        <Typography variant="body2" color="text.secondary" sx={{ p: 2, textAlign: 'center' }}>
                            No recipes found
                        </Typography>
                    ) : (
                        searchResults.map(r => (
                            <Box
                                key={r.spoonacularId}
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1,
                                    p: 1,
                                    mb: 0.5,
                                    borderRadius: 1,
                                    '&:hover': { bgcolor: 'action.hover' }
                                }}
                            >
                                <Box sx={{ flex: 1 }}>
                                    <Typography variant="body2" fontWeight={500}>{r.name}</Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        Uses {r.usedIngredientCount} ingredients
                                    </Typography>
                                </Box>
                                <Button
                                    size="small"
                                    startIcon={<VisibilityIcon />}
                                    onClick={() => handlePreview(r)}
                                    disabled={previewingId === r.spoonacularId}
                                    sx={{ minWidth: 0, px: 1 }}
                                >
                                    {previewingId === r.spoonacularId ? '...' : ''}
                                </Button>
                                <Button
                                    size="small"
                                    startIcon={<BookmarkAddIcon />}
                                    onClick={() => handleSaveToFamily(r)}
                                    disabled={savingId === r.spoonacularId}
                                    sx={{ minWidth: 0, px: 1 }}
                                >
                                    {savingId === r.spoonacularId ? '...' : ''}
                                </Button>
                            </Box>
                        ))
                    )
                ) : (
                    // Saved Recipes (draggable)
                    filtered.length === 0 ? (
                        <Typography variant="body2" color="text.secondary" sx={{ p: 2, textAlign: 'center' }}>
                            No saved recipes
                        </Typography>
                    ) : (
                        filtered.map(r => (
                            <DraggableRecipeItem
                                key={r.id}
                                recipe={r}
                                onClick={() => onPreviewRecipe?.(r)}
                            />
                        ))
                    )
                )}
            </List>
        </Paper >
    );
};

export default RecipeBox;
