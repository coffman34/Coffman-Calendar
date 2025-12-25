import express from 'express';
import * as dataController from '../controllers/dataController.js';

const router = express.Router();

router.get('/', dataController.getData);
router.post('/', dataController.saveData);

export default router;
