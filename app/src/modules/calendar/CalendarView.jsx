/**
 * @fileoverview Main calendar view component
 * @module modules/calendar/CalendarView
 * 
 * EDUCATIONAL NOTES FOR JUNIOR DEVELOPERS:
 * 
 * WHY THIS FILE EXISTS:
 * This is the main calendar interface where users view and manage events.
 * It provides multiple view modes (day, week, month) and event management.
 * 
 * DESIGN PATTERN: Container Component + Custom Hooks
 * The component orchestrates views and dialogs, hooks handle logic.
 * 
 * REFACTORING NOTE:
 * Before: 171 lines with inline navigation logic
 * After: ~100 lines using extracted hooks
 */

import React, { useState } from 'react';
import { Box, Typography, IconButton, Button, Menu, MenuItem, Skeleton, Grid } from '@mui/material';
import AppCard from '../../components/AppCard';
import { format } from 'date-fns';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import TodayIcon from '@mui/icons-material/Today';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useCalendar } from './useCalendar';
import { useCalendarNavigation } from './hooks/useCalendarNavigation';
import WeeklyView from './WeeklyView';
import DayView from './DayView';
import MonthView from './MonthView';
import AddEventDialog from './AddEventDialog';

/**
 * View mode options
 */
const VIEW_OPTIONS = [
    { key: 'day', label: 'Day' },
    { key: 'week', label: 'Week' },
    { key: 'month', label: 'Month' },
];

/**
 * Calendar View Component
 * 
 * WHAT IT DOES:
 * Main calendar interface with multiple view modes and event management.
 * 
 * FEATURES:
 * - Multiple view modes (day, week, month)
 * - Touch gesture navigation (swipe left/right)
 * - Add/edit events
 * - Navigate between dates
 * - Loading states
 * 
 * HOW IT WORKS:
 * 1. Use navigation hook for date/view management
 * 2. Use calendar context for events
 * 3. Render appropriate view based on mode
 * 4. Handle event dialogs
 */
