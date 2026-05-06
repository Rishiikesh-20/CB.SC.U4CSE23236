import express from "express";
import { getNotifications, sendNotifications, getPriorityNotifications, markAsRead } from "../handler/notificationHandler.js";

const router = express.Router();

router.get("/", getNotifications);
router.get("/priority", getPriorityNotifications);
router.post("/send", sendNotifications);
router.put("/:id/read", markAsRead);

export default router;
