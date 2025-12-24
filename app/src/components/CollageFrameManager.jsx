import React, { useState, useEffect, useRef } from 'react';
import {
    Box, Typography, IconButton, Button, Paper,
    ImageList, ImageListItem, ImageListItemBar, CircularProgress
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const SELECTED_FRAME_KEY = 'screensaver_selected_frame';

const CollageFrameManager = () => {
    const [frames, setFrames] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [selectedFrame, setSelectedFrame] = useState(() => {
        return localStorage.getItem(SELECTED_FRAME_KEY) || null;
    });
    const fileInputRef = useRef(null);

    useEffect(() => {
        fetchFrames();
    }, []);

    const fetchFrames = async () => {
        try {
            const res = await fetch('/api/frames');
            if (res.ok) {
                setFrames(await res.json());
            }
        } catch (err) {
            console.error('Failed to fetch frames:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        console.log('Uploading frame:', file.name, file.type, file.size);
        setUploading(true);
        const formData = new FormData();
        formData.append('frame', file);

        try {
            const res = await fetch('/api/frames', {
                method: 'POST',
                body: formData
            });

            const data = await res.json();
            console.log('Upload response:', res.status, data);

            if (res.ok) {
                console.log('Frame uploaded successfully:', data);
                fetchFrames();
            } else {
                console.error('Upload failed:', res.status, data);
                alert(`Upload failed: ${data.error || 'Unknown error'}`);
            }
        } catch (err) {
            console.error('Upload error:', err);
            alert(`Upload error: ${err.message}`);
        } finally {
            setUploading(false);
            e.target.value = '';
        }
    };

    const handleDelete = async (filename) => {
        try {
            await fetch(`/api/frames/${filename}`, { method: 'DELETE' });
            if (selectedFrame === filename) {
                setSelectedFrame(null);
                localStorage.removeItem(SELECTED_FRAME_KEY);
            }
            fetchFrames();
        } catch (err) {
            console.error('Delete failed:', err);
        }
    };

    const handleSelect = (filename) => {
        const newVal = selectedFrame === filename ? null : filename;
        setSelectedFrame(newVal);
        if (newVal) {
            localStorage.setItem(SELECTED_FRAME_KEY, newVal);
        } else {
            localStorage.removeItem(SELECTED_FRAME_KEY);
        }
    };

    return (
        <Paper sx={{ p: 2, borderRadius: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6">Collage Frames</Typography>
                <Button
                    startIcon={uploading ? <CircularProgress size={16} /> : <AddPhotoAlternateIcon />}
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    variant="outlined"
                    size="small"
                >
                    Upload Frame
                </Button>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/webp"
                    hidden
                    onChange={handleUpload}
                />
            </Box>

            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                Upload PNG frames with transparent centers. Pure black (#000) or pure green (#0F0) pixels will be transparent.
            </Typography>

            {loading ? (
                <Box sx={{ textAlign: 'center', py: 4 }}><CircularProgress /></Box>
            ) : frames.length === 0 ? (
                <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                    No frames uploaded yet
                </Typography>
            ) : (
                <ImageList cols={3} gap={8}>
                    {frames.map((frame) => (
                        <ImageListItem
                            key={frame.filename}
                            onClick={() => handleSelect(frame.filename)}
                            sx={{
                                cursor: 'pointer',
                                borderRadius: 2,
                                overflow: 'hidden',
                                border: selectedFrame === frame.filename
                                    ? '3px solid #4caf50'
                                    : '3px solid transparent',
                                bgcolor: '#222'
                            }}
                        >
                            <img
                                src={frame.url}
                                alt={frame.filename}
                                style={{ width: '100%', height: 120, objectFit: 'contain' }}
                            />
                            <ImageListItemBar
                                actionIcon={
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        {selectedFrame === frame.filename && (
                                            <CheckCircleIcon sx={{ color: '#4caf50', mr: 1 }} />
                                        )}
                                        <IconButton
                                            sx={{ color: 'white' }}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDelete(frame.filename);
                                            }}
                                        >
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
                                    </Box>
                                }
                            />
                        </ImageListItem>
                    ))}
                </ImageList>
            )}
        </Paper>
    );
};

export default CollageFrameManager;
