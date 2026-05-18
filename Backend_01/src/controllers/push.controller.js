import webpush from "web-push";
import User from "../models/user.models.js";

// Configure VAPID keys (set these in your .env)
webpush.setVapidDetails(
  "mailto:your@email.com",
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

// ─────────────────────────────────────────────
// 💾 SAVE PUSH SUBSCRIPTION
// POST /api/push/subscribe
// 🛡️ Protected
// Frontend calls this after user grants permission
// ─────────────────────────────────────────────
export const subscribe = async (req, res) => {
  try {
    const { subscription } = req.body;

    if (!subscription) {
      return res.status(400).json({ message: "Subscription required" });
    }

    // Save subscription to user document
    await User.findByIdAndUpdate(req.user._id, {
      pushSubscription: subscription,
    });

    res.json({ message: "Subscribed to push notifications" });
  } catch (error) {
    console.error("Subscribe error:", error);
    res.status(500).json({ message: "Error saving subscription" });
  }
};

// ─────────────────────────────────────────────
// 📤 SEND PUSH TO A SPECIFIC USER
// Called internally from request/order controllers
// ─────────────────────────────────────────────
export const sendPushToUser = async (userId, payload) => {
  try {
    const user = await User.findById(userId).select("pushSubscription");

    if (!user?.pushSubscription) return; // user hasn't subscribed yet

    await webpush.sendNotification(
      user.pushSubscription,
      JSON.stringify(payload)
    );
  } catch (error) {
    // Subscription expired or invalid — clean it up
    if (error.statusCode === 410) {
      await User.findByIdAndUpdate(userId, {
        $unset: { pushSubscription: 1 },
      });
    }
    console.error("Push error:", error.message);
  }
};
