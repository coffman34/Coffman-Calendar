/**
 * @fileoverview Stats Controller - XP/Gold API Endpoints
 * @module controllers/statsController
 * 
 * JUNIOR DEV NOTE: Controllers handle HTTP logic.
 * They validate input, call services, and format responses.
 */

import * as statsService from '../services/statsService.js';

/**
 * GET /api/stats/:userId
 * Gets stats for a specific user
 */
export const getUserStats = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const stats = await statsService.getUserStats(userId);
        res.status(200).json(stats);
    } catch (err) {
        next(err);
    }
};

/**
 * POST /api/stats/:userId/xp
 * Adds or removes XP
 * Body: { amount: number }
 */
export const updateXP = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const { amount } = req.body;

        if (typeof amount !== 'number') {
            return res.status(400).json({ error: 'Amount must be a number' });
        }

        const result = await statsService.addXP(userId, amount);
        res.status(200).json(result);
    } catch (err) {
        next(err);
    }
};

/**
 * POST /api/stats/:userId/gold
 * Adds or removes Gold
 * Body: { amount: number }
 */
export const updateGold = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const { amount } = req.body;

        if (typeof amount !== 'number') {
            return res.status(400).json({ error: 'Amount must be a number' });
        }

        const result = await statsService.addGold(userId, amount);
        res.status(200).json(result);
    } catch (err) {
        next(err);
    }
};

/**
 * POST /api/stats/:userId/redeem
 * Redeems a reward (deducts gold + logs for parent)
 * Body: { rewardId, rewardTitle, cost }
 */
export const redeemReward = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const { rewardId, rewardTitle, cost } = req.body;

        // 1. Check user has enough gold
        const stats = await statsService.getUserStats(userId);
        if (stats.gold < cost) {
            return res.status(400).json({ error: 'Not enough gold' });
        }

        // 2. Deduct gold
        await statsService.addGold(userId, -cost);

        // 3. Log redemption for parent
        const entry = await statsService.logRedemption(userId, rewardId, rewardTitle, cost);

        res.status(200).json({ success: true, redemption: entry });
    } catch (err) {
        next(err);
    }
};

/**
 * GET /api/redemptions
 * Gets redemption history (for parent dashboard)
 * Query: ?unfulfilled=true
 */
export const getRedemptions = async (req, res, next) => {
    try {
        const unfulfilledOnly = req.query.unfulfilled === 'true';
        const history = await statsService.getRedemptionHistory(unfulfilledOnly);
        res.status(200).json(history);
    } catch (err) {
        next(err);
    }
};

/**
 * POST /api/redemptions/:id/fulfill
 * Marks a redemption as fulfilled (parent action)
 */
export const fulfillRedemption = async (req, res, next) => {
    try {
        const { id } = req.params;
        const success = await statsService.fulfillRedemption(id);

        if (!success) {
            return res.status(404).json({ error: 'Redemption not found' });
        }

        res.status(200).json({ success: true });
    } catch (err) {
        next(err);
    }
};
