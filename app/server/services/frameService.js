import fs from 'fs-extra';
import path from 'path';
import multer from 'multer';
import { fileURLToPath } from 'url';
import AppError from '../utils/AppError.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const STORAGE_DIR = path.join(__dirname, '..', 'storage');
const FRAMES_DIR = path.join(STORAGE_DIR, 'frames');

// Ensure frames directory exists on module load
fs.ensureDirSync(FRAMES_DIR);

/**
 * Configure Multer for Frame Uploads
 * 
 * * SENIOR MENTOR NOTE:
 * We keep the upload configuration here in the service layer because it deals 
 * with file system specifics (paths, naming conventions). The controller
 * shouldn't need to know *how* files are stored, just that they are.
 */
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, FRAMES_DIR),
    filename: (req, file, cb) => {
        const clean = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
        cb(null, `${Date.now()}_${clean}`);
    }
});

const fileFilter = (req, file, cb) => {
    const allowed = ['image/png', 'image/webp'];
    if (allowed.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new AppError('Only .png and .webp formats allowed!', 400), false);
    }
};

export const uploadMiddleware = multer({
    storage,
    fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
}).single('frame');


/**
 * Lists all available frames.
 */
export const listFrames = async () => {
    try {
        const files = await fs.readdir(FRAMES_DIR);
        return files
            .filter(f => !f.startsWith('.'))
            .map(f => ({
                filename: f,
                url: `/api/frames/storage/${f}`
            }));
    } catch (err) {
        throw new AppError(`Failed to list frames: ${err.message}`, 500);
    }
};

/**
 * Deletes a frame by filename.
 */
export const deleteFrame = async (filename) => {
    const filePath = path.join(FRAMES_DIR, filename);

    if (await fs.pathExists(filePath)) {
        await fs.remove(filePath);
    } else {
        throw new AppError('Frame not found', 404);
    }
};

export const getFramesDir = () => FRAMES_DIR;
