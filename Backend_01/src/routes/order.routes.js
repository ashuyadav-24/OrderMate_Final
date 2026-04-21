import express from "express";
import {
  createOrder,
  getOrders,
  getOrderById,
  deleteOrder,
  updateOrderStatus,
  leaveOrder,
} from "../controllers/order.controller.js";

import protect from "../middlewares/protect.js";

const router = express.Router();

router.use(protect);

router.get("/", getOrders);
router.post("/create", createOrder);

router.get("/:id", getOrderById);
router.delete("/:id", deleteOrder);
router.patch("/:id/status", updateOrderStatus);

/* ✅ NEW */
router.post("/leave/:orderId", leaveOrder);

export default router;