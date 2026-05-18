import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

/*
🧠 Purpose:
This file sends OTP emails using Gmail SMTP + Nodemailer.
*/

// ✅ Create transporter
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: true, // true for 587

  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASS,
  },

  // ✅ Timeout fixes for Render free tier
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 10000,
});

/*
✅ Verify SMTP connection when server starts
*/
transporter.verify((error, success) => {
  if (error) {
    console.log("❌ SMTP Connection Error:", error.message);
  } else {
    console.log("✅ SMTP Server Ready");
  }
});

/*
📧 Function to send OTP email
*/
export const sendOTPEmail = async (toEmail, otp) => {
  try {
    console.log("📩 Starting email process...");
    console.log("📧 Sending email to:", toEmail);

    // ✅ Email template
    const mailOptions = {
      from: `"GroupOrder App" <${process.env.GMAIL_USER}>`,
      to: toEmail,
      subject: "Your OTP Code 🔐",

      html: `
        <div style="font-family: Arial; max-width: 400px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          
          <h2 style="color:#333;">Your Login OTP</h2>

          <p>
            Use the OTP below to continue.
            This OTP expires in <strong>10 minutes</strong>.
          </p>

          <div style="
            font-size: 32px;
            font-weight: bold;
            letter-spacing: 5px;
            margin: 20px 0;
            color: #2c3e50;
          ">
            ${otp}
          </div>

          <p style="font-size: 12px; color: gray;">
            If you didn't request this OTP, you can safely ignore this email.
          </p>

        </div>
      `,
    };

    // ✅ WAIT for email to send
    const info = await transporter.sendMail(mailOptions);

    console.log("✅ Email sent successfully");
    console.log("📨 Response:", info.response);

    return true;

  } catch (error) {

    console.log("❌ Email sending failed");
    console.log("❌ Error:", error.message);

    return false;
  }
};