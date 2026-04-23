import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { API } from "../../../api/api.js";

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  useEffect(() => {
  const token = localStorage.getItem("token");

  if (token) {
    navigate("/home");
  }
}, []);

  // 🔥 Send OTP function (connects to backend)
  const handleSendOTP = async () => {
    console.log("🔥 Button clicked");
    try {
      if (!email) {
        alert("Please enter email");
        return;
      }

      const res = await API.post("/auth/send-otp", { email });

      console.log("OTP Response:", res.data);

      // 💾 Save email for OTP page
      localStorage.setItem("email", email);

      // 🔀 Navigate only after success
      navigate("/otp");

    } catch (err) {
      console.log(err);
      alert("Failed to send OTP");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#EEF2F7] to-[#DDE3EC] flex items-center justify-center px-6">
      
      {/* 🔹 Logo */}
      <div className="absolute top-6 right-6 text-right">
        <h2 className="text-2xl font-bold text-[#6C5CE7]">
          OrderMate
        </h2>
        <p className="text-xs text-gray-500 mt-1">
          Order together. Save together.
        </p>
      </div>

      {/* 🔹 Card */}
      <div className="w-full max-w-md p-10 rounded-3xl 
        bg-[#E6EAF0]/80 backdrop-blur-xl
        shadow-[12px_12px_24px_#C5C9D0,-12px_-12px_24px_#FFFFFF]">

        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold text-gray-800 tracking-tight">
            Welcome to OrderMate
          </h1>

          <p className="text-sm text-gray-500 mt-2">
            Order together. Save together.
          </p>
        </div>

        {/* Input */}
        <div className="mb-6">
          <input
            type="email" // ✅ fixed
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter email address"
            className="w-full text-sm text-gray-800 p-4 rounded-xl outline-none 
            bg-[#E6EAF0]
            shadow-[inset_6px_6px_12px_#C5C9D0,inset_-6px_-6px_12px_#FFFFFF]
            focus:shadow-[inset_3px_3px_6px_#C5C9D0,inset_-3px_-3px_6px_#FFFFFF]"
          />
        </div>

        {/* Button */}
        <button
          onClick={handleSendOTP} // 🔥 connected to backend
          className="w-full text-sm font-medium py-4 rounded-xl 
          text-white bg-[#6C5CE7]
          shadow-[6px_6px_12px_#C5C9D0,-6px_-6px_12px_#FFFFFF]
          active:shadow-[inset_6px_6px_12px_#C5C9D0,inset_-6px_-6px_12px_#FFFFFF]
          active:scale-95
          transition duration-150"
        >
          Send OTP
        </button>

        {/* Footer */}
        <p className="text-xs text-gray-400 text-center mt-6">
          By continuing, you agree to our Terms & Privacy Policy
        </p>

      </div>
    </div>
  );
}

export default Login;