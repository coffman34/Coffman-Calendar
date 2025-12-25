/**
 * @fileoverview Local Tasks Controller - API endpoint handlers
 * @module controllers/localTasksController
 * 
 * DESIGN PATTERN: Controller Layer
 * Controllers handle HTTP - parsing requests, calling services, formatting responses.
 * Business logic stays in services.
 */

import * as localTasksService from '../services/localTasksService.js';
import * as statsService from '../services/statsService.js';

// ============================================================================
// GET ENDPOINTS
// ============================================================================

/**
 * Get all tasks for a specific user
 * GET /api/local-tasks/user/:userId
 */
export const getTasksForUser = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const tasks = await localTasksService.getTasksForUser(userId);
        res.json(tasks);
    } catch (error) {
        next(error);
    }
};

/**
 * Get all tasks (for management)
 * GET /api/local-tasks
 */
export const getAllTasks = async (req, res, next) => {
    try {
        const tasks = await localTasksService.getAllTasks();
        res.json(tasks);
    } catch (error) {
        next(error);
    }
};

// ============================================================================
// CRUD ENDPOINTS
// ============================================================================

/**
 * Create a new task
 * POST /api/local-tasks
 */
export const createTask = async (req, res, next) => {
    try {
        const task = await localTasksService.createTask(req.body);
        res.status(201).json(task);
    } catch (error) {
        next(error);
    }
};

/**
 * Update an existing task
 * PUT /api/local-tasks/:taskId
 */
export const updateTask = async (req, res, next) => {
    try {
        const { taskId } = req.params;
        const task = await localTasksService.updateTask(taskId, req.body);

        if (!task) {
            return res.status(404).json({ error: 'Task not found' });
        }

        res.json(task);
    } catch (error) {
        next(error);
    }
};

/**
 * Delete a task
 * DELETE /api/local-tasks/:taskId
 */
export const deleteTask = async (req, res, next) => {
    try {
        const { taskId } = req.params;
        const deleted = await localTasksService.deleteTask(taskId);

        if (!deleted) {
            return res.status(404).json({ error: 'Task not found' });
        }

        res.json({ success: true });
    } catch (error) {
        next(error);
    }
};

// ============================================================================
// COMPLETION ENDPOINTS (with XP/Gold integration)
// ============================================================================

/**
 * Complete a task - awards XP and Gold
 * POST /api/local-tasks/:taskId/complete
 * 
 * JUNIOR DEV NOTE: Why is this separate from updateTask?
 * Because completing a task has side effects (XP/Gold).
 * Using a dedicated endpoint makes the intent clear and
 * prevents accidental awards from generic updates.
 */
export const completeTask = async (req, res, next) => {
    try {
        const { taskId } = req.params;
        const result = await localTasksService.completeTask(taskId);

        if (!result) {
            return res.status(404).json({ error: 'Task not found' });
        }

        // Award XP and Gold to the user(s) if rewards were earned
        if (result.xpAwarded > 0 || result.goldAwarded > 0) {
            const { task, xpAwarded, goldAwarded } = result;
            const assignees = Array.isArray(task.assignedTo) ? task.assignedTo : [task.assignedTo];
            const strategy = task.rewardStrategy || 'full';

            // JUNIOR DEV NOTE: Calculate how much each person gets based on strategy.
            // 'full' = everyone gets the full amount.
            // 'split' = total is divided by number of assignees.
            const xpPerPerson = strategy === 'split' ? Math.floor(xpAwarded / assignees.length) : xpAwarded;
            const goldPerPerson = strategy === 'split' ? Math.floor(goldAwarded / assignees.length) : goldAwarded;

            // 1. Loop through all assigned users
            // 2. Award calculated XP/Gold to each
            for (const userId of assignees) {
                if (xpPerPerson > 0) {
                    await statsService.addXP(userId, xpPerPerson);
                }
                if (goldPerPerson > 0) {
                    await statsService.addGold(userId, goldPerPerson);
                }
            }

            // Add actual awarded per person to result for frontend feedback
            result.xpPerPerson = xpPerPerson;
            result.goldPerPerson = goldPerPerson;
        }

        res.json(result);
    } catch (error) {
        next(error);
    }
};

/**
 * Uncomplete a task - revokes XP and Gold
 * POST /api/local-tasks/:taskId/uncomplete
 */
export const uncompleteTask = async (req, res, next) => {
    try {
        const { taskId } = req.params;
        const result = await localTasksService.uncompleteTask(taskId);

        if (!result) {
            return res.status(404).json({ error: 'Task not found' });
        }

        // Revoke XP and Gold from the user(s)
        if (result.xpRevoked > 0 || result.goldRevoked > 0) {
            const { task, xpRevoked, goldRevoked } = result;
            const assignees = Array.isArray(task.assignedTo) ? task.assignedTo : [task.assignedTo];
            const strategy = task.rewardStrategy || 'full';

            const xpPerPerson = strategy === 'split' ? Math.floor(xpRevoked / assignees.length) : xpRevoked;
            const goldPerPerson = strategy === 'split' ? Math.floor(goldRevoked / assignees.length) : goldRevoked;

            for (const userId of assignees) {
                if (xpPerPerson > 0) {
                    await statsService.addXP(userId, -xpPerPerson);
                }
                if (goldPerPerson > 0) {
                    await statsService.addGold(userId, -goldPerPerson);
                }
            }
        }

        res.json(result);
    } catch (error) {
        next(error);
    }
};
