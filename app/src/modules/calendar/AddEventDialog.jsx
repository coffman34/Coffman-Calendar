import React, { useState } from 'react';
import { Dialog, DialogContent, Box, TextField, Button, IconButton, Typography, Switch, FormControlLabel, MenuItem, Select, Divider, Chip, Stack } from '@mui/material';
import { DatePicker, TimePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import CloseIcon from '@mui/icons-material/Close';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import NotificationsIcon from '@mui/icons-material/Notifications';
import RepeatIcon from '@mui/icons-material/Repeat';
import DescriptionIcon from '@mui/icons-material/Description';
import PeopleIcon from '@mui/icons-material/People';
import DeleteIcon from '@mui/icons-material/Delete';
import { COLOR_TAGS } from './EventCard';

const REPEAT_OPTIONS = ['Does not repeat', 'Daily', 'Weekly', 'Monthly', 'Yearly'];
const REMINDER_OPTIONS = [
    { label: '5 minutes before', value: 5 },
    { label: '10 minutes before', value: 10 },
    { label: '15 minutes before', value: 15 },
    { label: '30 minutes before', value: 30 },
    { label: '1 hour before', value: 60 },
    { label: '1 day before', value: 1440 },
];

const AddEventDialog = ({ open, onClose, onSave, selectedDate, initialEvent }) => {
    const [summary, setSummary] = useState('');
    const [date, setDate] = useState(null);
    const [startTime, setStartTime] = useState(null);
    const [endTime, setEndTime] = useState(null);
    const [isAllDay, setIsAllDay] = useState(false);
    const [repeat, setRepeat] = useState('Does not repeat');
    const [location, setLocation] = useState('');
    const [description, setDescription] = useState('');
    const [colorId, setColorId] = useState(1);
    const [attendees, setAttendees] = useState([]);
    const [attendeeInput, setAttendeeInput] = useState('');
    const [reminders, setReminders] = useState([]); // [{ method: 'popup', minutes: 10 }]
    const [useDefaultReminders, setUseDefaultReminders] = useState(true);

    React.useEffect(() => {
        if (open) {
            if (initialEvent) {
                setSummary(initialEvent.summary);
                setDate(new Date(initialEvent.date));
                setIsAllDay(initialEvent.isAllDay);
                setLocation(initialEvent.location || '');
                setDescription(initialEvent.description || '');
                setColorId(Number(initialEvent.colorId) || 1);

                // Parse recurrence
                let repeatVal = 'Does not repeat';
                if (initialEvent.recurrence && initialEvent.recurrence.length > 0) {
                    const rrule = initialEvent.recurrence[0];
                    if (rrule.includes('FREQ=DAILY')) repeatVal = 'Daily';
                    else if (rrule.includes('FREQ=WEEKLY')) repeatVal = 'Weekly';
                    else if (rrule.includes('FREQ=MONTHLY')) repeatVal = 'Monthly';
                    else if (rrule.includes('FREQ=YEARLY')) repeatVal = 'Yearly';
                }
                setRepeat(repeatVal);

                // Parse Attendees
                setAttendees((initialEvent.attendees || []).map(a => a.email));

                // Parse Reminders
                if (initialEvent.reminders) {
                    if (initialEvent.reminders.useDefault) {
                        setUseDefaultReminders(true);
                        setReminders([]);
                    } else {
                        setUseDefaultReminders(false);
                        setReminders(initialEvent.reminders.overrides || []);
                    }
                } else {
                    setUseDefaultReminders(true);
                    setReminders([]);
                }

                if (!initialEvent.isAllDay && initialEvent.time) {
                    const d = new Date(initialEvent.date);
                    setStartTime(d);
                    const end = initialEvent.endDate ? new Date(initialEvent.endDate) : new Date(d.getTime() + 3600000);
                    setEndTime(end);
                }
            } else {
                setSummary('');
                setDate(selectedDate || new Date());
                setStartTime(new Date());
                setEndTime(new Date(Date.now() + 3600000));
                setIsAllDay(false);
                setLocation('');
                setDescription('');
                setColorId(1);
                setRepeat('Does not repeat');
                setAttendees([]);
                setReminders([]);
                setUseDefaultReminders(true);
            }
        }
    }, [open, initialEvent, selectedDate]);

    const handleSave = () => {
        if (!summary.trim()) return;
        onSave({
            summary, location, description, colorId, date, isAllDay, repeat, attendees,
            reminders: { useDefault: useDefaultReminders, overrides: reminders },
            time: isAllDay ? 'All day' : startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            endTime: isAllDay ? null : endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        });
        handleClose();
    };

    const handleClose = () => {
        onClose();
    };

    const addAttendee = () => {
        if (attendeeInput && !attendees.includes(attendeeInput)) {
            setAttendees([...attendees, attendeeInput]);
            setAttendeeInput('');
        }
    };

    const removeAttendee = (email) => {
        setAttendees(attendees.filter(a => a !== email));
    };

    const addReminder = () => {
        setUseDefaultReminders(false);
        setReminders([...reminders, { method: 'popup', minutes: 10 }]);
    };

    const updateReminder = (index, minutes) => {
        const newReminders = [...reminders];
        newReminders[index].minutes = minutes;
        setReminders(newReminders);
    };

    const removeReminder = (index) => {
        const newReminders = reminders.filter((_, i) => i !== index);
        setReminders(newReminders);
        if (newReminders.length === 0) setUseDefaultReminders(true);
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', p: 2, gap: 2 }}>
                    <IconButton onClick={handleClose}><CloseIcon /></IconButton>
                    <TextField variant="standard" placeholder="Add title" value={summary} onChange={e => setSummary(e.target.value)} fullWidth InputProps={{ sx: { fontSize: '1.5rem' } }} />
                    <Button variant="contained" onClick={handleSave} disabled={!summary.trim()}>Save</Button>
                </Box>

                <DialogContent sx={{ pt: 0 }}>
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap', mb: 2 }}>
                        <DatePicker value={date} onChange={setDate} slotProps={{ textField: { size: 'small', sx: { width: 150 } } }} />
                        {!isAllDay && (
                            <>
                                <TimePicker value={startTime} onChange={setStartTime} slotProps={{ textField: { size: 'small', sx: { width: 110 } } }} />
                                <Typography>to</Typography>
                                <TimePicker value={endTime} onChange={setEndTime} slotProps={{ textField: { size: 'small', sx: { width: 110 } } }} />
                            </>
                        )}
                    </Box>

                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
                        <FormControlLabel control={<Switch checked={isAllDay} onChange={e => setIsAllDay(e.target.checked)} />} label="All day" />
                        <Select value={repeat} onChange={e => setRepeat(e.target.value)} size="small" startAdornment={<RepeatIcon sx={{ mr: 1 }} />}>
                            {REPEAT_OPTIONS.map(opt => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
                        </Select>
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    <InputRow icon={<LocationOnIcon />}>
                        <TextField fullWidth variant="standard" placeholder="Add location" value={location} onChange={e => setLocation(e.target.value)} />
                    </InputRow>

                    {/* Notifications */}
                    <InputRow icon={<NotificationsIcon />}>
                        <Box sx={{ width: '100%' }}>
                            {reminders.map((rem, i) => (
                                <Box key={i} display="flex" alignItems="center" gap={1} mb={1}>
                                    <Select size="small" value={rem.minutes} onChange={e => updateReminder(i, e.target.value)} sx={{ minWidth: 150 }}>
                                        {REMINDER_OPTIONS.map(opt => <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>)}
                                    </Select>
                                    <IconButton size="small" onClick={() => removeReminder(i)}><CloseIcon fontSize="small" /></IconButton>
                                </Box>
                            ))}
                            <Button size="small" onClick={addReminder}>Add notification</Button>
                        </Box>
                    </InputRow>

                    {/* Attendees */}
                    <InputRow icon={<PeopleIcon />}>
                        <Box sx={{ width: '100%' }}>
                            <Box display="flex" flexWrap="wrap" gap={1} mb={1}>
                                {attendees.map(email => (
                                    <Chip key={email} label={email} onDelete={() => removeAttendee(email)} size="small" />
                                ))}
                            </Box>
                            <TextField
                                fullWidth variant="standard" placeholder="Add guests"
                                value={attendeeInput}
                                onChange={e => setAttendeeInput(e.target.value)}
                                onKeyPress={e => e.key === 'Enter' && addAttendee()}
                                InputProps={{ endAdornment: <Button onClick={addAttendee} disabled={!attendeeInput}>Add</Button> }}
                            />
                        </Box>
                    </InputRow>

                    <InputRow icon={<DescriptionIcon />}>
                        <TextField fullWidth multiline rows={2} variant="standard" placeholder="Add description" value={description} onChange={e => setDescription(e.target.value)} />
                    </InputRow>

                    <Divider sx={{ my: 2 }} />

                    <Typography variant="subtitle2" gutterBottom>Color</Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        {Object.entries(COLOR_TAGS).map(([id, { bg, name }]) => (
                            <Chip key={id} label={name} onClick={() => setColorId(Number(id))} sx={{ bgcolor: bg, border: colorId === Number(id) ? '3px solid #333' : 'none' }} />
                        ))}
                    </Box>
                </DialogContent>
            </Dialog>
        </LocalizationProvider>
    );
};

const InputRow = ({ icon, children }) => (
    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
        <Box sx={{ color: 'action.active', mt: 0.5 }}>{icon}</Box>
        <Box sx={{ flex: 1 }}>{children}</Box>
    </Box>
);

export default AddEventDialog;
