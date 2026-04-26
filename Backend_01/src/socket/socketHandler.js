import { verifyToken } from "../config/jwt.js";
import Message from "../models/messege.js";
import Order from "../models/order.models.js";

// ─────────────────────────────────────────────
// 🔌 SOCKET.IO HANDLER
// Called once from server.js with the io instance
//
// Events we handle:
// Client → Server:
//   joinUserRoom   — user joins their personal room (for notifications)
//   joinOrderRoom  — user joins an order's chat room
//   sendMessage    — user sends a chat message
//   leaveOrderRoom — user leaves a chat room
//
// Server → Client:
//   newRequest      — admin gets notified of a join request
//   requestAccepted — joiner gets notified their request was accepted
//   newMessage      — everyone in room gets the message
//   chatEnded       — admin closed the order
// ─────────────────────────────────────────────

const socketHandler = (io) => {

  // 🔐 Authenticate socket connections using JWT
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth.token;

      if (!token) {
        return next(new Error("No token provided"));
      }

      const decoded = verifyToken(token);
      socket.userId = decoded.id; // attach userId to socket
      next();

    } catch (err) {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    console.log(`🔌 Socket connected: ${socket.userId}`);

    // ─────────────────────────────────────────
    // 👤 JOIN PERSONAL ROOM
    // Every user joins a room named after their userId
    // This lets us send direct notifications to specific users
    // ─────────────────────────────────────────
    socket.on("joinUserRoom", () => {
      socket.join(socket.userId);
      console.log(`👤 User ${socket.userId} joined personal room`);
    });

    // ─────────────────────────────────────────
    // 💬 JOIN ORDER CHAT ROOM
    // When user opens ChatRoom page
    // Admin is also allowed — they created the order and manage the chat
    // ─────────────────────────────────────────
    socket.on("joinOrderRoom", async (orderId) => {
      try {
        const order = await Order.findById(orderId);

        if (!order) return;

        // ✅ Allow admin OR any participant to join the room
        const isAdmin = order.admin.toString() === socket.userId;
        const isMember = order.participants.some(
          (p) => p.userId.toString() === socket.userId
        );

        if (!isAdmin && !isMember) {
          socket.emit("error", { message: "Not a participant" });
          return;
        }

        socket.join(orderId); // join the room named by orderId
        console.log(`💬 User ${socket.userId} joined room ${orderId}`);

      } catch (err) {
        console.error("joinOrderRoom error:", err);
      }
    });

    // ─────────────────────────────────────────
    // 📨 SEND MESSAGE
    // Saves message to DB + broadcasts to room
    // Admin OR participant can send messages
    // ─────────────────────────────────────────
    socket.on("sendMessage", async ({ orderId, text }) => {
      try {
        if (!text?.trim()) return;

        const order = await Order.findById(orderId);

        if (!order || !order.isChatEnabled) {
          socket.emit("error", { message: "Chat is not active for this order" });
          return;
        }

        // ✅ Allow admin OR any participant to send messages
        const isAdmin = order.admin.toString() === socket.userId;
        const isMember = order.participants.some(
          (p) => p.userId.toString() === socket.userId
        );

        if (!isAdmin && !isMember) {
          socket.emit("error", { message: "Not a participant" });
          return;
        }

        // 💾 Save to DB so history is preserved on refresh
        const message = await Message.create({
          orderId,
          sender: socket.userId,
          text: text.trim(),
          type: "text",
        });

        // Populate sender info before broadcasting
        await message.populate("sender", "name userName");

        // 📡 Broadcast to everyone in the room (including sender)
        io.to(orderId).emit("newMessage", {
          _id: message._id,
          text: message.text,
          senderId: message.sender._id,
          sender: {
            _id: message.sender._id,
            name: message.sender.name,
            userName: message.sender.userName,
          },
          createdAt: message.createdAt,
        });

      } catch (err) {
        console.error("sendMessage error:", err);
      }
    });

    // ─────────────────────────────────────────
    // 🚪 LEAVE ROOM
    // ─────────────────────────────────────────
    socket.on("leaveOrderRoom", (orderId) => {
      socket.leave(orderId);
      console.log(`🚪 User ${socket.userId} left room ${orderId}`);
    });

    // ─────────────────────────────────────────
    // ❌ DISCONNECT
    // ─────────────────────────────────────────
    socket.on("disconnect", () => {
      console.log(`❌ Socket disconnected: ${socket.userId}`);
    });
  });
};

export default socketHandler;
