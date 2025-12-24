import React from 'react';
import { Box, Typography, Avatar, Paper, Grid2 as Grid } from '@mui/material';
import { useUser } from './useUser';
import GoogleConnectButton from '../../components/GoogleConnectButton';

const UserSelector = () => {
    const { users, currentUser, setCurrentUser } = useUser();

    return (
        <Box sx={{ p: 4, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <Typography variant="h3" gutterBottom sx={{ mb: 6, fontWeight: 300 }}>
                Who is viewing?
            </Typography>

            <Grid container spacing={4} justifyContent="center">
                {users.map((user) => (
                    <Grid item key={user.id}>
                        <Box sx={{ '&:hover': { scale: '1.05' }, transition: 'scale 0.2s' }}>
                            <Paper
                                elevation={currentUser.id === user.id ? 8 : 2}
                                onClick={() => setCurrentUser(user)}
                                sx={{
                                    p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center',
                                    cursor: 'pointer', borderRadius: 4, minWidth: 140,
                                    border: currentUser.id === user.id ? `2px solid ${user.color}` : '2px solid transparent',
                                }}
                            >
                                <Avatar sx={{ width: 80, height: 80, bgcolor: user.color, fontSize: '2rem', mb: 2 }}>
                                    {user.avatar}
                                </Avatar>
                                <Typography variant="h6" mb={1}>{user.name}</Typography>
                                <GoogleConnectButton userId={user.id} compact />
                            </Paper>
                        </Box>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
};

export default UserSelector;
