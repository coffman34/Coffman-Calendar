import express from 'express';
import cors from 'cors';
import fs from 'fs-extra';
import path from 'path';
import axios from 'axios';
import { exec } from 'child_process';
import { fileURLToPath } from 'url';
import { createFrameRoutes } from './frameRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;
const STORAGE_DIR = path.join(__dirname, 'storage');

// Ensure storage directory exists
fs.ensureDirSync(STORAGE_DIR);

app.use(cors());
app.use(express.json());

// ===== BROWSER CACHING CONFIGURATION =====
const staticOptions = {
    maxAge: '1d',
    immutable: true
};

app.use('/api/storage', express.static(STORAGE_DIR, staticOptions));

// Register frame routes
app.use('/api/frames', createFrameRoutes(STORAGE_DIR, staticOptions));

// ===== IN-MEMORY METADATA STORE =====
let photoCache = [];

const initializePhotoCache = async () => {
    try {
        const files = await fs.readdir(STORAGE_DIR);
        const stats = await Promise.all(
            files.map(async (f) => ({
                filename: f,
                stat: await fs.stat(path.join(STORAGE_DIR, f))
            }))
        );

        photoCache = stats
            .filter(({ filename, stat }) =>
                !filename.startsWith('.') &&
                !filename.includes('_thumb.') &&
                !filename.endsWith('.json') &&
                stat.isFile()
            )
            .map(({ filename, stat }) => {
                const ext = path.extname(filename).toLowerCase();
                const base = path.basename(filename, ext);
                const hasThumb = files.includes(`${base}_thumb.jpg`);

                return {
                    filename,
                    url: `/api/storage/${filename}`,
                    thumbnailUrl: hasThumb ? `/api/storage/${base}_thumb.jpg` : null,
                    type: ext === '.mp4' ? 'video' : 'image',
                    mtime: stat.mtime.getTime()
                };
            })
            .sort((a, b) => b.mtime - a.mtime); // Newest first

        console.log(`Photo cache initialized: ${photoCache.length} files`);
    } catch (err) {
        console.error('Failed to initialize photo cache:', err);
        photoCache = [];
    }
};

const addPhotoToCache = (filename, type = 'image') => {
    const ext = path.extname(filename).toLowerCase();

    const photo = {
        filename,
        url: `/api/storage/${filename}`,
        thumbnailUrl: null,
        type: type || (ext === '.mp4' ? 'video' : 'image'),
        mtime: Date.now()
    };

    photoCache.unshift(photo);
    console.log(`Added to cache: ${filename}`);
};

const removePhotoFromCache = (filename) => {
    photoCache = photoCache.filter(p => p.filename !== filename);
    console.log(`Removed from cache: ${filename}`);
};

// Initialize cache on startup
initializePhotoCache();

// ===== DOWNLOAD CONCURRENCY CONTROL =====
let activeDownloads = 0;
const MAX_CONCURRENT_DOWNLOADS = 3;
const downloadQueue = [];

const handleDownload = async (req, res) => {
    const { url, filename, _ownerId, mimeType, accessToken } = req.body;

    if (!url || !filename) {
        return res.status(400).json({ error: 'Missing url or filename' });
    }

    try {
        const cleanFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
        const filePath = path.join(STORAGE_DIR, cleanFilename);

        if (await fs.pathExists(filePath)) {
            console.log(`File exists: ${cleanFilename}`);
            return res.json({
                success: true,
                filename: cleanFilename,
                url: `/api/storage/${cleanFilename}`
            });
        }

        console.log(`Downloading: ${cleanFilename}`);

        const headers = {};
        if (accessToken) {
            headers['Authorization'] = `Bearer ${accessToken}`;
        }

        const response = await axios({
            method: 'GET',
            url: url,
            responseType: 'stream',
            headers: headers
        });

        const writer = fs.createWriteStream(filePath);
        response.data.pipe(writer);

        return new Promise((resolve) => {
            writer.on('finish', () => {
                const type = mimeType?.startsWith('video/') ? 'video' : 'image';
                addPhotoToCache(cleanFilename, type);
                res.json({
                    success: true,
                    filename: cleanFilename,
                    url: `/api/storage/${cleanFilename}`
                });
                resolve();
            });
            writer.on('error', (err) => {
                console.error('Stream error:', err);
                res.status(500).json({ error: 'Failed to write file' });
                resolve();
            });
        });

    } catch (err) {
        console.error('Download error:', err.message);
        res.status(500).json({ error: 'Failed to download file' });
    }
};

const processQueue = async () => {
    if (activeDownloads >= MAX_CONCURRENT_DOWNLOADS || downloadQueue.length === 0) return;

    activeDownloads++;
    const { req, res } = downloadQueue.shift();

    try {
        await handleDownload(req, res);
    } finally {
        activeDownloads--;
        processQueue();
    }
};

// ===== API ENDPOINTS =====

// List photos with pagination
app.get('/api/photos', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 1000;
        const skip = (page - 1) * limit;

        const paginatedPhotos = photoCache.slice(skip, skip + limit);

        res.json({
            data: paginatedPhotos,
            pagination: {
                total: photoCache.length,
                page,
                limit,
                totalPages: Math.ceil(photoCache.length / limit)
            }
        });
    } catch (err) {
        console.error('List error:', err);
        res.status(500).json({ error: 'Failed to list photos' });
    }
});

// Download a photo (with queue)
app.post('/api/download', (req, res) => {
    downloadQueue.push({ req, res });
    processQueue();
});

// Delete a photo
app.delete('/api/photos/:filename', async (req, res) => {
    const { filename } = req.params;
    try {
        const filePath = path.join(STORAGE_DIR, filename);
        if (await fs.pathExists(filePath)) {
            await fs.remove(filePath);
            removePhotoFromCache(filename);
            res.json({ success: true });
        } else {
            res.status(404).json({ error: 'File not found' });
        }
    } catch {
        res.status(500).json({ error: 'Failed to delete file' });
    }
});

// Get persistent data
app.get('/api/data', async (req, res) => {
    try {
        const dataPath = path.join(STORAGE_DIR, 'data.json');
        if (await fs.pathExists(dataPath)) {
            const data = await fs.readJson(dataPath);
            res.json(data);
        } else {
            res.json({});
        }
    } catch (err) {
        console.error('Data read error:', err);
        res.status(500).json({ error: 'Failed to read data' });
    }
});

// Save persistent data
app.post('/api/data', async (req, res) => {
    try {
        const dataPath = path.join(STORAGE_DIR, 'data.json');
        await fs.writeJson(dataPath, req.body);
        res.json({ success: true });
    } catch (err) {
        console.error('Data write error:', err);
        res.status(500).json({ error: 'Failed to save data' });
    }
});

// Reboot the kiosk system
app.post('/api/system/reboot', (req, res) => {
    console.log('Reboot requested');
    res.json({ success: true, message: 'Rebooting...' });
    setTimeout(() => {
        exec('sudo reboot', (err) => {
            if (err) console.error('Reboot failed:', err);
        });
    }, 1000);
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Storage path: ${STORAGE_DIR}`);
});
