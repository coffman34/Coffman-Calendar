import React, { useState, useEffect } from 'react';
import { Box, FormControl, InputLabel, Select, MenuItem, Checkbox, ListItemText, CircularProgress, Typography } from '@mui/material';
import { fetchCalendarList } from '../services/googleCalendar';
import { useUser } from '../modules/users/useUser';

/**
 * CalendarSelector - Lets users pick which calendars to sync
 * 
 * JUNIOR DEV NOTE: We use getFreshToken instead of a raw token prop
 * because we need a guaranteed valid token for API calls. The raw
 * googleTokens object contains JSON strings that may be expired.
 */
const CalendarSelector = ({ userId }) => {
    const { currentUser, getUserCalendars, setUserCalendars, getFreshToken } = useUser();
    const [calendars, setCalendars] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const targetUserId = userId || currentUser?.id;
    const selected = getUserCalendars(targetUserId) || [];

    useEffect(() => {
        if (!targetUserId) return;

        const load = async () => {
            setLoading(true);
            setError(null);
            try {
                // Get a fresh, valid token
                const token = await getFreshToken(targetUserId);
                if (!token) {
                    setError('Not connected to Google');
                    return;
                }
                const list = await fetchCalendarList(token);
                setCalendars(list);
                // REMOVED: Auto-select primary calendar
                // User explicitly wants "no calendars" to mean "no events synced"
            } catch (e) {
                setError(e.message);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [targetUserId, getFreshToken]);

    const handleChange = (event) => {
        const value = event.target.value;
        const newSelected = typeof value === 'string' ? value.split(',') : value;
        setUserCalendars(targetUserId, newSelected);
    };

    if (loading) return <CircularProgress size={20} />;
    if (error) return <Typography color="error" variant="caption">{error}</Typography>;
    if (calendars.length === 0) return null;

    return (
        <FormControl fullWidth size="small" sx={{ mt: 2 }}>
            <InputLabel>Calendars to Sync</InputLabel>
            <Select
                multiple
                value={selected}
                onChange={handleChange}
                label="Calendars to Sync"
                renderValue={(sel) => calendars.filter(c => sel.includes(c.id)).map(c => c.name).join(', ')}
            >
                {calendars.map((cal) => (
                    <MenuItem key={cal.id} value={cal.id}>
                        <Checkbox checked={selected.includes(cal.id)} />
                        <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: cal.color, mr: 1 }} />
                        <ListItemText primary={cal.name} />
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    );
};

export default CalendarSelector;
