import mongoose from "mongoose";
import { nanoid } from "nanoid";

const orderSchema = new mongoose.Schema({
  // 🔥 Friendly ID
  orderId: {
    type: String,
    unique: true,
    default: () => "ORD-" + nanoid(6),
  },

  
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  college: {
    type: String,
    required: true,
  },

  hostel: {
    type: String,
    required: true,
  },

  platform: {
    type: String,
    enum: ["blinkit", "instamart", "zepto","flipkart","amazon","bigbasket","jiomart"],
    default: "instamart",
  },

  targetAmount: {
    type: Number,
    required: true,
  },

  currentAmount: {
    type: Number,
    default: 0,
  },

  // 🔥 GROUP MEMBERS
  participants: [
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      
      joinedAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],

  // 👑 ADMIN
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },

  status: {
    type: String,
    enum: ["open", "matched", "closed"],
    default: "open",
  },

  duration: {
  type: Number, // minutes
  required: true,
  },

 expiresAt: {
  type: Date,
  },

  // 💬 CHAT ENABLED FLAG
  isChatEnabled: {
    type: Boolean,
    default: false,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// 🔥 AUTO CALCULATE EXPIRY TIME
// WHY:
// We only store duration (e.g. 10 min) from frontend.
// This middleware automatically converts it into an exact expiry time.
// Keeps logic centralized → avoids bugs + no need to calculate in controller/frontend.
orderSchema.pre("save", async function () {
  if (!this.expiresAt) {
    this.expiresAt = new Date(Date.now() + this.duration * 60 * 1000);
  }
  
});


// 🔥 VIRTUAL FIELD (NOT STORED IN DB)
// WHY:
// UI frequently needs: "₹X more needed".
// Instead of recalculating everywhere, we define it once here.
orderSchema.virtual("remainingAmount").get(function () {
  return this.targetAmount - this.currentAmount;
});


// 🔥 INDEX FOR PERFORMANCE
// WHY:
// Most queries = "get active orders in a hostel".
// This index makes those queries much faster when data grows.
orderSchema.index({ hostel: 1, status: 1 });

export default mongoose.model("Order", orderSchema);