import express from "express";
import { adminStats, getUserTaskStats } from "../controllers/dashboard.controller.js";
import authorization from "../middlewares/auth.middleware.js"; 
import { authRole } from "../middlewares/authRole.js";

const router = express.Router();

/**
 * @swagger
 * /dashboard/admin-stats:
 *   get:
 *     summary: Get admin dashboard statistics
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalTasks:
 *                   type: number
 *                   example: 50
 *                 completed:
 *                   type: number
 *                   example: 20
 *                 pending:
 *                   type: number
 *                   example: 15
 *                 inProgress:
 *                   type: number
 *                   example: 15
 *                 employees:
 *                   type: number
 *                   example: 10
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 *       500:
 *         description: Server error
 */
router.get(
  "/admin-stats",
  authorization,
  authRole("admin"),
  adminStats
);

/**
 * @swagger
 * /dashboard/user-task-stats:
 *   get:
 *     summary: Get all users with total assigned and completed tasks
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User task stats fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 stats:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                         example: John Doe
 *                       email:
 *                         type: string
 *                         example: john@example.com
 *                       role:
 *                         type: string
 *                         example: employee
 *                       totalAssigned:
 *                         type: number
 *                         example: 5
 *                       totalCompleted:
 *                         type: number
 *                         example: 3
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 */
router.get(
  "/user-task-stats",
  authorization,
  authRole("admin"),
  getUserTaskStats
);

export default router;