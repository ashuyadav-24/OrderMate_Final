import express from "express";
import { subscribe } from "../controllers/push.controller.js";
import protect from "../middlewares/protect.js";

const router = express.Router();

router.post("/subscribe", protect, subscribe);

export default router;
