import express from "express";
import { adminStats } from "../controllers/dashboard.controller.js";
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

export default router;