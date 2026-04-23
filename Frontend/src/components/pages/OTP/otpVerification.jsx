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

  const handleResend = async () => {
    try {
      setResending(true);
      const email = localStorage.getItem("email");
      await API.post("/auth/send-otp", { email });
      showToast("New OTP sent to your email!", "success");
      inputs.current.forEach((input) => (input.value = ""));
      inputs.current[0]?.focus();
    } catch (err) {
      showToast("Failed to resend OTP. Try again.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#080810', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 24px', position: 'relative' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500;600&display=swap');

        .otp-grid-bg {
          position: fixed; inset: 0;
          background-image:
            linear-gradient(rgba(139,92,246,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(139,92,246,0.04) 1px, transparent 1px);
          background-size: 48px 48px;
          pointer-events: none;
        }
        .otp-orb {
          position: fixed; top: -120px; right: -120px;
          width: 400px; height: 400px;
          background: radial-gradient(circle, rgba(109,40,217,0.25) 0%, transparent 70%);
          pointer-events: none;
        }
        .otp-orb2 {
          position: fixed; bottom: -80px; left: -80px;
          width: 300px; height: 300px;
          background: radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%);
          pointer-events: none;
        }
        .otp-logo {
          font-family: 'Syne', sans-serif;
          font-weight: 800; font-size: 22px;
          background: linear-gradient(135deg, #a78bfa, #60a5fa);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
        }
        .otp-card {
          background: rgba(15,15,25,0.88);
          border: 1px solid rgba(139,92,246,0.18);
          backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px);
          border-radius: 24px; padding: 44px 40px;
          width: 100%; max-width: 420px; position: relative; overflow: hidden;
        }
        .otp-card::before {
          content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(167,139,250,0.5), transparent);
        }
        .otp-title {
          font-family: 'Syne', sans-serif; font-size: 26px; font-weight: 700;
          color: #f1f5f9; letter-spacing: -0.5px; margin-bottom: 6px;
        }
        .otp-sub { font-size: 13px; color: #64748b; margin-bottom: 36px; line-height: 1.6; }
        .otp-highlight { color: #a78bfa; font-weight: 500; }

        .otp-box {
          width: 64px; height: 68px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 14px;
          text-align: center;
          font-family: 'Syne', sans-serif;
          font-size: 24px; font-weight: 700;
          color: #e2e8f0;
          outline: none;
          transition: all 0.2s ease;
          caret-color: #a78bfa;
        }
        .otp-box:focus {
          border-color: rgba(139,92,246,0.7);
          background: rgba(139,92,246,0.08);
          box-shadow: 0 0 0 3px rgba(139,92,246,0.12), 0 0 20px rgba(139,92,246,0.15);
        }
        .verify-btn {
          width: 100%; padding: 15px; border-radius: 12px; border: none; cursor: pointer;
          font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 600;
          color: #fff; background: linear-gradient(135deg, #7c3aed, #4f46e5);
          transition: all 0.2s ease; position: relative; overflow: hidden; margin-top: 28px;
        }
        .verify-btn::before {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(135deg, #8b5cf6, #6366f1);
          opacity: 0; transition: opacity 0.2s ease;
        }
        .verify-btn:hover::before { opacity: 1; }
        .verify-btn:active { transform: scale(0.98); }
        .verify-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .verify-btn span { position: relative; z-index: 1; }
        .resend-row { text-align: center; margin-top: 22px; font-size: 13px; color: #4b5563; }
        .resend-link { color: #a78bfa; font-weight: 500; cursor: pointer; }
        .resend-link:hover { text-decoration: underline; }
        .resend-link.disabled { opacity: 0.4; cursor: not-allowed; }

        .otp-toast {
          position: fixed; top: 20px; left: 50%; transform: translateX(-50%);
          z-index: 999; padding: 12px 22px; border-radius: 12px;
          font-size: 13px; font-weight: 500; color: #fff;
          font-family: 'DM Sans', sans-serif;
          box-shadow: 0 8px 32px rgba(0,0,0,0.4);
          animation: slideDown 0.3s ease;
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateX(-50%) translateY(-8px); }
          to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>

      <div className="otp-grid-bg" />
      <div className="otp-orb" />
      <div className="otp-orb2" />

      {toast && (
        <div className="otp-toast" style={{ background: toast.type === 'success' ? 'linear-gradient(135deg,#059669,#047857)' : 'linear-gradient(135deg,#dc2626,#b91c1c)' }}>
          {toast.msg}
        </div>
      )}

      <div style={{ position: 'absolute', top: 24, right: 28, textAlign: 'right' }}>
        <div className="otp-logo">OrderMate</div>
        <div style={{ fontSize: 11, color: '#374151', marginTop: 2 }}>Order together. Save together.</div>
      </div>

      <div className="otp-card">
        <div className="otp-title">Verify your email</div>
        <div className="otp-sub">
          Enter the 4-digit code sent to{" "}
          <span className="otp-highlight">{localStorage.getItem("email")}</span>
        </div>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginBottom: 8 }}>
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
              className="otp-box"
            />
          ))}
        </div>

        <button onClick={handleVerifyOTP} disabled={loading} className="verify-btn">
          <span>{loading ? "Verifying..." : "Verify OTP →"}</span>
        </button>

        <div className="resend-row">
          Didn't receive code?{" "}
          <span
            onClick={!resending ? handleResend : undefined}
            className={`resend-link ${resending ? 'disabled' : ''}`}
          >
            {resending ? "Sending..." : "Resend OTP"}
          </span>
        </div>
      </div>
    </div>
  );
}

export default OtpVerification;
