import express from 'express';
import * as photoController from '../controllers/photoController.js';
import validate from '../middleware/validate.js';
import {
    downloadSchema,
    photoListSchema,
    photoDeleteSchema
} from '../schemas/photoSchemas.js';

const router = express.Router();

/**
 * Photo Routes
 * 
 * GET /api/photos - List photos (paginated)
 * POST /api/download - Queue a photo download
 * DELETE /api/photos/:filename - Delete a photo
 */

router.get('/', validate(photoListSchema), photoController.listPhotos);
router.post('/download', validate(downloadSchema), photoController.downloadPhoto);
router.delete('/:filename', validate(photoDeleteSchema), photoController.deletePhoto);

export default router;
