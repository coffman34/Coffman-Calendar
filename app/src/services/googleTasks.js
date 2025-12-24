/**
 * @fileoverview Google Tasks API service
 * @module services/googleTasks
 * 
 * EDUCATIONAL NOTES FOR JUNIOR DEVELOPERS:
 * 
 * WHY THIS FILE EXISTS:
 * Google Tasks is a simple to-do list service. This file provides functions
 * to interact with the Tasks API for creating, reading, updating, and deleting tasks.
 * 
 * DESIGN PATTERN: Service Layer + CRUD Pattern
 * We provide Create, Read, Update, Delete operations for tasks.
 */

import { createGoogleApiClient, isTokenExpiredError } from './api/GoogleApiClient';
import { API_ENDPOINTS } from '../utils/constants';

/**
 * Fetches all task lists for the user
 * 
 * WHAT IT DOES:
 * Gets the list of task lists (like "My Tasks", "Work", "Shopping", etc.).
 * 
 * WHY WE NEED IT:
 * Users can have multiple task lists. We need to let them choose which one to view.
 * 
 * JUNIOR DEV NOTE: What's a task list?
 * Think of it like folders for tasks. You might have:
 * - "Personal" task list
 * - "Work" task list
 * - "Shopping" task list
 * Each list contains individual tasks.
 * 
 * @param {string} accessToken - OAuth2 access token
 * @returns {Promise<Array>} Array of task list objects
 * 
 * @example
 * const lists = await fetchTaskLists(userToken);
 * // Returns: [{ id: "list1", title: "My Tasks" }, { id: "list2", title: "Work" }]
 */
export const fetchTaskLists = async (accessToken) => {
    const client = createGoogleApiClient(accessToken);
    const url = `${API_ENDPOINTS.GOOGLE_TASKS}/users/@me/lists`;

    try {
        const data = await client.get(url);
        return data.items || [];
    } catch (error) {
        if (isTokenExpiredError(error)) {
            throw error;
        }
        console.error('Failed to fetch task lists:', error);
        throw new Error('Could not load task lists. Please try again.');
    }
};

/**
 * Fetches tasks from a specific list
 * 
 * WHAT IT DOES:
 * Gets all tasks from a task list, including completed ones.
 * 
 * WHY WE NEED IT:
 * To display tasks to the user, we need to fetch them from Google.
 * 
 * HOW IT WORKS:
 * 1. Make GET request to tasks endpoint
 * 2. Include showCompleted=true to get finished tasks too
 * 3. Include showHidden=true to get all tasks (even deleted ones)
 * 4. Return the list of tasks
 * 
 * JUNIOR DEV NOTE: Why fetch completed tasks?
 * Users like to see what they've accomplished! Also, they might want
 * to un-complete a task if they marked it done by accident.
 * 
 * @param {string} accessToken - OAuth2 access token
 * @param {string} taskListId - ID of the task list to fetch from
 * @returns {Promise<Array>} Array of task objects
 * 
 * @example
 * const tasks = await fetchTasks(userToken, "list123");
 * // Returns: [{ id: "task1", title: "Buy milk", status: "needsAction" }, ...]
 */
export const fetchTasks = async (accessToken, taskListId) => {
    const client = createGoogleApiClient(accessToken);
    const url = `${API_ENDPOINTS.GOOGLE_TASKS}/lists/${taskListId}/tasks`;

    const params = {
        showCompleted: 'true',
        showHidden: 'true',
    };

    try {
        const data = await client.get(url, params);
        return data.items || [];
    } catch (error) {
        if (isTokenExpiredError(error)) {
            throw error;
        }
        console.error('Failed to fetch tasks:', error);
        throw new Error('Could not load tasks. Please try again.');
    }
};

