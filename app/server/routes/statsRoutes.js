/**
 * @fileoverview Stats Routes - XP/Gold/Redemption API
 * @module routes/statsRoutes
 */

import express from 'express';
import * as statsController from '../controllers/statsController.js';

const router = express.Router();

// User stats
router.get('/:userId', statsController.getUserStats);
router.post('/:userId/xp', statsController.updateXP);
router.post('/:userId/gold', statsController.updateGold);
router.post('/:userId/redeem', statsController.redeemReward);

// Redemption history (for parents)
router.get('/redemptions/all', statsController.getRedemptions);
router.post('/redemptions/:id/fulfill', statsController.fulfillRedemption);

export default router;
