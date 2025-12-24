import express from 'express';
import fs from 'fs-extra';
import path from 'path';
import multer from 'multer';

export function createFrameRoutes(storageDir, staticOptions = {}) {
    const router = express.Router();
    const FRAMES_DIR = path.join(storageDir, 'frames');

    // Ensure frames directory exists
    fs.ensureDirSync(FRAMES_DIR);

    // Configure multer for frame uploads
    const upload = multer({
        storage: multer.diskStorage({
            destination: (req, file, cb) => cb(null, FRAMES_DIR),
            filename: (req, file, cb) => {
                const clean = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
                cb(null, `${Date.now()}_${clean}`);
            }
        }),
        fileFilter: (req, file, cb) => {
            const allowed = ['image/png', 'image/webp'];
            cb(null, allowed.includes(file.mimetype));
        },
        limits: { fileSize: 10 * 1024 * 1024 } // 10MB max
    });

    // Serve static frame files with caching
    router.use('/storage', express.static(FRAMES_DIR, staticOptions));

    // List all frames
    router.get('/', async (req, res) => {
        try {
            const files = await fs.readdir(FRAMES_DIR);
            const frames = files
                .filter(f => !f.startsWith('.'))
                .map(f => ({
                    filename: f,
                    url: `/api/frames/storage/${f}`
                }));
            res.json(frames);
        } catch (err) {
            console.error('List frames error:', err);
            res.status(500).json({ error: 'Failed to list frames' });
        }
    });

    // Upload a new frame
    router.post('/', upload.single('frame'), (req, res) => {
        console.log('Frame upload request received');
        console.log('File:', req.file);
        console.log('Body:', req.body);

        if (!req.file) {
            console.error('No file in request');
            return res.status(400).json({ error: 'No PNG/WebP file uploaded' });
        }

        console.log('Frame uploaded successfully:', req.file.filename);
        res.json({
            success: true,
            filename: req.file.filename,
            url: `/api/frames/storage/${req.file.filename}`
        });
    });

    // Delete a frame
    router.delete('/:filename', async (req, res) => {
        const { filename } = req.params;
        try {
            const filePath = path.join(FRAMES_DIR, filename);
            if (await fs.pathExists(filePath)) {
                await fs.remove(filePath);
                res.json({ success: true });
            } else {
                res.status(404).json({ error: 'Frame not found' });
            }
        } catch {
            res.status(500).json({ error: 'Failed to delete frame' });
        }
    });

    return router;
}