/**
 * Creates a new task
 * 
 * WHAT IT DOES:
 * Adds a new task to a task list.
 * 
 * WHY WE NEED IT:
 * Users need to add tasks to their to-do lists.
 * 
 * HOW IT WORKS:
 * 1. Make POST request to tasks endpoint
 * 2. Send task data (title, notes, due date, etc.)
 * 3. Google creates the task and returns it with an ID
 * 
 * @param {string} accessToken - OAuth2 access token
 * @param {string} taskListId - ID of the task list to add to
 * @param {Object} taskData - Task data (title, notes, due, etc.)
 * @returns {Promise<Object>} Created task object
 * 
 * @example
 * const task = await createTask(userToken, "list123", {
 *   title: "Buy milk",
 *   notes: "2% milk from Whole Foods",
 *   due: "2024-01-15T00:00:00.000Z"
 * });
 */
export const createTask = async (accessToken, taskListId, taskData) => {
    const client = createGoogleApiClient(accessToken);
    const url = `${API_ENDPOINTS.GOOGLE_TASKS}/lists/${taskListId}/tasks`;

    try {
        const task = await client.post(url, taskData);
        return task;
    } catch (error) {
        if (isTokenExpiredError(error)) {
            throw error;
        }
        console.error('Failed to create task:', error);
        throw new Error('Could not create task. Please try again.');
    }
};

/**
 * Updates a task
 * 
 * WHAT IT DOES:
 * Modifies an existing task (e.g., mark as complete, change title, etc.).
 * 
 * WHY WE NEED IT:
 * Users need to check off tasks, edit them, or change due dates.
 * 
 * HOW IT WORKS:
 * 1. Make PUT request to specific task endpoint
 * 2. Send updated task data
 * 3. Google updates the task and returns the new version
 * 
 * JUNIOR DEV NOTE: PUT vs PATCH?
 * - PUT replaces the entire task
 * - PATCH updates only specific fields
 * Google Tasks API uses PUT, so we send the full task object.
 * 
 * @param {string} accessToken - OAuth2 access token
 * @param {string} taskListId - ID of the task list
 * @param {string} taskId - ID of the task to update
 * @param {Object} taskData - Updated task data
 * @returns {Promise<Object>} Updated task object
 * 
 * @example
 * // Mark task as complete
 * const updated = await updateTask(userToken, "list123", "task456", {
 *   ...existingTask,
 *   status: "completed"
 * });
 */
export const updateTask = async (accessToken, taskListId, taskId, taskData) => {
    const client = createGoogleApiClient(accessToken);
    const url = `${API_ENDPOINTS.GOOGLE_TASKS}/lists/${taskListId}/tasks/${taskId}`;

    try {
        const task = await client.put(url, taskData);
        return task;
    } catch (error) {
        if (isTokenExpiredError(error)) {
            throw error;
        }
        console.error('Failed to update task:', error);
        throw new Error('Could not update task. Please try again.');
    }
};

/**
 * Deletes a task
 * 
 * WHAT IT DOES:
 * Permanently removes a task from a task list.
 * 
 * WHY WE NEED IT:
 * Users need to delete tasks they no longer need.
 * 
 * HOW IT WORKS:
 * 1. Make DELETE request to specific task endpoint
 * 2. Google deletes the task
 * 3. Returns 204 No Content on success
 * 
 * JUNIOR DEV NOTE: Why check for 204?
 * HTTP 204 means "success, but no content to return".
 * DELETE requests often return 204 instead of 200.
 * 
 * @param {string} accessToken - OAuth2 access token
 * @param {string} taskListId - ID of the task list
 * @param {string} taskId - ID of the task to delete
 * @returns {Promise<boolean>} True if successful
 * 
 * @example
 * await deleteTask(userToken, "list123", "task456");
 * // Task is now deleted
 */
export const deleteTask = async (accessToken, taskListId, taskId) => {
    const client = createGoogleApiClient(accessToken);
    const url = `${API_ENDPOINTS.GOOGLE_TASKS}/lists/${taskListId}/tasks/${taskId}`;

    try {
        await client.delete(url);
        return true;
    } catch (error) {
        if (isTokenExpiredError(error)) {
            throw error;
        }
        console.error('Failed to delete task:', error);
        throw new Error('Could not delete task. Please try again.');
    }
};
