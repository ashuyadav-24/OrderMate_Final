import crypto from "crypto";
import bcrypt from "bcryptjs";
import User from "../models/user.models.js";
import { generateToken } from "../config/jwt.js";
import { sendOTPEmail } from "../utils/sendEmail.js";



// ─────────────────────────────────────────────
// 📧 SEND OTP
// POST /api/auth/send-otp
// ─────────────────────────────────────────────
export const sendOTP = async (req, res) => {
  console.log("STEP 1: Request received");
  

  try {
    const { email } = req.body;
    console.log("STEP 2: Email:", email);

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // 🔐 Generate OTP
    const plainOTP = Math.floor(Math.random() * 10000).toString().padStart(4, "0");
    console.log("STEP 3: OTP:", plainOTP);

    // 🔒 Hash OTP
    const hashedOTP = await bcrypt.hash(plainOTP, 10);

    // 💾 Save OTP in DB
    await User.findOneAndUpdate(
      { email },
      {
        email,
        otp: hashedOTP,
        otpExpiry: new Date(Date.now() + 10 * 60 * 1000), // 10 mins
      },
      { upsert: true, new: true }
    );

    console.log("STEP 4: Saved to DB");

    // 📧 Send email (NON-BLOCKING)
    console.log("CALLING EMAIL FUNCTION...");
    sendOTPEmail(email, plainOTP)
      .then(() => console.log("📧 Email sent"))
      .catch(err => console.log("❌ Email error:", err.message));

    console.log("STEP 5: Response sent");

    return res.status(200).json({
      message: "OTP sent to your email",
    });

  } catch (error) {
    console.log("ERROR:", error);
    return res.status(500).json({ message: "Failed to send OTP" });
  }
};

// ─────────────────────────────────────────────
// ✅ VERIFY OTP
// POST /api/auth/verify-otp
// ─────────────────────────────────────────────
export const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    console.log("VERIFY REQUEST:", { email, otp });

    const user = await User.findOne({ email }).select("+otp +otpExpiry");

    console.log("USER FROM DB:", user);

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    if (!user.otp) {
      return res.status(400).json({ message: "OTP not found. Request again." });
    }

    console.log("OTP IN DB:", user.otp);
    console.log("EXPIRY:", user.otpExpiry);

    if (!user.otpExpiry || user.otpExpiry < new Date()) {
      return res.status(400).json({ message: "OTP expired. Request again." });
    }

    const isMatch = await bcrypt.compare(otp, user.otp);

    console.log("MATCH RESULT:", isMatch);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    user.otp = undefined;
    user.otpExpiry = undefined;
    user.isVerified = true;
    await user.save();

    const token = generateToken(user._id);

    return res.status(200).json({
      message: "OTP verified successfully",
      token,
      isNewUser: !user.isProfileComplete,
      // ✅ Always return user object so frontend can save it
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        userName: user.userName,
        collegeName: user.collegeName,
        hostelName: user.hostelName,
        isVerified: user.isVerified,
        isProfileComplete: user.isProfileComplete,
      },
    });

  } catch (error) {
    console.error("VERIFY ERROR:", error); // 🔥 THIS IS KEY
    return res.status(500).json({ message: "Server error" });
  }
};
// ─────────────────────────────────────────────
// 📋 COMPLETE PROFILE
// PUT /api/auth/profile
// ─────────────────────────────────────────────
export const completeProfile = async (req, res) => {
  try {
    const { name, gender, collegeName, hostelName, phoneNo, userName } = req.body;

    // 🔍 Check username uniqueness
    if (userName) {
      const taken = await User.findOne({
        userName,
        _id: { $ne: req.user._id },
      });

      if (taken) {
        return res.status(409).json({ message: "Username already taken" });
      }
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
     {
  name,
  gender,
  collegeName,
  hostelName,
  phoneNo,
  userName,
  isProfileComplete: true 
},
      { new: true, runValidators: true }
    );

    return res.status(200).json({
      message: "Profile updated",
      user,
    });

  } catch (error) {
    console.error("Profile error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// ─────────────────────────────────────────────
// 👤 GET ME
// GET /api/auth/me
// ─────────────────────────────────────────────
export const getMe = async (req, res) => {
  return res.status(200).json({ user: req.user });
};