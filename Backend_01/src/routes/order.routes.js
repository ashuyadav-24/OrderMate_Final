import express from "express";
import {
  createOrder,
  getOrders,
  getOrderById,
  deleteOrder,
  updateOrderStatus,
} from "../controllers/order.controller.js";
import protect from "../middlewares/protect.js";

const router = express.Router();

// All order routes require login
router.use(protect);

router.get("/", getOrders);                          // GET  /api/orders         → feed
router.post("/create", createOrder);                 // POST /api/orders/create  → new order
router.get("/:id", getOrderById);                    // GET  /api/orders/:id     → single order
router.delete("/:id", deleteOrder);                  // DELETE /api/orders/:id   → admin deletes
router.patch("/:id/status", updateOrderStatus);      // PATCH /api/orders/:id/status → admin updates

export default router;
