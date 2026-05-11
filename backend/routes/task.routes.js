
import express from "express";
import { createTask, trackTask, updateProgress, getAllTasks, getPriorityQueue, deleteTask } from "../controllers/task.controller.js";
import { authRole } from "../middlewares/authRole.js";
import authorization from "../middlewares/auth.middleware.js";
const router = express.Router()

/**
 * @swagger
 * /task:
 *   get:
 *     summary: Get all tasks
 *     tags: [Task]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all tasks
 *       401:
 *         description: Unauthorized
 */
router.get("/", authorization, getAllTasks);

/**
 * @swagger
 * /task/queue:
 *   get:
 *     summary: Get tasks sorted by priority (high -> medium -> low)
 *     tags: [Task]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Priority queue of pending and in-progress tasks
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 total:
 *                   type: number
 *                   example: 5
 *                 queue:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       title:
 *                         type: string
 *                         example: Fix critical bug
 *                       priority:
 *                         type: string
 *                         example: high
 *                       status:
 *                         type: string
 *                         example: pending
 *                       assignedTo:
 *                         type: object
 *                         properties:
 *                           name:
 *                             type: string
 *                             example: John Doe
 *                           email:
 *                             type: string
 *                             example: john@example.com
 *       404:
 *         description: No tasks in queue
 *       401:
 *         description: Unauthorized
 */
router.get("/queue", authorization, getPriorityQueue);

/**
 * @swagger
 * /task/assign:
 *   post:
 *     summary: Assign a new task to least busy employee (Greedy + Priority Algorithm)
 *     tags: [Task]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - estimatedHours
 *             properties:
 *               title:
 *                 type: string
 *                 example: Complete API Documentation
 *               description:
 *                 type: string
 *                 example: Add Swagger documentation to all routes
 *               estimatedHours:
 *                 type: number
 *                 example: 5
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high]
 *                 example: high
 *     responses:
 *       201:
 *         description: Task assigned successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 assignedTo:
 *                   type: string
 *                   example: John Doe
 *                 priority:
 *                   type: string
 *                   example: high
 *                 task:
 *                   type: object
 *       400:
 *         description: Invalid input or no active users available
 *       401:
 *         description: Unauthorized
 */
router.post(
    "/assign",
   authorization,
   createTask
);

/**
 * @swagger
 * /task/{taskId}/track:
 *   get:
 *     summary: Track task progress and get elapsed/remaining hours
 *     tags: [Task]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *         example: 507f1f77bcf86cd799439011
 *     responses:
 *       200:
 *         description: Task tracking information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 taskId:
 *                   type: string
 *                   example: 507f1f77bcf86cd799439011
 *                 status:
 *                   type: string
 *                   example: in-progress
 *                 elapsedHours:
 *                   type: string
 *                   example: "3.50"
 *                 remainingHours:
 *                   type: string
 *                   example: "1.50"
 *                 progress:
 *                   type: string
 *                   example: "70.00%"
 *       400:
 *         description: Task has not started yet
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Task not found
 */
router.get(
    "/:taskId/track",
    authorization,
    trackTask
);

/**
 * @swagger
 * /task/{id}:
 *   put:
 *     summary: Update task status
 *     tags: [Task]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: 507f1f77bcf86cd799439011
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, in-progress, completed]
 *                 example: in-progress
 *     responses:
 *       200:
 *         description: Task updated successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Task not found
 */
router.put(
    "/:id",
    authorization,
    updateProgress
);

/**
 * @swagger
 * /task/{id}:
 *   delete:
 *     summary: Delete a task
 *     tags: [Task]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: 507f1f77bcf86cd799439011
 *     responses:
 *       200:
 *         description: Task deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (Admin only)
 *       404:
 *         description: Task not found
 */
router.delete(
    "/:id",
    authorization,
    authRole("admin"),
    deleteTask
);

export default router;
