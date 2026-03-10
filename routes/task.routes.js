
import express from "express";
import { createTask, trackTask, updateProgress, getAllTasks } from "../controllers/task.controller.js";
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Tasks fetched successfully
 *                 tasks:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: 507f1f77bcf86cd799439011
 *                       title:
 *                         type: string
 *                         example: Complete API Documentation
 *                       description:
 *                         type: string
 *                         example: Add Swagger docs
 *                       status:
 *                         type: string
 *                         example: in-progress
 *                       estimatedHours:
 *                         type: number
 *                         example: 5
 *                       assignedTo:
 *                         type: object
 *                         properties:
 *                           name:
 *                             type: string
 *                             example: John Doe
 *                           email:
 *                             type: string
 *                             example: john@example.com
 *       401:
 *         description: Unauthorized
 */
router.get("/", authorization, getAllTasks);

/**
 * @swagger
 * /task/assign:
 *   post:
 *     summary: Assign a new task to an available employee (Admin only)
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
 *     responses:
 *       201:
 *         description: Task assigned successfully
 *       400:
 *         description: Invalid input or no available users
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 */
router.post(
    "/assign",
   authorization,
   authRole("admin"),
   createTask
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

export default router;
