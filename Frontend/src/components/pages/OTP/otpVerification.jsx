import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API } from "../../../api/api";

function OtpVerification() {
  const inputs = useRef([]);
  const navigate = useNavigate();
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const showToast = (msg, type = "error") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleChange = (e, index) => {
    const value = e.target.value;
    if (!/^[0-9]?$/.test(value)) return;
    if (value && index < inputs.current.length - 1) {
      inputs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !e.target.value && index > 0) {
      inputs.current[index - 1].focus();
    }
  };

  const handleVerifyOTP = async () => {
    try {
      setLoading(true);
      const otp = inputs.current.map((input) => input.value).join("");

      if (otp.length !== 4) {
        showToast("Please enter the full 4-digit OTP");
        return;
      }

      const email = localStorage.getItem("email");
      const res = await API.post("/auth/verify-otp", { email, otp });

      const { token, isNewUser, user } = res.data;

      // ✅ Save token + user — this is what prevents logout on tab close
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      if (isNewUser) {
        navigate("/createAccount");
      } else {
        navigate("/home");
      }

    } catch (err) {
      console.log(err);
      showToast(err.response?.data?.message || "Invalid OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Resend OTP
  const handleResend = async () => {
    try {
      setResending(true);
      const email = localStorage.getItem("email");
      await API.post("/auth/send-otp", { email });
      showToast("New OTP sent to your email!", "success");
      // Clear inputs
      inputs.current.forEach((input) => (input.value = ""));
      inputs.current[0]?.focus();
    } catch (err) {
      showToast("Failed to resend OTP. Try again.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#EEF2F7] to-[#DDE3EC] flex items-center justify-center px-6">

      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-xl shadow-lg text-white text-sm font-medium max-w-xs text-center
          ${toast.type === "success" ? "bg-green-500" : "bg-red-500"}`}>
          {toast.msg}
        </div>
      )}

      {/* Logo */}
      <div className="absolute top-6 right-6 text-right">
        <h2 className="text-2xl font-bold text-[#6C5CE7]">OrderMate</h2>
        <p className="text-xs text-gray-500 mt-1">Order together. Save together.</p>
      </div>

      {/* Card */}
      <div className="w-full max-w-md p-10 rounded-3xl
        bg-[#E6EAF0]/80 backdrop-blur-xl
        shadow-[12px_12px_24px_#C5C9D0,-12px_-12px_24px_#FFFFFF]">

        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold text-gray-800 tracking-tight">Verify OTP</h1>
          <p className="text-sm text-gray-500 mt-2">
            Enter the 4-digit code sent to{" "}
            <span className="text-[#6C5CE7] font-medium">
              {localStorage.getItem("email")}
            </span>
          </p>
        </div>

        {/* OTP Inputs */}
        <div className="flex justify-center gap-4 mb-6">
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
              className="w-14 h-14 text-center text-xl font-semibold text-gray-800 rounded-xl outline-none
              bg-[#E6EAF0]
              shadow-[inset_6px_6px_12px_#C5C9D0,inset_-6px_-6px_12px_#FFFFFF]
              focus:shadow-[inset_3px_3px_6px_#C5C9D0,inset_-3px_-3px_6px_#FFFFFF]"
            />
          ))}
        </div>

        {/* Verify Button */}
        <button
          onClick={handleVerifyOTP}
          disabled={loading}
          className="w-full text-sm font-semibold py-4 rounded-xl
          text-white bg-[#6C5CE7]
          shadow-[6px_6px_12px_#C5C9D0,-6px_-6px_12px_#FFFFFF]
          active:shadow-[inset_6px_6px_12px_#C5C9D0,inset_-6px_-6px_12px_#FFFFFF]
          active:scale-95 transition duration-150 disabled:opacity-60">
          {loading ? "Verifying..." : "Verify OTP"}
        </button>

        {/* Resend */}
        <p className="text-sm text-gray-500 text-center mt-6">
          Didn't receive code?{" "}
          <span
            onClick={!resending ? handleResend : undefined}
            className={`text-[#6C5CE7] font-medium cursor-pointer ${resending ? "opacity-50" : "hover:underline"}`}>
            {resending ? "Sending..." : "Resend OTP"}
          </span>
        </p>

      </div>
    </div>
  );
}

export default OtpVerification;
