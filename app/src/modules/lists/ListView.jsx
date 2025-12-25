/**
 * @fileoverview Lists Dashboard - Multiple Lists Management
 * @module modules/lists/ListView
 * 
 * JUNIOR DEV NOTE:
 * This is a dashboard for managing MULTIPLE lists (Shopping + Google Task Lists).
 * These lists are SEPARATE from the gamification system.
 * Users can:
 * - View all their subscribed lists
 * - Create new Google Task Lists
 * - Subscribe to existing Google Task Lists via settings gear
 * - Click on a list to open the detail modal
 */

import React, { useState } from 'react';
import { Box, Typography, Button, Grid, IconButton } from '@mui/material';
import AppCard from '../../components/AppCard';
import AddIcon from '@mui/icons-material/Add';
import SettingsIcon from '@mui/icons-material/Settings';
import { useUser } from '../users/useUser';
import { useGoogleAuth } from '../users/contexts/useGoogleAuth';
import ListCard from './components/ListCard';
import ListDetailModal from './components/ListDetailModal';
import CreateListModal from './components/CreateListModal';
import TaskSettingsPopover from '../tasks/components/TaskSettingsPopover';

const ListView = () => {
    const { currentUser } = useUser();
    const { getSelectedTaskLists } = useGoogleAuth();

    // ========================================================================
    // STATE
    // ========================================================================
    const [settingsAnchor, setSettingsAnchor] = useState(null);
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [selectedList, setSelectedList] = useState(null); // { id, type: 'shopping'|'google', title }

    // ========================================================================
    // DATA: Combine Shopping List + Subscribed Google Lists
    // ========================================================================

    // 1. Shopping List (Always present)
    const shoppingListDef = { id: 'shopping-list', type: 'shopping', title: 'Shopping List' };

    // 2. Google Lists (Subscribed via TaskSettingsPopover)
    const googleLists = currentUser ? getSelectedTaskLists(currentUser.id)?.map(l => ({
        ...l,
        type: 'google'
    })) || [] : [];

    // Combined list
    const allLists = [shoppingListDef, ...googleLists];

    // ========================================================================
    // HANDLERS
    // ========================================================================

    const handleCreateList = () => {
        setCreateModalOpen(true);
    };

    const handleListClick = (list) => {
        setSelectedList(list);
    };

    const handleSettingsClick = (e) => {
        setSettingsAnchor(e.currentTarget);
    };

    // ========================================================================
    // RENDER
    // ========================================================================

    // Header Actions - Gear for subscriptions, Add for new list
    const HeaderActions = (
        <Box display="flex" gap={1}>
            <IconButton onClick={handleSettingsClick}>
                <SettingsIcon />
            </IconButton>
            <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleCreateList}
                size="small"
            >
                Create List
            </Button>
        </Box>
    );

    return (
        <AppCard
            title="My Lists"
            action={HeaderActions}
        >
            <Box sx={{ p: 2, height: '100%', overflow: 'auto' }}>
                <Grid container spacing={2}>
                    {/* Render List Cards */}
                    {allLists.map(list => (
                        <Grid item xs={12} sm={6} md={4} key={list.id}>
                            <ListCard
                                list={list}
                                onClick={() => handleListClick(list)}
                                userId={currentUser?.id}
                            />
                        </Grid>
                    ))}

                    {/* Visual shortcut to create new list */}
                    <Grid item xs={12} sm={6} md={4}>
                        <Box
                            sx={{
                                height: '100%',
                                minHeight: 140,
                                border: '2px dashed rgba(0,0,0,0.1)',
                                borderRadius: 3,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexDirection: 'column',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                '&:hover': {
                                    bgcolor: 'rgba(0,0,0,0.02)',
                                    borderColor: 'rgba(0,0,0,0.2)'
                                }
                            }}
                            onClick={handleCreateList}
                        >
                            <AddIcon color="action" sx={{ fontSize: 40, mb: 1 }} />
                            <Typography color="text.secondary" fontWeight="bold">Create New List</Typography>
                        </Box>
                    </Grid>
                </Grid>
            </Box>

            {/* List Detail Modal - Opens when clicking a list card */}
            {/* JUNIOR DEV NOTE: This modal has its own gear icon for per-list settings */}
            {/* (sync toggle, delete for parents) */}
            <ListDetailModal
                list={selectedList}
                open={Boolean(selectedList)}
                onClose={() => setSelectedList(null)}
                userId={currentUser?.id}
            />

            {/* Create List Modal */}
            <CreateListModal
                open={createModalOpen}
                onClose={() => setCreateModalOpen(false)}
                onListCreated={() => {
                    // Auto-added to context, will appear on re-render
                }}
                userId={currentUser?.id}
            />

            {/* Settings Popover - Subscribe to Google Task Lists */}
            <TaskSettingsPopover
                open={Boolean(settingsAnchor)}
                anchorEl={settingsAnchor}
                onClose={() => setSettingsAnchor(null)}
                currentUserId={currentUser?.id}
            />
        </AppCard>
    );
};

export default ListView;
