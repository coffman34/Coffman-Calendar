/**
 * @fileoverview Rewards Controller - Shop Items CRUD API
 * @module controllers/rewardsController
 */

import * as rewardsService from '../services/rewardsService.js';

/**
 * GET /api/rewards
 * Gets all shop rewards
 */
export const getAllRewards = async (req, res, next) => {
    try {
        const rewards = await rewardsService.getAllRewards();
        res.status(200).json(rewards);
    } catch (err) {
        next(err);
    }
};

/**
 * GET /api/rewards/:id
 * Gets a single reward
 */
export const getReward = async (req, res, next) => {
    try {
        const reward = await rewardsService.getRewardById(req.params.id);
        if (!reward) {
            return res.status(404).json({ error: 'Reward not found' });
        }
        res.status(200).json(reward);
    } catch (err) {
        next(err);
    }
};

/**
 * POST /api/rewards
 * Creates a new shop reward
 */
export const createReward = async (req, res, next) => {
    try {
        const reward = await rewardsService.createReward(req.body);
        res.status(201).json(reward);
    } catch (err) {
        next(err);
    }
};

/**
 * PUT /api/rewards/:id
 * Updates a reward
 */
export const updateReward = async (req, res, next) => {
    try {
        const reward = await rewardsService.updateReward(req.params.id, req.body);
        if (!reward) {
            return res.status(404).json({ error: 'Reward not found' });
        }
        res.status(200).json(reward);
    } catch (err) {
        next(err);
    }
};

/**
 * DELETE /api/rewards/:id
 * Deletes a reward
 */
export const deleteReward = async (req, res, next) => {
    try {
        const success = await rewardsService.deleteReward(req.params.id);
        if (!success) {
            return res.status(404).json({ error: 'Reward not found' });
        }
        res.status(200).json({ success: true });
    } catch (err) {
        next(err);
    }
};

/**
 * POST /api/rewards/seed
 * Seeds default rewards (admin action)
 */
export const seedRewards = async (req, res, next) => {
    try {
        await rewardsService.seedDefaultRewards();
        const rewards = await rewardsService.getAllRewards();
        res.status(200).json(rewards);
    } catch (err) {
        next(err);
    }
};
