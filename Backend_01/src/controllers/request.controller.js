import Request from "../models/request.models.js";
import Order from "../models/order.models.js";

// ============================================
// SEND JOIN REQUEST
// ============================================
export const sendRequest = async (req, res) => {
  try {
    const { orderId, amount } = req.body;

    if (!orderId) {
      return res.status(400).json({ message: "orderId is required" });
    }

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (order.admin.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: "You can't join your own order" });
    }

    if (order.status === "closed" || order.expiresAt < new Date()) {
      return res.status(400).json({ message: "This order is no longer accepting joins" });
    }

    const alreadyJoined = order.participants.some(
      (p) => p.userId.toString() === req.user._id.toString()
    );
    if (alreadyJoined) {
      return res.status(400).json({ message: "You have already joined this order" });
    }

    const existingRequest = await Request.findOne({
      orderId,
      userId: req.user._id,
      status: "pending",
    });
    if (existingRequest) {
      return res.status(400).json({ message: "You already sent a request" });
    }

    const request = await Request.create({
      orderId,
      userId: req.user._id,
      amount: amount || 0,
    });

    await request.populate("userId", "name userName");

    // 🔔 Notify admin in real time
    global.io.to(order.admin.toString()).emit("newRequest", {
      requestId: request._id,
      orderId: order._id,
      userName: request.userId.userName,
      name: request.userId.name,
    });

    res.status(201).json({ message: "Join request sent successfully", request });

  } catch (error) {
    console.error("sendRequest error:", error);
    res.status(500).json({ message: "Error sending request" });
  }
};

// ============================================
// ACCEPT REQUEST
// ============================================
export const acceptRequest = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);
    if (!request) return res.status(404).json({ message: "Request not found" });

    const order = await Order.findById(request.orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (order.admin.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Only admin can accept" });
    }

    if (request.status !== "pending") {
      return res.status(400).json({ message: "Request is no longer pending" });
    }

    // Add to participants if not already there
    const alreadyJoined = order.participants.some(
      (p) => p.userId.toString() === request.userId.toString()
    );
    if (!alreadyJoined) {
      order.participants.push({ userId: request.userId });
    }

    // ✅ ALWAYS enable chat when admin accepts anyone
    order.status = "matched";
    order.isChatEnabled = true;

    order.markModified("participants");
    await order.save();

    request.status = "accepted";
    await request.save();

    // 🔔 Notify the joiner — their button will flip to "Chat Now"
    global.io.to(request.userId.toString()).emit("requestAccepted", {
      orderId: order._id,
    });

    res.json({ message: "Accepted!", order });

  } catch (error) {
    console.error("acceptRequest error:", error);
    res.status(500).json({ message: "Error accepting request" });
  }
};

// ============================================
// DECLINE REQUEST
// ============================================
export const declineRequest = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);
    if (!request) return res.status(404).json({ message: "Request not found" });

    const order = await Order.findById(request.orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (order.admin.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Only admin can decline" });
    }

    request.status = "rejected";
    await request.save();

    // 🔔 Notify the joiner their request was declined
    global.io.to(request.userId.toString()).emit("requestDeclined", {
      orderId: order._id,
    });

    res.json({ message: "Request declined" });

  } catch (error) {
    res.status(500).json({ message: "Error declining request" });
  }
};

// ============================================
// GET PENDING REQUESTS FOR ORDER (admin)
// ============================================
export const getRequestsForOrder = async (req, res) => {
  try {
    const requests = await Request.find({
      orderId: req.params.orderId,
      status: "pending",
    }).populate("userId", "name userName");

    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: "Error fetching requests" });
  }
};

// ============================================
// GET MY PENDING REQUESTS (admin inbox)
// ============================================
export const getMyPendingRequests = async (req, res) => {
  try {
    const myOrders = await Order.find({ admin: req.user._id }).select("_id");
    const ids = myOrders.map((o) => o._id);

    const requests = await Request.find({
      orderId: { $in: ids },
      status: "pending",
    })
      .populate("userId", "name userName")
      .populate("orderId", "platform");

    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch requests" });
  }
};
