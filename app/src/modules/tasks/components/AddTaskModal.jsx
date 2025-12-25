/**
 * @fileoverview Add Task Modal - Create tasks with full details
 * @module modules/tasks/components/AddTaskModal
 * 
 * EDUCATIONAL NOTES FOR JUNIOR DEVELOPERS:
 * 
 * WHY THIS EXISTS:
 * This modal provides a full-featured form for creating tasks
 * with all configuration options including assignment, rewards,
 * due dates, and recurrence.
 */

import React, { useState, useContext } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Box,
    Typography,
    Slider,
    OutlinedInput,
    Chip,
    ToggleButton,
    ToggleButtonGroup
} from '@mui/material';
import { UserContext } from '../../users/UserContextCore';

/**
 * AddTaskModal Component
 * 
 * @param {Object} props
 * @param {boolean} props.open - Whether modal is open
 * @param {function} props.onClose - Close handler
 * @param {function} props.onSave - Save handler (receives task data)
 * @param {string|number} props.currentUserId - Default user to assign to
 */
const AddTaskModal = ({ open, onClose, onSave, currentUserId }) => {
    // Get all users for assignment dropdown
    const { users } = useContext(UserContext);

    // Form state
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [dueDate, setDueDate] = useState('');
    // JUNIOR DEV NOTE: assignedTo is now an array to support multiple users.
    const [assignedTo, setAssignedTo] = useState([]);
    const [rewardStrategy, setRewardStrategy] = useState('full');
    const [xpReward, setXpReward] = useState(10);
    const [goldReward, setGoldReward] = useState(5);
    const [isRecurring, setIsRecurring] = useState(false);
    const [recurrence, setRecurrence] = useState('daily');
    const [selectedDays, setSelectedDays] = useState([]); // 0-6 for Sun-Sat

    // Reset form when modal opens
    const handleOpen = () => {
        setTitle('');
        setDescription('');
        setDueDate('');
        // Initialize with current user if possible
        setAssignedTo(currentUserId ? [currentUserId] : []);
        setRewardStrategy('full');
        setXpReward(10);
        setGoldReward(5);
        setIsRecurring(false);
        setRecurrence('daily');
        setSelectedDays([]);
    };

    // Handle form submission
    const handleSubmit = () => {
        if (!title.trim() || assignedTo.length === 0) return;

        const taskData = {
            title: title.trim(),
            description: description.trim(),
            dueDate: dueDate || null,
            assignedTo,
            rewardStrategy,
            xpReward,
            goldReward,
            isRecurring,
            recurrence: isRecurring ? recurrence : null,
            days: isRecurring && recurrence === 'weekly' ? selectedDays : []
        };

        onSave(taskData);
        onClose();
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            TransitionProps={{ onEnter: handleOpen }}
        >
            <DialogTitle>Create New Task</DialogTitle>

            <DialogContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
                    {/* Task Title */}
                    <TextField
                        label="Task Name"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        fullWidth
                        required
                        autoFocus
                        placeholder="e.g., Clean bedroom"
                    />

                    {/* Task Description */}
                    <TextField
                        label="Description (optional)"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        fullWidth
                        multiline
                        rows={2}
                        placeholder="Additional details..."
                    />

                    {/* Due Date */}
                    <TextField
                        label="Due Date"
                        type="date"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                    />

                    {/* Assign To (Multi-Select) */}
                    <FormControl fullWidth>
                        <InputLabel>Assign To</InputLabel>
                        <Select
                            multiple
                            value={assignedTo}
                            onChange={(e) => setAssignedTo(e.target.value)}
                            input={<OutlinedInput label="Assign To" />}
                            renderValue={(selected) => (
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                    {selected.map((value) => {
                                        const user = users.find(u => u.id === value);
                                        return (
                                            <Chip
                                                key={value}
                                                label={user ? `${user.avatar} ${user.name}` : value}
                                                size="small"
                                            />
                                        );
                                    })}
                                </Box>
                            )}
                        >
                            {users.map(user => (
                                <MenuItem key={user.id} value={user.id}>
                                    {user.avatar} {user.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    {/* Reward Strategy (Only show if multiple assignees) */}
                    {assignedTo.length > 1 && (
                        <Box>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                                Reward Strategy
                            </Typography>
                            <ToggleButtonGroup
                                value={rewardStrategy}
                                exclusive
                                onChange={(e, val) => val && setRewardStrategy(val)}
                                fullWidth
                                size="small"
                            >
                                <ToggleButton value="full">
                                    Full Reward
                                </ToggleButton>
                                <ToggleButton value="split">
                                    Split Reward
                                </ToggleButton>
                            </ToggleButtonGroup>
                            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                                {rewardStrategy === 'full'
                                    ? 'Everyone gets the full XP and Gold.'
                                    : 'Reward is split evenly among all assigned users.'}
                            </Typography>
                        </Box>
                    )}

                    {/* XP Reward */}
                    <Box>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                            XP Reward: {xpReward}
                        </Typography>
                        <Slider
                            value={xpReward}
                            onChange={(e, val) => setXpReward(val)}
                            min={5}
                            max={100}
                            step={5}
                            marks={[
                                { value: 5, label: '5' },
                                { value: 50, label: '50' },
                                { value: 100, label: '100' }
                            ]}
                            sx={{ color: 'primary.main' }}
                        />
                    </Box>

                    {/* Gold Reward */}
                    <Box>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                            Gold Reward: {goldReward} 🪙
                        </Typography>
                        <Slider
                            value={goldReward}
                            onChange={(e, val) => setGoldReward(val)}
                            min={1}
                            max={50}
                            step={1}
                            marks={[
                                { value: 1, label: '1' },
                                { value: 25, label: '25' },
                                { value: 50, label: '50' }
                            ]}
                            sx={{ color: 'warning.main' }}
                        />
                    </Box>

                    {/* Recurring Toggle */}
                    <FormControl fullWidth>
                        <InputLabel>Recurrence</InputLabel>
                        <Select
                            value={isRecurring ? recurrence : 'none'}
                            onChange={(e) => {
                                if (e.target.value === 'none') {
                                    setIsRecurring(false);
                                } else {
                                    setIsRecurring(true);
                                    setRecurrence(e.target.value);
                                }
                            }}
                            label="Recurrence"
                        >
                            <MenuItem value="none">One-time task</MenuItem>
                            <MenuItem value="daily">Daily</MenuItem>
                            <MenuItem value="weekly">Weekly</MenuItem>
                        </Select>
                    </FormControl>

                    {/* Day of Week Selector (for weekly recurrence) */}
                    {isRecurring && recurrence === 'weekly' && (
                        <Box>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                                Repeat on:
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
                                    <Button
                                        key={day}
                                        variant={selectedDays.includes(index) ? 'contained' : 'outlined'}
                                        size="small"
                                        onClick={() => {
                                            setSelectedDays(prev =>
                                                prev.includes(index)
                                                    ? prev.filter(d => d !== index)
                                                    : [...prev, index]
                                            );
                                        }}
                                        sx={{
                                            minWidth: 44,
                                            height: 44,
                                            borderRadius: '50%',
                                            p: 0
                                        }}
                                    >
                                        {day}
                                    </Button>
                                ))}
                            </Box>
                        </Box>
                    )}
                </Box>
            </DialogContent>

            <DialogActions sx={{ p: 2 }}>
                <Button onClick={onClose}>Cancel</Button>
                <Button
                    variant="contained"
                    onClick={handleSubmit}
                    disabled={!title.trim() || assignedTo.length === 0}
                >
                    Create Task
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default AddTaskModal;
