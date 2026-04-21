import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { API } from "../../../api/api";

function OtpVerification() {
  const inputs = useRef([]);
  const navigate = useNavigate();

  // 🔹 Handle input change
  const handleChange = (e, index) => {
    const value = e.target.value;

    // Allow only digits
    if (!/^[0-9]?$/.test(value)) return;

    // Move to next input
    if (value && index < inputs.current.length - 1) {
      inputs.current[index + 1].focus();
    }
  };

  // 🔹 Handle backspace
  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !e.target.value && index > 0) {
      inputs.current[index - 1].focus();
    }
  };

  // 🔥 VERIFY OTP FUNCTION
  const handleVerifyOTP = async () => {
    try {
      const otp = inputs.current.map((input) => input.value).join("");

      if(otp.length !== 4) {
        alert("Enter full OTP");
        return;
      }

      const email = localStorage.getItem("email");

      const res = await API.post("/auth/verify-otp", {
        email,
        otp,
      });

      const { token, isNewUser, user } = res.data;

      // Save token and user
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      // Redirect
      if (isNewUser) {
        navigate("/createAccount");
      } else {
        navigate("/home");
      }

    } catch (err) {
      console.log(err);
      alert("Invalid OTP");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#EEF2F7] to-[#DDE3EC] flex items-center justify-center px-6">

      {/* Logo */}
      <div className="absolute top-6 right-6 text-right">
        <h2 className="text-2xl font-bold text-[#6C5CE7]">
          OrderMate
        </h2>
        <p className="text-xs text-gray-500 mt-1">
          Order together. Save together.
        </p>
      </div>

      {/* Card */}
      <div className="w-full max-w-md p-10 rounded-3xl 
        bg-[#E6EAF0]/80 backdrop-blur-xl
        shadow-[12px_12px_24px_#C5C9D0,-12px_-12px_24px_#FFFFFF]">

        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold text-gray-800 tracking-tight">
            Verify OTP
          </h1>

          <p className="text-sm text-gray-500 mt-2">
            Enter the code sent to your email
          </p>
        </div>

        {/* OTP Inputs */}
        <div className="flex justify-between gap-2 mb-6">
          {[...Array(4)].map((_, index) => (
            <input
              key={index}
              type="tel"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength="1"
              ref={(el) => (inputs.current[index] = el)}
              onChange={(e) => handleChange(e, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className="w-12 h-12 text-center text-lg font-semibold text-gray-800 rounded-xl outline-none 
              bg-[#E6EAF0]
              shadow-[inset_6px_6px_12px_#C5C9D0,inset_-6px_-6px_12px_#FFFFFF]
              focus:shadow-[inset_3px_3px_6px_#C5C9D0,inset_-3px_-3px_6px_#FFFFFF]"
            />
          ))}
        </div>

        {/* Button */}
        <button
          onClick={handleVerifyOTP}
          className="w-full text-sm font-semibold py-4 rounded-xl 
          text-white bg-[#6C5CE7]
          shadow-[6px_6px_12px_#C5C9D0,-6px_-6px_12px_#FFFFFF]
          active:shadow-[inset_6px_6px_12px_#C5C9D0,inset_-6px_-6px_12px_#FFFFFF]
          active:scale-95
          transition duration-150"
        >
          Verify OTP
        </button>

        {/* Resend */}
        <p className="text-sm text-gray-500 text-center mt-6">
          Didn’t receive code?{" "}
          <span className="text-[#4A90E2] font-medium cursor-pointer">
            Resend
          </span>
        </p>

      </div>
    </div>
  );
}

export default OtpVerification;