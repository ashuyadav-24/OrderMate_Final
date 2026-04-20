import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();
/*
🧠 What is this file?
This file is responsible for sending OTP emails to users.

Flow:
Backend → Nodemailer → Gmail → User inbox 📧
*/

// ✅ Create transporter (connection between your server and Gmail)
const transporter = nodemailer.createTransport({
  service: "gmail", // using Gmail SMTP service
  auth: {
    user: process.env.GMAIL_USER,      // your Gmail (sender)
    pass: process.env.GMAIL_APP_PASS,  // App Password (NOT normal password)
  },
});

/*
📌 Why transporter?
It acts like a "bridge" that allows your backend to send emails via Gmail.
*/

// ✅ Function to send OTP email
export const sendOTPEmail = async (toEmail, otp) => {
  try {
    // 🪵 Debug log (helps you see flow in terminal)
    console.log("📧 Sending email to:", toEmail);

    // 📦 Email content configuration
    const mailOptions = {
      // 👤 Sender (what user sees)
      from: `"GroupOrder App" <${process.env.GMAIL_USER}>`,

      // 📬 Receiver
      to: toEmail,

      // 📝 Subject line
      subject: "Your OTP Code 🔐",

      // 🎨 HTML email (better UI than plain text)
      html: `
        <div style="font-family: Arial; max-width: 400px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2>Your Login OTP</h2>
          <p>Use the code below. It expires in <strong>10 minutes</strong>.</p>

          <!-- OTP displayed big for clarity -->
          <div style="font-size: 32px; font-weight: bold; letter-spacing: 5px;">
            ${otp}
          </div>

          <p style="font-size: 12px; color: gray;">
            If you didn't request this, ignore this email.
          </p>
        </div>
      `,
    };

    /*
    📤 Send email
    This actually calls Gmail servers and sends the email
    */
    const info = await transporter.sendMail(mailOptions);

    // ✅ Success log
    console.log("✅ Email sent:", info.response);

    return true;

  } catch (error) {
    /*
    ❌ If anything fails:
    - wrong app password
    - network issue
    - Gmail blocked request
    */
    console.log("❌ Email error:", error.message);

    return false;
  }
};