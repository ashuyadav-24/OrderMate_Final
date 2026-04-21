import Order from "../models/order.models.js";

// ─────────────────────────────────────────────
// 🆕 CREATE ORDER
// ─────────────────────────────────────────────
export const createOrder = async (req, res) => {
  try {
    const { platform, targetAmount, duration, college, hostel } = req.body;

    if (!platform || !targetAmount || !duration || !college || !hostel) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const expiresAt = new Date(Date.now() + duration * 60 * 1000);

    const order = await Order.create({
      platform,
      targetAmount,
      duration,
      expiresAt,
      createdBy: req.user._id,
      admin: req.user._id,
      participants: [{ userId: req.user._id }],
      college,
      hostel,
    });

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: "Error creating order" });
  }
};

// ─────────────────────────────────────────────
// 📋 GET ORDERS
// ─────────────────────────────────────────────
export const getOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      status: { $in: ["open", "matched"] },
      expiresAt: { $gt: new Date() },
    })
      .populate("admin", "name userName")
      .populate("participants.userId", "name userName")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch {
    res.status(500).json({ message: "Error fetching orders" });
  }
};

// ─────────────────────────────────────────────
// 🔍 GET SINGLE ORDER
// ─────────────────────────────────────────────
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("admin", "name userName")
      .populate("participants.userId", "name userName");

    res.json(order);
  } catch {
    res.status(500).json({ message: "Error fetching order" });
  }
};

// ─────────────────────────────────────────────
// 🚪 LEAVE CHAT
// ─────────────────────────────────────────────
export const leaveOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const userId = req.user._id.toString();

    const isAdmin =
      order.admin.toString() === userId ||
      order.createdBy.toString() === userId;

    // Admin leave = end chat
    if (isAdmin) {
      order.status = "closed";
      order.isChatEnabled = false;
      await order.save();

      global.io.to(orderId).emit("chatEnded");

      return res.json({
        message: "Chat ended successfully",
      });
    }

    // member leaves
    order.participants = order.participants.filter(
      (p) => p.userId.toString() !== userId
    );

    await order.save();

    global.io.to(orderId).emit("memberLeft", {
      userName: req.user.userName,
      name: req.user.name,
    });

    return res.json({
      message: "Left chat successfully",
    });
  } catch {
    res.status(500).json({
      message: "Error leaving chat",
    });
  }
};