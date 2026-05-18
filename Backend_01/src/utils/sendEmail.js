import dotenv from "dotenv";
import SibApiV3Sdk from "sib-api-v3-sdk";

dotenv.config();

const client = SibApiV3Sdk.ApiClient.instance;

const apiKey = client.authentications["api-key"];
apiKey.apiKey = process.env.BREVO_API_KEY;

const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

export const sendOTPEmail = async (toEmail, otp) => {
  try {

    console.log("📩 Sending OTP via Brevo API...");

    const sendSmtpEmail = {
      sender: {
        email: process.env.BREVO_EMAIL,
        name: "OrderMate",
      },

      to: [
        {
          email: toEmail,
        },
      ],

      subject: "Your OTP Code 🔐",

      htmlContent: `
        <div style="
          font-family: Arial;
          max-width: 400px;
          margin: auto;
          padding: 20px;
          border: 1px solid #eee;
          border-radius: 10px;
        ">

          <h2>Your Login OTP</h2>

          <p>
            Use the OTP below to continue.
            This OTP expires in <strong>10 minutes</strong>.
          </p>

          <div style="
            font-size: 32px;
            font-weight: bold;
            letter-spacing: 5px;
            margin: 20px 0;
          ">
            ${otp}
          </div>

        </div>
      `,
    };

    const result = await apiInstance.sendTransacEmail(sendSmtpEmail);

    console.log("✅ OTP Email sent");
    console.log(result);

    return true;

  } catch (error) {

    console.log("❌ Brevo API Error");

    if (error.response) {
      console.log(error.response.body);
    } else {
      console.log(error.message);
    }

    return false;
  }
};