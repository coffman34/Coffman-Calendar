import fs from 'fs-extra';
import path from 'path';
import axios from 'axios';
import { fileURLToPath } from 'url';
import AppError from '../utils/AppError.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define storage directory relative to this service file
// services/ -> server/ -> storage/
const STORAGE_DIR = path.join(__dirname, '..', 'storage');

// ===== STATE MANAGEMENT (Singleton Scope) =====
// * SENIOR MENTOR NOTE:
// Since Node modules are cached, these variables act as our "in-memory database".
// In a larger app, we'd use Redis or a real DB, but for a kiosk, this is efficient.
let photoCache = [];
let activeDownloads = 0;
const MAX_CONCURRENT_DOWNLOADS = 3;
const downloadQueue = [];

/**
 * Initializes the photo cache by reading the storage directory.
 */
export const initializePhotoCache = async () => {
    try {
        await fs.ensureDir(STORAGE_DIR);
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

        console.log(`[PhotoService] Cache initialized: ${photoCache.length} files`);
    } catch (err) {
        console.error('[PhotoService] Failed to initialize cache:', err);
        photoCache = [];
        // We don't throw here to avoid crashing the server on boot, 
        // but we log it as a critical error.
    }
};

/**
 * Adds a new photo to the in-memory cache.
 */
const addPhotoToCache = (filename, type = 'image') => {
    const ext = path.extname(filename).toLowerCase();

    const photo = {
        filename,
        url: `/api/storage/${filename}`,
        thumbnailUrl: null, // New downloads usually don't have thumbs yet
        type: type || (ext === '.mp4' ? 'video' : 'image'),
        mtime: Date.now()
    };

    photoCache.unshift(photo);
    console.log(`[PhotoService] Added to cache: ${filename}`);
};

/**
 * Removes a photo from the in-memory cache.
 */
const removePhotoFromCache = (filename) => {
    photoCache = photoCache.filter(p => p.filename !== filename);
    console.log(`[PhotoService] Removed from cache: ${filename}`);
};

/**
 * Lists photos with pagination support.
 */
export const getPhotos = async ({ page = 1, limit = 1000 }) => {
    const skip = (page - 1) * limit;
    const paginatedPhotos = photoCache.slice(skip, skip + limit);

    return {
        data: paginatedPhotos,
        pagination: {
            total: photoCache.length,
            page,
            limit,
            totalPages: Math.ceil(photoCache.length / limit)
        }
    };
};

/**
 * Deletes a photo from disk and cache.
 */
export const deletePhoto = async (filename) => {
    const filePath = path.join(STORAGE_DIR, filename);

    if (!(await fs.pathExists(filePath))) {
        throw new AppError('File not found', 404);
    }

    try {
        await fs.remove(filePath);
        removePhotoFromCache(filename);
    } catch (err) {
        throw new AppError(`Failed to delete file: ${err.message}`, 500);
    }
};

/**
 * Internal worker to process the download queue.
 */
const processQueue = async () => {
    if (activeDownloads >= MAX_CONCURRENT_DOWNLOADS || downloadQueue.length === 0) return;

    activeDownloads++;
    const { task, resolve, reject } = downloadQueue.shift();

    try {
        const result = await task();
        resolve(result);
    } catch (err) {
        reject(err);
    } finally {
        activeDownloads--;
        processQueue();
    }
};

/**
 * Queues a photo download.
 * Returns a promise that resolves when the download is complete.
 */
export const downloadPhoto = ({ url, filename, mimeType, accessToken }) => {
    return new Promise((resolve, reject) => {
        // We wrap the actual work in a "task" function
        const task = async () => {
            const cleanFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
            const filePath = path.join(STORAGE_DIR, cleanFilename);

            // Check if file already exists
            if (await fs.pathExists(filePath)) {
                console.log(`[PhotoService] File exists: ${cleanFilename}`);
                return {
                    success: true,
                    filename: cleanFilename,
                    url: `/api/storage/${cleanFilename}`,
                    cached: true
                };
            }

            console.log(`[PhotoService] Downloading: ${cleanFilename}`);

            const headers = {};
            if (accessToken) {
                headers['Authorization'] = `Bearer ${accessToken}`;
            }

            try {
                const response = await axios({
                    method: 'GET',
                    url: url,
                    responseType: 'stream',
                    headers: headers
                });

                const writer = fs.createWriteStream(filePath);
                response.data.pipe(writer);

                // Wait for stream to finish
                await new Promise((streamResolve, streamReject) => {
                    writer.on('finish', streamResolve);
                    writer.on('error', streamReject);
                });

                const type = mimeType?.startsWith('video/') ? 'video' : 'image';
                addPhotoToCache(cleanFilename, type);

                return {
                    success: true,
                    filename: cleanFilename,
                    url: `/api/storage/${cleanFilename}`
                };

            } catch (err) {
                // Cleanup partial file if error
                if (await fs.pathExists(filePath)) {
                    await fs.remove(filePath).catch(() => { });
                }
                // Determine if it was an upstream error or local I/O
                const status = err.response?.status || 500;
                throw new AppError(`Download failed: ${err.message}`, status);
            }
        };

        // Push to queue
        downloadQueue.push({ task, resolve, reject });
        processQueue();
    });
};
