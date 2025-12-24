import React from 'react';
import { Paper, Typography, FormControl, InputLabel, Select, MenuItem, IconButton } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';

const TaskHeader = ({ currentUser, selectedListId, setSelectedListId, taskLists, loading, onRefresh }) => (
    <Paper sx={{ p: 2, mb: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Typography variant="h6" sx={{ flexGrow: 0, whiteSpace: 'nowrap' }}>
            {currentUser?.name}'s Tasks
        </Typography>

        <FormControl size="small" sx={{ minWidth: 200, flexGrow: 1 }}>
            <InputLabel>Task List</InputLabel>
            <Select
                value={selectedListId}
                label="Task List"
                onChange={(e) => setSelectedListId(e.target.value)}
                disabled={loading && taskLists.length === 0}
            >
                {taskLists.map(list => (
                    <MenuItem key={list.id} value={list.id}>{list.title}</MenuItem>
                ))}
            </Select>
        </FormControl>

        <IconButton onClick={onRefresh} title="Refresh">
            <RefreshIcon />
        </IconButton>
    </Paper>
);

export default TaskHeader;
