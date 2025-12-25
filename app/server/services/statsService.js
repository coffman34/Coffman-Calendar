/**
 * @fileoverview Stats Service - Gamification XP/Gold/Level Management
 * @module services/statsService
 * 
 * EDUCATIONAL NOTES FOR JUNIOR DEVELOPERS:
 * 
 * WHY THIS FILE EXISTS:
 * This service handles all gamification stats (XP, Gold, Levels).
 * It's the "Single Source of Truth" for user progression.
 * 
 * KEY DESIGN DECISIONS:
 * 1. Bidirectional XP: Supports +/- values for anti-abuse (undo on uncheck)
 * 2. Atomic Updates: Each function reads, modifies, saves atomically
 * 3. Level-Up Detection: Returns `leveledUp: true` when threshold crossed
 */

import * as dataService from './dataService.js';

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * XP required per level
 * 
 * JUNIOR DEV NOTE: We use a simple linear formula here.
 * Habitica uses exponential scaling, but for a family kiosk,
 * linear is easier for kids to understand.
 * 
 * Level 1 → 2 = 100 XP
 * Level 2 → 3 = 100 XP
 * ... and so on
 */
const XP_PER_LEVEL = 100;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Calculates level from total XP
 * 
 * FORMULA: level = floor(xp / XP_PER_LEVEL) + 1
 * This means:
 * - 0-99 XP = Level 1
 * - 100-199 XP = Level 2
 * - 200-299 XP = Level 3
 * 
 * @param {number} xp - Total XP accumulated
 * @returns {number} Current level (minimum 1)
 */
export const calculateLevel = (xp) => {
    return Math.floor(Math.max(0, xp) / XP_PER_LEVEL) + 1;
};

/**
 * Calculates XP progress within current level (0-99)
 * 
 * JUNIOR DEV NOTE: This is for the progress bar UI.
 * If user has 250 XP (Level 3), their progress is 50/100.
 * 
 * @param {number} xp - Total XP
 * @returns {number} XP within current level (0 to XP_PER_LEVEL-1)
 */
export const getXPInCurrentLevel = (xp) => {
    return Math.max(0, xp) % XP_PER_LEVEL;
};

/**
 * Ensures userStats exists in data with proper defaults
 * 
 * DEFENSIVE CODING: We never assume data is in the right shape.
 * This function guarantees the structure exists before we use it.
 * 
 * @param {object} data - Full data object from storage
 * @param {string} userId - User ID to ensure exists
 * @returns {object} The user's stats object (mutates data in place)
 */
const ensureUserStats = (data, userId) => {
    // 1. Ensure top-level userStats object exists
    if (!data.userStats) {
        data.userStats = {};
    }

    // 2. Ensure this specific user has a stats entry
    if (!data.userStats[userId]) {
        data.userStats[userId] = {
            level: 1,
            xp: 0,
            gold: 0,
            streak: 0
        };
    }

    return data.userStats[userId];
};

// ============================================================================
// MAIN SERVICE FUNCTIONS
// ============================================================================

/**
 * Gets stats for a specific user
 * 
 * @param {string} userId - User ID
 * @returns {Promise<object>} User stats { level, xp, gold, streak }
 */
export const getUserStats = async (userId) => {
    const data = await dataService.getData();
    const stats = ensureUserStats(data, userId);

    // Calculate derived values
    return {
        ...stats,
        level: calculateLevel(stats.xp),
        xpInLevel: getXPInCurrentLevel(stats.xp),
        xpToNextLevel: XP_PER_LEVEL
    };
};

/**
 * Adds (or removes if negative) XP for a user
 * 
 * ANTI-ABUSE FEATURE: Negative amounts allow "undo" when user unchecks.
 * 
 * @param {string} userId - User ID
 * @param {number} amount - XP to add (can be negative for undo)
 * @returns {Promise<object>} Updated stats + levelUp flag
 */
export const addXP = async (userId, amount) => {
    const data = await dataService.getData();
    const stats = ensureUserStats(data, userId);

    // 1. Calculate level BEFORE adding XP
    const levelBefore = calculateLevel(stats.xp);

    // 2. Add XP (allow negatives, but floor at 0)
    stats.xp = Math.max(0, stats.xp + amount);

    // 3. Calculate level AFTER adding XP
    const levelAfter = calculateLevel(stats.xp);
    stats.level = levelAfter;

    // 4. Persist changes
    await dataService.saveData(data);

    // 5. Return updated stats with level-up detection
    // JUNIOR DEV NOTE: We check if level increased AND amount was positive
    // This prevents "level up!" notification on undo operations
    return {
        ...stats,
        xpInLevel: getXPInCurrentLevel(stats.xp),
        xpToNextLevel: XP_PER_LEVEL,
        leveledUp: amount > 0 && levelAfter > levelBefore
    };
};

/**
 * Adds (or removes if negative) Gold for a user
 * 
 * @param {string} userId - User ID
 * @param {number} amount - Gold to add (can be negative)
 * @returns {Promise<object>} Updated stats
 */
export const addGold = async (userId, amount) => {
    const data = await dataService.getData();
    const stats = ensureUserStats(data, userId);

    // Add gold (floor at 0 to prevent negative gold)
    stats.gold = Math.max(0, stats.gold + amount);

    await dataService.saveData(data);

    return stats;
};

/**
 * Logs a reward redemption for parent visibility
 * 
 * FAMILY FEATURE: When a child "buys" a reward like "Pizza Night",
 * the parent needs to know so they can fulfill it in the real world.
 * 
 * @param {string} userId - User who redeemed
 * @param {string} rewardId - ID of the reward purchased
 * @param {string} rewardTitle - Human-readable reward name
 * @param {number} cost - Gold spent
 * @returns {Promise<object>} The redemption log entry
 */
export const logRedemption = async (userId, rewardId, rewardTitle, cost) => {
    const data = await dataService.getData();

    // Ensure redemption history array exists
    if (!data.redemptionHistory) {
        data.redemptionHistory = [];
    }

    // Create log entry with timestamp
    const entry = {
        id: `redemption-${Date.now()}`,
        userId,
        rewardId,
        rewardTitle,
        cost,
        redeemedAt: new Date().toISOString(),
        fulfilled: false // Parent marks true after giving reward
    };

    // Add to beginning (most recent first)
    data.redemptionHistory.unshift(entry);

    // Keep only last 100 entries to prevent bloat
    if (data.redemptionHistory.length > 100) {
        data.redemptionHistory = data.redemptionHistory.slice(0, 100);
    }

    await dataService.saveData(data);

    return entry;
};

/**
 * Gets redemption history (for parent dashboard)
 * 
 * @param {boolean} unfulfilledOnly - If true, only return unfulfilled
 * @returns {Promise<Array>} List of redemption entries
 */
export const getRedemptionHistory = async (unfulfilledOnly = false) => {
    const data = await dataService.getData();
    const history = data.redemptionHistory || [];

    if (unfulfilledOnly) {
        return history.filter(entry => !entry.fulfilled);
    }

    return history;
};

/**
 * Marks a redemption as fulfilled (parent action)
 * 
 * @param {string} redemptionId - ID of the redemption entry
 * @returns {Promise<boolean>} Success status
 */
export const fulfillRedemption = async (redemptionId) => {
    const data = await dataService.getData();

    if (!data.redemptionHistory) return false;

    const entry = data.redemptionHistory.find(e => e.id === redemptionId);
    if (!entry) return false;

    entry.fulfilled = true;
    entry.fulfilledAt = new Date().toISOString();

    await dataService.saveData(data);

    return true;
};
