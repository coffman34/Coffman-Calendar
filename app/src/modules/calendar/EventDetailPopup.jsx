import React, { useState } from 'react';
import { Dialog, DialogContent, Box, Typography, IconButton, Divider, Chip, Link, Button, CircularProgress, Avatar, AvatarGroup, Tooltip } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PersonIcon from '@mui/icons-material/Person';
import PeopleIcon from '@mui/icons-material/People';
import RepeatIcon from '@mui/icons-material/Repeat';
import DescriptionIcon from '@mui/icons-material/Description';
import NotificationsIcon from '@mui/icons-material/Notifications';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import VideoCallIcon from '@mui/icons-material/VideoCall';
import { format } from 'date-fns';
import { COLOR_TAGS } from './EventCard';

const EventDetailPopup = ({ event, open, onClose, onEdit, onDelete }) => {
    const [deleting, setDeleting] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);

    if (!event) return null;

    const bgColor = COLOR_TAGS[event.colorId]?.bg || COLOR_TAGS[1].bg;
    const eventDate = new Date(event.date);
    const isEditable = event.isGoogleEvent && event.eventType !== 'birthday' && event.eventType !== 'holiday';

    const handleDelete = async () => {
        if (!confirmDelete) { setConfirmDelete(true); return; }
        setDeleting(true);
        try {
            await onDelete?.(event);
            onClose();
        } catch (err) {
            console.error('Delete failed:', err);
        } finally { setDeleting(false); setConfirmDelete(false); }
    };

    // Helper to find Google Meet link
    const meetLink = event.conferenceData?.entryPoints?.find(e => e.entryPointType === 'video')?.uri;

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3, overflow: 'hidden' } }}>
            {/* Header */}
            <Box sx={{ bgcolor: bgColor, p: 2, position: 'relative', display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="h5" fontWeight="bold" mt={1}>{event.emoji} {event.summary}</Typography>
                <Box>
                    {isEditable && <IconButton onClick={() => onEdit?.(event)} size="small"><EditIcon /></IconButton>}
                    {isEditable && <IconButton onClick={handleDelete} size="small" color={confirmDelete ? 'error' : 'default'}>{deleting ? <CircularProgress size={20} /> : <DeleteIcon />}</IconButton>}
                    <IconButton onClick={onClose} size="small"><CloseIcon /></IconButton>
                </Box>
            </Box>

            {confirmDelete && (
                <Box sx={{ bgcolor: 'error.light', p: 1, textAlign: 'center' }}>
                    <Typography variant="body2" color="error.contrastText">Click delete again to confirm</Typography>
                </Box>
            )}

            <DialogContent sx={{ pt: 2 }}>
                {/* Date & Time */}
                <DetailRow icon={<CalendarTodayIcon />}>
                    <Typography variant="body1" fontWeight={500}>{format(eventDate, 'EEEE, MMMM d, yyyy')}</Typography>
                    <Typography variant="body2" color="text.secondary">{event.isAllDay ? 'All day' : event.time}{event.recurrence && ' • Recurring'}</Typography>
                </DetailRow>

                {/* Google Meet */}
                {meetLink && (
                    <DetailRow icon={<VideoCallIcon color="primary" />}>
                        <Button variant="contained" size="small" href={meetLink} target="_blank" startIcon={<VideoCallIcon />}>
                            Join with Google Meet
                        </Button>
                    </DetailRow>
                )}

                {/* Reminders */}
                {event.reminders && event.reminders.useDefault === false && event.reminders.overrides?.length > 0 && (
                    <DetailRow icon={<NotificationsIcon color="warning" />}>
                        <Box>
                            <Typography variant="body2" fontWeight={500}>Reminders</Typography>
                            {event.reminders.overrides.map((r, i) => (
                                <Typography key={i} variant="caption" display="block" color="text.secondary">
                                    {r.minutes < 60 ? `${r.minutes} minutes` : r.minutes < 1440 ? `${r.minutes / 60} hour(s)` : `${r.minutes / 1440} day(s)`} before
                                </Typography>
                            ))}
                        </Box>
                    </DetailRow>
                )}
                {event.reminders?.useDefault && (
                    <DetailRow icon={<NotificationsIcon color="action" />}>
                        <Typography variant="body2" color="text.secondary">Default reminder enabled</Typography>
                    </DetailRow>
                )}

                {/* Profiles - Family members associated with event */}
                {event.profiles && event.profiles.length > 0 && (
                    <DetailRow icon={<PeopleIcon />}>
                        <Box>
                            <Typography variant="body2" fontWeight={500}>Profiles</Typography>
                            <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                                {event.profiles.map((profile, idx) => (
                                    <Tooltip key={idx} title={profile.name}>
                                        <Box display="flex" alignItems="center" gap={0.5}>
                                            <Avatar src={profile.avatar} sx={{ width: 28, height: 28 }}>{profile.name?.[0]}</Avatar>
                                            <Typography variant="caption">{profile.name}</Typography>
                                        </Box>
                                    </Tooltip>
                                ))}
                            </Box>
                        </Box>
                    </DetailRow>
                )}

                {event.location && <DetailRow icon={<LocationOnIcon />}><Typography variant="body2">{event.location}</Typography></DetailRow>}
                {event.description && <DetailRow icon={<DescriptionIcon />}><Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{event.description}</Typography></DetailRow>}
                {event.recurrence && <DetailRow icon={<RepeatIcon />}><Typography variant="body2" color="text.secondary">Recurring event</Typography></DetailRow>}

                {/* Attendees */}
                {event.attendees && event.attendees.length > 0 && (
                    <DetailRow icon={<PeopleIcon />}>
                        <Box display="flex" flexDirection="column" gap={0.5}>
                            <Typography variant="body2" fontWeight={500}>{event.attendees.length} Guests</Typography>
                            {event.attendees.map(att => (
                                <Typography key={att.email} variant="caption" display="block" color={att.responseStatus === 'declined' ? 'text.disabled' : 'text.primary'} sx={{ textDecoration: att.responseStatus === 'declined' ? 'line-through' : 'none' }}>
                                    {att.displayName || att.email} {att.responseStatus === 'accepted' && '✅'} {att.responseStatus === 'tentative' && '❓'}
                                </Typography>
                            ))}
                        </Box>
                    </DetailRow>
                )}

                {event.isGoogleEvent && (
                    <DetailRow icon={<PersonIcon />}>
                        <Typography variant="body2">{event.calendarName}</Typography>
                        {event.creator && <Typography variant="caption" color="text.secondary">Created by: {event.creator}</Typography>}
                    </DetailRow>
                )}

                <Divider sx={{ my: 2 }} />
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Chip label={event.isGoogleEvent ? 'Google Calendar' : 'Local Event'} size="small" color={event.isGoogleEvent ? 'primary' : 'default'} variant="outlined" />
                    {event.htmlLink && <Link href={event.htmlLink} target="_blank" rel="noopener" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>Open in Google <OpenInNewIcon fontSize="small" /></Link>}
                </Box>
            </DialogContent>
        </Dialog>
    );
};

const DetailRow = ({ icon, children }) => (
    <Box display="flex" gap={2} mb={2}>
        <Box color="action.main" sx={{ mt: 0.5 }}>{icon}</Box>
        <Box>{children}</Box>
    </Box>
);

export default EventDetailPopup;
