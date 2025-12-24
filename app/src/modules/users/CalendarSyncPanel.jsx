import React, { useState, useEffect } from 'react';
import { Paper, Typography, Box, Checkbox, FormControlLabel, CircularProgress, Alert } from '@mui/material';
import GoogleConnectButton from '../../components/GoogleConnectButton';
import { useUser } from './useUser';
import { fetchCalendarList } from '../../services/googleCalendar';

const CalendarSyncPanel = ({ user }) => {
    const { isUserConnected, googleTokens, getUserCalendars, setUserCalendars } = useUser();
    const connected = isUserConnected(user.id);
    const token = googleTokens[user.id];

    const [calendars, setCalendars] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const selectedIds = getUserCalendars(user.id);

    useEffect(() => {
        if (!token) { setCalendars([]); return; }

        const loadCalendars = async () => {
            setLoading(true);
            setError(null);
            try {
                const list = await fetchCalendarList(token);
                setCalendars(list);
                // Auto-select primary calendar if none selected
                if (selectedIds.length === 0) {
                    const primary = list.find(c => c.primary);
                    if (primary) setUserCalendars(user.id, [primary.id]);
                }
            } catch (err) {
                console.error("Calendar fetch error:", err);
                setError(err.message || 'Failed to load calendars');
            } finally { setLoading(false); }
        };
        loadCalendars();
    }, [token]);

    const toggleCalendar = (calId) => {
        const newSelected = selectedIds.includes(calId)
            ? selectedIds.filter(id => id !== calId)
            : [...selectedIds, calId];
        setUserCalendars(user.id, newSelected);
    };

    return (
        <Paper sx={{ p: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">Google Calendar Sync</Typography>
                <GoogleConnectButton userId={user.id} compact />
            </Box>

            {!connected && <Typography color="text.secondary">Connect Google to sync calendars</Typography>}
            {loading && <CircularProgress size={24} />}
            {error && <Alert severity="error" sx={{ mt: 1 }}>{error}</Alert>}

            {connected && calendars.length > 0 && (
                <Box>
                    <Typography variant="subtitle2" color="text.secondary" mb={1}>Select calendars to sync:</Typography>
                    {calendars.map(cal => (
                        <FormControlLabel
                            key={cal.id}
                            control={<Checkbox checked={selectedIds.includes(cal.id)} onChange={() => toggleCalendar(cal.id)} />}
                            label={<Box display="flex" alignItems="center" gap={1}>
                                <Box sx={{ width: 12, height: 12, bgcolor: cal.color, borderRadius: '50%' }} />
                                {cal.name}
                            </Box>}
                        />
                    ))}
                </Box>
            )}
        </Paper>
    );
};

export default CalendarSyncPanel;