const CalendarView = () => {
    // ========================================================================
    // HOOKS
    // ========================================================================

    // Calendar data and operations
    const { events, loading, addEvent, updateEvent } = useCalendar();

    // Navigation and view management
    const {
        currentDate,
        currentTime,
        viewMode,
        setViewMode,
        navigate,
        goToToday,
        goToDate,
        containerRef,
    } = useCalendarNavigation('week');

    // Dialog state
    const [menuAnchor, setMenuAnchor] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);
    const [editingEvent, setEditingEvent] = useState(null);

    // ========================================================================
    // EVENT HANDLERS
    // ========================================================================

    /**
     * Opens dialog to add new event
     */
    const handleAddEvent = (date) => {
        setSelectedDate(date);
        setEditingEvent(null);
        setDialogOpen(true);
    };

    /**
     * Opens dialog to edit existing event
     */
    const handleEditEvent = (event) => {
        setEditingEvent(event);
        setDialogOpen(true);
    };

    /**
     * Saves event (create or update)
     */
    const handleSaveEvent = async (data) => {
        try {
            if (editingEvent) {
                await updateEvent(
                    editingEvent.originalCalendarId || 'primary',
                    editingEvent.id,
                    data
                );
            } else {
                await addEvent(data);
            }
        } catch (err) {
            console.error('Failed to save event:', err);
        }

        setEditingEvent(null);
        setDialogOpen(false);
    };

    /**
     * Handles day click in month view
     * 
     * WHAT IT DOES:
     * When user clicks a day in month view, switch to day view for that date.
     */
    const handleDayClick = (date) => {
        goToDate(date);
        setViewMode('day');
    };

    // ========================================================================
    // RENDERING
    // ========================================================================

    /**
     * Renders loading skeleton
     * 
     * JUNIOR DEV NOTE: Why skeleton instead of spinner?
     * Skeletons show the layout structure while loading.
     * This reduces perceived wait time and prevents layout shift.
     */
    const renderLoading = () => (
        <Box sx={{ p: 2, height: '100%' }}>
            <Grid container spacing={1} sx={{ height: '100%' }}>
                {Array.from({ length: 7 }).map((_, i) => (
                    <Grid key={i} size={{ xs: 12 / 7 }} sx={{ height: '100%' }}>
                        <Skeleton variant="rectangular" width="100%" height="40px" sx={{ mb: 1, borderRadius: 1 }} />
                        <Skeleton variant="rectangular" width="100%" height="80%" sx={{ borderRadius: 1 }} />
                    </Grid>
                ))}
            </Grid>
        </Box>
    );

    /**
     * Renders the appropriate view based on mode
     */
    const renderView = () => {
        if (loading && events.length === 0) {
            return renderLoading();
        }

        const viewProps = {
            currentDate,
            events,
            onAddEvent: handleAddEvent,
            onEditEvent: handleEditEvent,
        };

        switch (viewMode) {
            case 'day':
                return <DayView {...viewProps} />;
            case 'month':
                return <MonthView {...viewProps} onDayClick={handleDayClick} />;
            default:
                return <WeeklyView {...viewProps} />;
        }
    };

    const currentViewLabel = VIEW_OPTIONS.find(v => v.key === viewMode)?.label || 'Week';

    // Header Title Component
    const HeaderTitle = (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="h4" fontWeight="bold">
                {format(currentDate, 'MMMM d')}
            </Typography>
            <Typography variant="h4" sx={{ ml: 2, fontWeight: 300, color: 'text.secondary' }}>
                {format(currentTime, 'HH:mm')}
            </Typography>
        </Box>
    );

    // Header Actions Component
    const HeaderActions = (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Button startIcon={<TodayIcon />} onClick={goToToday} size="small" variant="text">
                Today
            </Button>
            <Box sx={{ display: 'flex', mr: 1, border: '1px solid rgba(0,0,0,0.1)', borderRadius: 1 }}>
                <IconButton onClick={() => navigate(-1)} size="small">
                    <ArrowBackIosNewIcon fontSize="small" />
                </IconButton>
                <IconButton onClick={() => navigate(1)} size="small">
                    <ArrowForwardIosIcon fontSize="small" />
                </IconButton>
            </Box>
            <Button
                endIcon={<ExpandMoreIcon />}
                onClick={(e) => setMenuAnchor(e.currentTarget)}
                variant="outlined"
                size="small"
                sx={{ borderRadius: 2 }}
            >
                {currentViewLabel}
            </Button>
            <Menu
                anchorEl={menuAnchor}
                open={Boolean(menuAnchor)}
                onClose={() => setMenuAnchor(null)}
            >
                {VIEW_OPTIONS.map(opt => (
                    <MenuItem
                        key={opt.key}
                        selected={viewMode === opt.key}
                        onClick={() => {
                            setViewMode(opt.key);
                            setMenuAnchor(null);
                        }}
                    >
                        {opt.label}
                    </MenuItem>
                ))}
            </Menu>
        </Box>
    );

    return (
        <AppCard
            title={HeaderTitle}
            action={HeaderActions}
            sx={{ height: '100%' }}
        >
            <Box
                ref={containerRef}
                sx={{
                    flex: 1,
                    overflow: 'hidden',
                    touchAction: 'pan-y',
                    p: 1
                }}
            >
                {renderView()}
            </Box>

            {/* Add/Edit event dialog */}
            <AddEventDialog
                open={dialogOpen}
                onClose={() => setDialogOpen(false)}
                onSave={handleSaveEvent}
                selectedDate={selectedDate || (editingEvent ? editingEvent.date : new Date())}
                initialEvent={editingEvent}
            />
        </AppCard>
    );
};

export default CalendarView;

/**
 * REFACTORING IMPROVEMENTS:
 * 
 * 1. Extracted navigation logic to useCalendarNavigation hook
 * 2. Cleaner component structure
 * 3. Better documentation
 * 4. Easier to test (hook can be tested separately)
 * 5. Easier to understand (presentation vs logic)
 */
