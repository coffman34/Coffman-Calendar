/**
 * @fileoverview useGamification Hook - Central User Stats Management
 * @module modules/rewards/hooks/useGamification
 * 
 * EDUCATIONAL NOTES FOR JUNIOR DEVELOPERS:
 * 
 * WHY THIS EXISTS:
 * Central hook for managing user XP, Level, and Gold.
 * Used by both Routines and Tasks to award/revoke rewards.
 */

import { useState, useEffect, useCallback, useContext } from 'react';
import { UserContext } from '../../users/UserContextCore';
import { useUI } from '../../ui/useUI';

// ============================================================================
// API FUNCTIONS
// ============================================================================

const API_BASE = '/api';

/**
 * Fetches user stats from backend
 */
const fetchUserStats = async (userId) => {
    const response = await fetch(`${API_BASE}/stats/${userId}`);
    if (!response.ok) throw new Error('Failed to fetch stats');
    return response.json();
};

/**
 * Updates XP (positive or negative)
 */
const updateXPApi = async (userId, amount) => {
    const response = await fetch(`${API_BASE}/stats/${userId}/xp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount })
    });
    if (!response.ok) throw new Error('Failed to update XP');
    return response.json();
};

/**
 * Updates Gold (positive or negative)
 */
const updateGoldApi = async (userId, amount) => {
    const response = await fetch(`${API_BASE}/stats/${userId}/gold`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount })
    });
    if (!response.ok) throw new Error('Failed to update gold');
    return response.json();
};

/**
 * Redeems a reward (deducts gold + logs)
 */
const redeemRewardApi = async (userId, rewardId, rewardTitle, cost) => {
    const response = await fetch(`${API_BASE}/stats/${userId}/redeem`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rewardId, rewardTitle, cost })
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to redeem');
    }
    return response.json();
};

/**
 * Gets all shop rewards
 */
const fetchRewards = async () => {
    const response = await fetch(`${API_BASE}/rewards`);
    if (!response.ok) throw new Error('Failed to fetch rewards');
    return response.json();
};

/**
 * Gets redemption history
 */
const fetchRedemptions = async (unfulfilledOnly = false) => {
    const url = unfulfilledOnly
        ? `${API_BASE}/stats/redemptions/all?unfulfilled=true`
        : `${API_BASE}/stats/redemptions/all`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch redemptions');
    return response.json();
};

// ============================================================================
// HOOK
// ============================================================================

/**
 * useGamification Hook
 * 
 * Provides XP, Level, Gold management for the current user.
 * 
 * @returns {object} Stats and actions
 */
export const useGamification = () => {
    const { currentUser } = useContext(UserContext);
    const { showNotification } = useUI();

    // State
    const [stats, setStats] = useState({
        level: 1,
        xp: 0,
        xpInLevel: 0,
        xpToNextLevel: 100,
        gold: 0,
        streak: 0
    });
    const [shopItems, setShopItems] = useState([]);
    const [redemptions, setRedemptions] = useState([]);
    const [loading, setLoading] = useState(false);

    // ========================================================================
    // DATA LOADING
    // ========================================================================

    const loadStats = useCallback(async () => {
        if (!currentUser?.id) return;

        setLoading(true);
        try {
            const data = await fetchUserStats(currentUser.id);
            setStats(data);
        } catch (err) {
            console.error('[useGamification] Failed to load stats:', err);
        } finally {
            setLoading(false);
        }
    }, [currentUser?.id]);

    const loadShopItems = useCallback(async () => {
        try {
            const items = await fetchRewards();
            setShopItems(items);
        } catch (err) {
            console.error('[useGamification] Failed to load shop:', err);
        }
    }, []);

    const loadRedemptions = useCallback(async () => {
        try {
            const history = await fetchRedemptions(false);
            setRedemptions(history);
        } catch (err) {
            console.error('[useGamification] Failed to load redemptions:', err);
        }
    }, []);

    // Initial load
    useEffect(() => {
        loadStats();
        loadShopItems();
        loadRedemptions();
    }, [loadStats, loadShopItems, loadRedemptions]);

    // ========================================================================
    // ACTIONS
    // ========================================================================

    /**
     * Awards XP to current user
     */
    const awardXP = useCallback(async (amount) => {
        if (!currentUser?.id) return null;

        // Optimistic update
        setStats(prev => ({
            ...prev,
            xp: prev.xp + amount,
            xpInLevel: (prev.xpInLevel + amount) % 100
        }));

        try {
            const result = await updateXPApi(currentUser.id, amount);
            setStats(result);

            if (result.leveledUp) {
                showNotification(`🎉 Level Up! You're now Level ${result.level}!`, 'success');
            }

            return result;
        } catch (err) {
            // Rollback
            await loadStats();
            showNotification('Failed to update XP', 'error');
            return null;
        }
    }, [currentUser?.id, showNotification, loadStats]);

    /**
     * Revokes XP (for undo)
     */
    const revokeXP = useCallback(async (amount) => {
        return awardXP(-amount);
    }, [awardXP]);

    /**
     * Awards Gold to current user
     */
    const awardGold = useCallback(async (amount) => {
        if (!currentUser?.id) return null;

        // Optimistic update
        setStats(prev => ({
            ...prev,
            gold: prev.gold + amount
        }));

        try {
            const result = await updateGoldApi(currentUser.id, amount);
            setStats(prev => ({ ...prev, gold: result.gold }));
            return result;
        } catch (err) {
            await loadStats();
            return null;
        }
    }, [currentUser?.id, loadStats]);

    /**
     * Revokes Gold (for undo)
     */
    const revokeGold = useCallback(async (amount) => {
        return awardGold(-amount);
    }, [awardGold]);

    /**
     * Purchases a reward from the shop
     */
    const purchaseReward = useCallback(async (reward) => {
        if (!currentUser?.id) return false;

        // Check if user has enough gold
        if (stats.gold < reward.cost) {
            showNotification("Not enough gold!", 'error');
            return false;
        }

        try {
            await redeemRewardApi(currentUser.id, reward.id, reward.title, reward.cost);

            // Update local state
            setStats(prev => ({
                ...prev,
                gold: prev.gold - reward.cost
            }));

            // Reload redemptions
            await loadRedemptions();

            showNotification(`🎁 Redeemed: ${reward.title}!`, 'success');
            return true;
        } catch (err) {
            showNotification(err.message || 'Failed to redeem reward', 'error');
            return false;
        }
    }, [currentUser?.id, stats.gold, showNotification, loadRedemptions]);

    // ========================================================================
    // RETURN
    // ========================================================================

    return {
        // Stats
        level: stats.level,
        xp: stats.xp,
        xpInLevel: stats.xpInLevel,
        xpToNextLevel: stats.xpToNextLevel,
        gold: stats.gold,
        streak: stats.streak,
        loading,

        // Shop
        shopItems,
        redemptions,

        // Actions
        awardXP,
        revokeXP,
        awardGold,
        revokeGold,
        purchaseReward,

        // Refresh
        refresh: loadStats,
        refreshShop: loadShopItems,
        refreshRedemptions: loadRedemptions
    };
};
