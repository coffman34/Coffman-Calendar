import express from 'express';
import * as systemController from '../controllers/systemController.js';

const router = express.Router();

router.post('/reboot', systemController.reboot);

export default router;
