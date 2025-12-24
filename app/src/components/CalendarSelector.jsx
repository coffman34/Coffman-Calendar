import React, { useState, useEffect } from 'react';
import { Box, FormControl, InputLabel, Select, MenuItem, Checkbox, ListItemText, CircularProgress, Typography } from '@mui/material';
import { fetchCalendarList } from '../services/googleCalendar';
import { useUser } from '../modules/users/useUser';

const CalendarSelector = ({ token }) => {
    const { currentUser, getUserCalendars, setUserCalendars } = useUser();
    const [calendars, setCalendars] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const selected = getUserCalendars(currentUser?.id) || [];

    useEffect(() => {
        if (!token) return;

        const load = async () => {
            setLoading(true);
            try {
                const list = await fetchCalendarList(token);
                setCalendars(list);
                // If no selection saved, default to primary
                if (selected.length === 0 && list.length > 0) {
                    const primary = list.find(c => c.primary)?.id || list[0].id;
                    setUserCalendars(currentUser.id, [primary]);
                }
            } catch (e) {
                setError(e.message);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [token]);

    const handleChange = (event) => {
        const value = event.target.value;
        const newSelected = typeof value === 'string' ? value.split(',') : value;
        setUserCalendars(currentUser.id, newSelected);
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
