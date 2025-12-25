import express from 'express';
import * as frameController from '../controllers/frameController.js';
import { uploadMiddleware, getFramesDir } from '../services/frameService.js';
import validate from '../middleware/validate.js';
import { frameDeleteSchema } from '../schemas/frameSchemas.js';

const router = express.Router();

/**
 * Frame Routes
 * 
 * NOTE: We also serve the static files for frames here.
 * This keeps the frame-related logic encapsulated in this route module.
 */

// Static file serving for frames
router.use('/storage', express.static(getFramesDir()));

router.get('/', frameController.listFrames);
router.post('/', uploadMiddleware, frameController.uploadFrame);
router.delete('/:filename', validate(frameDeleteSchema), frameController.deleteFrame);

export default router;
