// Local cache for calendar events (for offline/fast loading)
const CACHE_KEY = 'coffman_calendar_events_cache';

/**
 * Cache events for a user
 */
export const cacheEvents = (userId, events) => {
    const cache = getFullCache();
    cache[userId] = { events, timestamp: Date.now() };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
};

/**
 * Get cached events for a user
 */
export const getCachedEvents = (userId) => {
    const cache = getFullCache();
    return cache[userId]?.events || [];
};

/**
 * Check if cache is fresh (less than 5 minutes old)
 */
export const isCacheFresh = (userId) => {
    const cache = getFullCache();
    const userCache = cache[userId];
    if (!userCache) return false;
    return Date.now() - userCache.timestamp < 5 * 60 * 1000;
};

/**
 * Clear cache for a user
 */
export const clearCache = (userId) => {
    const cache = getFullCache();
    delete cache[userId];
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
};

const getFullCache = () => {
    const stored = localStorage.getItem(CACHE_KEY);
    return stored ? JSON.parse(stored) : {};
};
