import * as frameService from '../services/frameService.js';
import AppError from '../utils/AppError.js';

/**
 * Frame Controller
 */

export const listFrames = async (req, res, next) => {
    try {
        const frames = await frameService.listFrames();
        res.status(200).json(frames);
    } catch (err) {
        next(err);
    }
};

export const uploadFrame = (req, res, next) => {
    // Multer middleware runs before this, so if we reach here, 
    // the file is already uploaded (or an error occurred).

    // Check if file existed
    if (!req.file) {
        return next(new AppError('No file uploaded', 400));
    }

    // Success response
    res.status(201).json({
        success: true,
        filename: req.file.filename,
        url: `/api/frames/storage/${req.file.filename}`
    });
};

export const deleteFrame = async (req, res, next) => {
    try {
        await frameService.deleteFrame(req.params.filename);
        res.status(200).json({ success: true, message: 'Frame deleted' });
    } catch (err) {
        next(err);
    }
};
