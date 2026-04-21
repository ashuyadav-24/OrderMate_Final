import Order from "../models/order.models.js";

// ─────────────────────────────────────────────
// 🆕 CREATE ORDER
// POST /api/orders/create
// ─────────────────────────────────────────────
export const createOrder = async (req, res) => {
  try {
    const { platform, targetAmount, duration, college, hostel } = req.body;

    if (!platform || !targetAmount || !duration || !college || !hostel) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Optional: still ensure profile exists
    if (!req.user.collegeName || !req.user.hostelName) {
      return res.status(400).json({ message: "Complete your profile first" });
    }

    // ⏱ expiry time
    const expiresAt = new Date(Date.now() + duration * 60 * 1000);

    const order = await Order.create({
      platform,
      targetAmount,
      duration,
      expiresAt,

      createdBy: req.user._id,
      admin: req.user._id,

      participants: [{ userId: req.user._id }],

      // ✅ from frontend dropdown
      college,
      hostel,
    });

    res.status(201).json(order);

  } catch (error) {
    console.error("Create order error:", error);
    res.status(500).json({ message: "Error creating order" });
  }
};

// ─────────────────────────────────────────────
// 📋 GET ACTIVE ORDERS (NO HOSTEL FILTER)
// GET /api/orders
// ─────────────────────────────────────────────
export const getOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      status: { $in: ["open", "matched"] },
      expiresAt: { $gt: new Date() }, // not expired
    })
      .populate("admin", "name userName")
      .populate("participants.userId", "name userName")
      .sort({ createdAt: -1 });

console.log(
  JSON.stringify(orders, null, 2)
);

    res.json(orders);

  } catch (error) {
    console.error("Get orders error:", error);
    res.status(500).json({ message: "Error fetching orders" });
  }
};

// ─────────────────────────────────────────────
// 🗑️ DELETE ORDER
// ─────────────────────────────────────────────
export const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.admin.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Only admin can delete" });
    }

    await order.deleteOne();

    res.json({ message: "Order deleted successfully" });

  } catch (error) {
    console.error("Delete order error:", error);
    res.status(500).json({ message: "Error deleting order" });
  }
};

// ─────────────────────────────────────────────
// 🔄 UPDATE ORDER STATUS
// ─────────────────────────────────────────────
export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const validStatuses = ["open", "matched", "closed"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.admin.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Only admin can update" });
    }

    order.status = status;

    if (status === "matched") {
      order.isChatEnabled = true;
    }

    if (status === "closed") {
      order.isChatEnabled = false;
    }

    await order.save();

    res.json({ message: "Status updated", order });

  } catch (error) {
    console.error("Update status error:", error);
    res.status(500).json({ message: "Error updating status" });
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

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json(order);

  } catch (error) {
    console.error("Get order error:", error);
    res.status(500).json({ message: "Error fetching order" });
  }
};

// ─────────────────────────────────────────────
// 🚪 LEAVE ORDER / CHAT
// POST /api/orders/leave/:orderId
// ─────────────────────────────────────────────
export const leaveOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    const userId = req.user._id.toString();

    const isAdmin =
      order.admin.toString() === userId ||
      order.createdBy.toString() === userId;

    if (isAdmin) {
      return res.status(400).json({
        message: "Admin cannot leave. Use End Chat.",
      });
    }

    order.participants = order.participants.filter(
      (p) => p.userId.toString() !== userId
    );

    await order.save();

    return res.status(200).json({
      message: "Left chat successfully",
    });
  } catch (error) {
    console.error("Leave order error:", error);

    return res.status(500).json({
      message: "Error leaving chat",
    });
  }
};