import React from 'react';
import { ListItem, ListItemIcon, ListItemText, Checkbox, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';

const TaskItem = ({ task, onToggle, onDelete }) => (
    <ListItem
        secondaryAction={
            <IconButton edge="end" onClick={() => onDelete(task.id)}>
                <DeleteIcon />
            </IconButton>
        }
        sx={{
            py: 1,
            px: 2,
            opacity: task.status === 'completed' ? 0.6 : 1,
            textDecoration: task.status === 'completed' ? 'line-through' : 'none'
        }}
    >
        <ListItemIcon sx={{ minWidth: 40 }} onClick={() => onToggle(task)}>
            <Checkbox
                edge="start"
                checked={task.status === 'completed'}
                tabIndex={-1}
                disableRipple
                icon={<RadioButtonUncheckedIcon />}
                checkedIcon={<CheckCircleIcon />}
            />
        </ListItemIcon>
        <ListItemText
            primary={task.title}
            secondary={task.due ? new Date(task.due).toLocaleDateString() : null}
        />
    </ListItem>
);

export default TaskItem;
