import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  // 🔗 Which order (group chat)
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order",
    required: true,
    index: true, // 🔥 faster queries
  },

  // 👤 Sender of message
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  // 💬 Message text
  text: {
    type: String,
    required: true,
    trim: true,
  },

  // 🧠 Type of message
  type: {
    type: String,
    enum: ["text", "system"],
    default: "text",
  },

  // 👀 Seen by users (optional but 🔥)
  

  // ⏱️ Timestamp
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// 🔥 Optional: sort messages by time
messageSchema.index({ orderId: 1, createdAt: 1 });

export default mongoose.model("Message", messageSchema);