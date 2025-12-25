/**
 * @fileoverview Rewards Service - Shop Items CRUD
 * @module services/rewardsService
 * 
 * EDUCATIONAL NOTES FOR JUNIOR DEVELOPERS:
 * 
 * WHY THIS FILE EXISTS:
 * The reward shop lets users spend Gold on real-world rewards.
 * Parents define rewards ("Pizza Night", "30 min Gaming").
 * Kids buy them with earned Gold.
 * 
 * This service handles the shop item CRUD.
 * Actual purchasing logic uses statsService for Gold deduction.
 */

import * as dataService from './dataService.js';
import { randomUUID } from 'crypto';

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Ensures rewardsStore array exists in data
 * 
 * @param {object} data - Full data object
 * @returns {Array} The rewards array
 */
const ensureRewardsArray = (data) => {
    if (!Array.isArray(data.rewardsStore)) {
        data.rewardsStore = [];
    }
    return data.rewardsStore;
};

// ============================================================================
// CRUD OPERATIONS
// ============================================================================

/**
 * Gets all available shop rewards
 * 
 * @returns {Promise<Array>} List of reward items
 */
export const getAllRewards = async () => {
    const data = await dataService.getData();
    return ensureRewardsArray(data);
};

/**
 * Gets a single reward by ID
 * 
 * @param {string} rewardId - Reward ID
 * @returns {Promise<object|null>} Reward object or null
 */
export const getRewardById = async (rewardId) => {
    const data = await dataService.getData();
    const rewards = ensureRewardsArray(data);
    return rewards.find(r => r.id === rewardId) || null;
};

/**
 * Creates a new shop reward
 * 
 * @param {object} rewardData - Reward data
 * @param {string} rewardData.title - Display name (e.g., "Pizza Night")
 * @param {number} rewardData.cost - Gold cost to purchase
 * @param {string} [rewardData.icon] - Emoji or icon name
 * @param {string} [rewardData.description] - Optional description
 * @returns {Promise<object>} The created reward
 */
export const createReward = async (rewardData) => {
    const data = await dataService.getData();
    const rewards = ensureRewardsArray(data);

    const newReward = {
        id: randomUUID(),
        title: rewardData.title || 'New Reward',
        cost: rewardData.cost ?? 50,
        icon: rewardData.icon || '🎁',
        description: rewardData.description || '',
        createdAt: new Date().toISOString()
    };

    rewards.push(newReward);
    await dataService.saveData(data);

    return newReward;
};

/**
 * Updates an existing reward
 * 
 * @param {string} rewardId - Reward ID
 * @param {object} updates - Fields to update
 * @returns {Promise<object|null>} Updated reward or null if not found
 */
export const updateReward = async (rewardId, updates) => {
    const data = await dataService.getData();
    const rewards = ensureRewardsArray(data);

    const index = rewards.findIndex(r => r.id === rewardId);
    if (index === -1) return null;

    // Merge updates (protect id and createdAt)
    const { id, createdAt, ...safeUpdates } = updates;
    rewards[index] = { ...rewards[index], ...safeUpdates };

    await dataService.saveData(data);

    return rewards[index];
};

/**
 * Deletes a reward from the shop
 * 
 * @param {string} rewardId - Reward ID
 * @returns {Promise<boolean>} True if deleted, false if not found
 */
export const deleteReward = async (rewardId) => {
    const data = await dataService.getData();
    const rewards = ensureRewardsArray(data);

    const index = rewards.findIndex(r => r.id === rewardId);
    if (index === -1) return false;

    rewards.splice(index, 1);
    await dataService.saveData(data);

    return true;
};

/**
 * Seeds default rewards if none exist
 * 
 * JUNIOR DEV NOTE: This is called on app startup to provide
 * example rewards for new installations.
 * 
 * @returns {Promise<void>}
 */
export const seedDefaultRewards = async () => {
    const data = await dataService.getData();
    const rewards = ensureRewardsArray(data);

    // Only seed if empty
    if (rewards.length > 0) return;

    const defaults = [
        { title: '30 min Gaming', cost: 50, icon: '🎮' },
        { title: 'Movie Night Pick', cost: 100, icon: '🎬' },
        { title: 'Ice Cream', cost: 30, icon: '🍦' },
        { title: 'Stay Up Late (30 min)', cost: 75, icon: '🌙' },
        { title: 'Pizza Night', cost: 150, icon: '🍕' }
    ];

    for (const reward of defaults) {
        rewards.push({
            id: randomUUID(),
            ...reward,
            description: '',
            createdAt: new Date().toISOString()
        });
    }

    await dataService.saveData(data);
};
