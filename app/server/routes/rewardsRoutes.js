/**
 * @fileoverview Rewards Routes - Shop CRUD API
 * @module routes/rewardsRoutes
 */

import express from 'express';
import * as rewardsController from '../controllers/rewardsController.js';

const router = express.Router();

// CRUD
router.get('/', rewardsController.getAllRewards);
router.get('/:id', rewardsController.getReward);
router.post('/', rewardsController.createReward);
router.put('/:id', rewardsController.updateReward);
router.delete('/:id', rewardsController.deleteReward);

// Seed default rewards
router.post('/seed', rewardsController.seedRewards);

export default router;
