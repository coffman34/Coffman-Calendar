/**
 * @fileoverview Local Tasks Service - CRUD and gamification for local tasks
 * @module services/localTasksService
 * 
 * EDUCATIONAL NOTES FOR JUNIOR DEVELOPERS:
 * 
 * WHY THIS EXISTS:
 * This service manages "local tasks" - tasks stored in our backend
 * that don't sync to Google Tasks. This allows:
 * - Users without Google accounts to use tasks
 * - Recurring tasks that reset daily/weekly
 * - XP/Gold rewards for gamification
 * 
 * DESIGN PATTERN: Service Layer
 * All business logic is here; the controller just handles HTTP.
 */

import { getData, saveData } from './dataService.js';
import { v4 as uuidv4 } from 'uuid';

// ============================================================================
// SCHEMA HELPERS
// ============================================================================

/**
 * Ensures the localTasks array exists in data.
 * 
 * JUNIOR DEV NOTE: "Defensive Programming"
 * We never assume the data structure exists. Always initialize if missing.
 */
const ensureSchema = (data) => {
    if (!data.localTasks) {
        data.localTasks = [];
    }
    return data;
};

// ============================================================================
// RECURRENCE HELPERS
// ============================================================================

/**
 * Check if a task should be active today based on recurrence settings
 * 
 * @param {Object} task - The task to check
 * @returns {boolean} - True if task is active today
 * 
 * JUNIOR DEV NOTE: Why check recurrence?
 * A task set to "weekly on Tuesday" shouldn't appear on Monday.
 * This function determines if a recurring task applies to today.
 */
const isActiveToday = (task) => {
    // One-time tasks are always "active" if not completed
    if (!task.isRecurring) return true;

    const today = new Date().getDay(); // 0=Sunday, 6=Saturday

    switch (task.recurrence) {
        case 'daily':
            return true;
        case 'weekly':
            // Default to same day each week (day task was created)
            return task.days?.includes(today) || today === new Date(task.createdAt).getDay();
        case 'specific':
            return task.days?.includes(today);
        default:
            return true;
    }
};

/**
 * Check if a recurring task needs to be reset (new day)
 * 
 * @param {Object} task - The task to check
 * @returns {boolean} - True if task should be reset
 */
const needsReset = (task) => {
    if (!task.isRecurring || !task.lastCompletedDate) return false;

    const lastCompleted = new Date(task.lastCompletedDate);
    const today = new Date();

    // Reset if completed on a different calendar day
    return lastCompleted.toDateString() !== today.toDateString();
};

// ============================================================================
// CRUD OPERATIONS
// ============================================================================

/**
 * Get all local tasks for a specific user
 * 
 * @param {string|number} userId - User ID to filter by
 * @returns {Array} - Array of tasks for that user
 */
export const getTasksForUser = async (userId) => {
    const data = ensureSchema(await getData());

    // Filter by user, check recurrence, and reset if needed
    // JUNIOR DEV NOTE: We now check if the userId is IN the assignedTo array
    // or if it matches the assignedTo string (for backward compatibility).
    return data.localTasks
        .filter(task => {
            const assigned = task.assignedTo;
            if (Array.isArray(assigned)) {
                return assigned.some(id => String(id) === String(userId));
            }
            return String(assigned) === String(userId);
        })
        .filter(isActiveToday)
        .map(task => {
            // Auto-reset recurring tasks at midnight
            if (needsReset(task)) {
                task.completed = false;
            }
            return task;
        });
};

/**
 * Get ALL local tasks (for management UI)
 */
export const getAllTasks = async () => {
    const data = ensureSchema(await getData());
    return data.localTasks;
};

/**
 * Create a new local task
 * 
 * @param {Object} taskData - Task properties
 * @returns {Object} - The created task
 */
export const createTask = async (taskData) => {
    const data = ensureSchema(await getData());

    // JUNIOR DEV NOTE: We ensure assignedTo is always an array for new tasks.
    // We also support 'rewardStrategy' which can be 'full' or 'split'.
    const assignedTo = Array.isArray(taskData.assignedTo)
        ? taskData.assignedTo
        : [taskData.assignedTo];

    const newTask = {
        id: uuidv4(),
        title: taskData.title,
        description: taskData.description || '',
        dueDate: taskData.dueDate || null,
        assignedTo: assignedTo,
        xpReward: taskData.xpReward || 10,
        goldReward: taskData.goldReward || 5,
        rewardStrategy: taskData.rewardStrategy || 'full', // 'full' or 'split'
        isRecurring: taskData.isRecurring || false,
        recurrence: taskData.recurrence || 'daily', // 'daily', 'weekly', 'specific'
        days: taskData.days || [], // [0-6] for specific days
        completed: false,
        lastCompletedDate: null,
        createdAt: new Date().toISOString()
    };

    data.localTasks.push(newTask);
    await saveData(data);

    return newTask;
};

/**
 * Update an existing task
 * 
 * @param {string} taskId - Task ID to update
 * @param {Object} updates - Properties to update
 * @returns {Object|null} - Updated task or null if not found
 */
export const updateTask = async (taskId, updates) => {
    const data = ensureSchema(await getData());

    const index = data.localTasks.findIndex(t => t.id === taskId);
    if (index === -1) return null;

    // Don't allow updating certain fields directly
    const { id, createdAt, ...safeUpdates } = updates;

    data.localTasks[index] = { ...data.localTasks[index], ...safeUpdates };
    await saveData(data);

    return data.localTasks[index];
};

/**
 * Delete a task
 * 
 * @param {string} taskId - Task ID to delete
 * @returns {boolean} - True if deleted, false if not found
 */
export const deleteTask = async (taskId) => {
    const data = ensureSchema(await getData());

    const index = data.localTasks.findIndex(t => t.id === taskId);
    if (index === -1) return false;

    data.localTasks.splice(index, 1);
    await saveData(data);

    return true;
};

// ============================================================================
// COMPLETION HANDLERS (with Gamification)
// ============================================================================

/**
 * Mark a task as completed
 * 
 * @param {string} taskId - Task ID to complete
 * @returns {Object} - { task, xpAwarded, goldAwarded } or null
 * 
 * JUNIOR DEV NOTE: Why return rewards?
 * The frontend needs to know how much XP/Gold was earned
 * so it can show a notification to the user.
 */
export const completeTask = async (taskId) => {
    const data = ensureSchema(await getData());

    const task = data.localTasks.find(t => t.id === taskId);
    if (!task) return null;

    // Prevent double-completion
    if (task.completed) {
        return { task, xpAwarded: 0, goldAwarded: 0 };
    }

    task.completed = true;
    task.lastCompletedDate = new Date().toISOString();

    await saveData(data);

    return {
        task,
        xpAwarded: task.xpReward,
        goldAwarded: task.goldReward
    };
};

/**
 * Mark a task as uncompleted (undo)
 * 
 * @param {string} taskId - Task ID to uncomplete
 * @returns {Object} - { task, xpRevoked, goldRevoked } or null
 */
export const uncompleteTask = async (taskId) => {
    const data = ensureSchema(await getData());

    const task = data.localTasks.find(t => t.id === taskId);
    if (!task) return null;

    // Can't uncomplete if not completed
    if (!task.completed) {
        return { task, xpRevoked: 0, goldRevoked: 0 };
    }

    task.completed = false;
    task.lastCompletedDate = null;

    await saveData(data);

    return {
        task,
        xpRevoked: task.xpReward,
        goldRevoked: task.goldReward
    };
};

export default {
    getTasksForUser,
    getAllTasks,
    createTask,
    updateTask,
    deleteTask,
    completeTask,
    uncompleteTask
};
