import express from "express";
import { getSchedule } from "../handler/schedulerHandler.js";
const router = express.Router();
router.get("/", getSchedule);
export default router;