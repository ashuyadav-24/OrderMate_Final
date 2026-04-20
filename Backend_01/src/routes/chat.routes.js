import express from "express";
import { getMessages, endChat } from "../controllers/message.controller.js";
import protect from "../middlewares/protect.js";

const router = express.Router();

router.use(protect);

router.get("/:orderId", getMessages);         // GET  /api/chat/:orderId   → load history
router.delete("/end/:orderId", endChat);      // DELETE /api/chat/end/:orderId → admin ends chat

export default router;
