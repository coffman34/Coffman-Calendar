import * as photoService from '../services/photoService.js';

/**
 * Photo Controller
 * 
 * * SENIOR MENTOR NOTE:
 * Notice how clean this controller is? It only handles:
 * 1. Extracting data from 'req'
 * 2. Calling the service
 * 3. Sending the 'res'
 * 
 * All complex logic, caching, and error handling specifics are elsewhere.
 */

export const listPhotos = async (req, res, next) => {
    try {
        // Validation middleware already ensured 'page' and 'limit' are correct types
        const result = await photoService.getPhotos(req.query);
        res.status(200).json(result);
    } catch (err) {
        next(err);
    }
};

export const downloadPhoto = async (req, res, next) => {
    try {
        // Extract validated body data
        const { url, filename, mimeType, accessToken } = req.body;

        // This is async and might wait in queue
        const result = await photoService.downloadPhoto({
            url,
            filename,
            mimeType,
            accessToken
        });

        res.status(200).json(result);
    } catch (err) {
        next(err);
    }
};

export const deletePhoto = async (req, res, next) => {
    try {
        const { filename } = req.params;
        await photoService.deletePhoto(filename);

        res.status(200).json({ success: true, message: 'Photo deleted' });
    } catch (err) {
        next(err);
    }
};
