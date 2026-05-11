import express from "express";
import { getUnreadNotifications, markAsRead } from "../controllers/notification.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/unread", authMiddleware, getUnreadNotifications);
router.post("/read", authMiddleware, markAsRead);

export default router;
