import express from "express";
import { sendOTP, verifyOTP, completeProfile, getMe } from "../controllers/auth.controller.js";
import protect from "../middlewares/protect.js";

const router = express.Router();

// 🌐 Public — no token needed
router.post("/send-otp", sendOTP);       // Step 1: enter email → get OTP
router.post("/verify-otp", verifyOTP);   // Step 2: enter OTP → get JWT token

// 🛡️ Protected — need JWT token in Authorization header
router.put("/profile", protect, completeProfile);  // Step 3: fill profile (new users)
router.get("/me", protect, getMe);                 // Get current user anytime

export default router;
