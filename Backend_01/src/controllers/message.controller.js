import Message from "../models/messege.js";
import Order from "../models/order.models.js";

// ─────────────────────────────────────────────
// 💬 GET MESSAGES FOR AN ORDER
// GET /api/chat/:orderId
// 🛡️ Protected
//
// Called when ChatRoom loads to restore history
// ─────────────────────────────────────────────
export const getMessages = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Only participants can read messages
    const isMember = order.participants.some(
      (p) => p.userId.toString() === req.user._id.toString()
    );

    if (!isMember) {
      return res.status(403).json({ message: "You are not part of this order" });
    }

    const messages = await Message.find({ orderId })
      .populate("sender", "name userName")
      .sort({ createdAt: 1 }); // oldest first

    res.json(messages);

  } catch (error) {
    console.error("Get messages error:", error);
    res.status(500).json({ message: "Error fetching messages" });
  }
};

// ─────────────────────────────────────────────
// 🔚 END CHAT (admin only)
// DELETE /api/chat/end/:orderId
// 🛡️ Protected
//
// Admin closes the order → isChatEnabled = false
// Socket.io emits "chatEnded" to the room
// ─────────────────────────────────────────────
export const endChat = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Only admin can end chat
    if (order.admin.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Only the admin can end this chat" });
    }

    // ✅ Delete all messages for this order
    await Message.deleteMany({ orderId });

    // Close the order and disable chat
    order.status = "closed";
    order.isChatEnabled = false;
    await order.save();

    // 🔴 Notify everyone in the room that chat has ended
    // global.io is set in server.js
    global.io.to(orderId).emit("chatEnded", {
      message: "Admin has closed this order. Chat ended.",
    });

    res.json({ message: "Chat ended and order closed" });

  } catch (error) {
    console.error("End chat error:", error);
    res.status(500).json({ message: "Error ending chat" });
  }
};
