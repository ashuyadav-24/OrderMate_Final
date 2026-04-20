import express from "express";
import {
  sendRequest,
  acceptRequest,
  declineRequest,
  getMyPendingRequests,
  getRequestsForOrder,
} from "../controllers/request.controller.js";
import protect from "../middlewares/protect.js";

const router = express.Router();

// All request routes require login
router.use(protect);

router.get("/my-pending", getMyPendingRequests);
router.post("/send", sendRequest);                        // POST   /api/requests/send          → join
router.get("/order/:orderId", getRequestsForOrder);       // GET    /api/requests/order/:id      → admin view
router.patch("/:id/accept", acceptRequest);               // PATCH  /api/requests/:id/accept     → admin accepts
router.patch("/:id/decline", declineRequest);             // PATCH  /api/requests/:id/decline    → admin declines

export default router;
