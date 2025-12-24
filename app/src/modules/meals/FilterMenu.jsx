import React, { useState } from 'react';
import { Box, Typography, IconButton, Menu, MenuItem, Switch, TextField, Button } from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';
import { useMealCategories } from './useMealCategories';

const COLOR_OPTIONS = ['#E57373', '#81C4C4', '#81C784', '#DEB887', '#90CAF9', '#CE93D8'];

const FilterMenu = () => {
    const { categories, updateCategory, toggleVisibility } = useMealCategories();
    const [anchorEl, setAnchorEl] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const [editName, setEditName] = useState('');

    const handleOpen = (e) => setAnchorEl(e.currentTarget);
    const handleClose = () => { setAnchorEl(null); setEditingId(null); };

    const startEdit = (cat) => {
        setEditingId(cat.id);
        setEditName(cat.name);
    };

    const saveEdit = () => {
        if (editingId && editName.trim()) {
            updateCategory(editingId, { name: editName.trim() });
        }
        setEditingId(null);
    };

    return (
        <>
            <Button startIcon={<FilterListIcon />} onClick={handleOpen} variant="outlined" size="small">
                Filter
            </Button>
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}
                PaperProps={{ sx: { p: 1, minWidth: 280, borderRadius: 3 } }}>
                {categories.map((cat) => (
                    <Box key={cat.id} sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.5, px: 1 }}>
                        <Box sx={{
                            width: 28, height: 28, borderRadius: '50%', bgcolor: cat.color,
                            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 12
                        }}>
                            {cat.name.charAt(0)}
                        </Box>
                        {editingId === cat.id ? (
                            <TextField size="small" value={editName} onChange={(e) => setEditName(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && saveEdit()} autoFocus sx={{ flex: 1 }} />
                        ) : (
                            <Typography sx={{ flex: 1 }}>{cat.name}</Typography>
                        )}
                        <Switch checked={cat.visible} onChange={() => toggleVisibility(cat.id)} size="small" />
                        <IconButton size="small" onClick={() => editingId === cat.id ? saveEdit() : startEdit(cat)}>
                            {editingId === cat.id ? <CheckIcon fontSize="small" /> : <EditIcon fontSize="small" />}
                        </IconButton>
                    </Box>
                ))}
                {editingId && (
                    <Box sx={{ display: 'flex', gap: 0.5, px: 1, py: 1, flexWrap: 'wrap' }}>
                        {COLOR_OPTIONS.map((c) => (
                            <Box key={c} onClick={() => updateCategory(editingId, { color: c })}
                                sx={{
                                    width: 24, height: 24, borderRadius: '50%', bgcolor: c, cursor: 'pointer',
                                    border: categories.find(cat => cat.id === editingId)?.color === c ? '2px solid #333' : 'none'
                                }} />
                        ))}
                    </Box>
                )}
            </Menu>
        </>
    );
};

export default FilterMenu;
