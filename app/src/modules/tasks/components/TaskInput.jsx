import React from 'react';
import { Box, TextField, Button, CircularProgress } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

const TaskInput = ({ newTaskTitle, setNewTaskTitle, handleAddTask, addingTask, disabled }) => (
    <Box component="form" onSubmit={handleAddTask} sx={{ p: 2, display: 'flex', gap: 1, borderBottom: '1px solid rgba(0,0,0,0.1)' }}>
        <TextField
            fullWidth
            size="small"
            placeholder="Add a new task..."
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            disabled={addingTask || disabled}
        />
        <Button
            type="submit"
            variant="contained"
            disabled={!newTaskTitle.trim() || addingTask}
            startIcon={addingTask ? <CircularProgress size={20} /> : <AddIcon />}
        >
            Add
        </Button>
    </Box>
);

export default TaskInput;
