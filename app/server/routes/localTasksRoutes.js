/**
 * @fileoverview Local Tasks Routes
 * @module routes/localTasksRoutes
 * 
 * API Endpoints:
 * GET    /api/local-tasks/user/:userId - Get tasks for a user
 * GET    /api/local-tasks              - Get all tasks (management)
 * POST   /api/local-tasks              - Create new task
 * PUT    /api/local-tasks/:taskId      - Update task
 * DELETE /api/local-tasks/:taskId      - Delete task
 * POST   /api/local-tasks/:taskId/complete   - Complete (awards XP/Gold)
 * POST   /api/local-tasks/:taskId/uncomplete - Uncomplete (revokes XP/Gold)
 */

import { Router } from 'express';
import * as controller from '../controllers/localTasksController.js';

const router = Router();

// CRUD routes
router.get('/user/:userId', controller.getTasksForUser);
router.get('/', controller.getAllTasks);
router.post('/', controller.createTask);
router.put('/:taskId', controller.updateTask);
router.delete('/:taskId', controller.deleteTask);

// Completion routes (with gamification)
router.post('/:taskId/complete', controller.completeTask);
router.post('/:taskId/uncomplete', controller.uncompleteTask);

export default router;
