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

  const handleSendOTP = async () => {
    console.log("🔥 Button clicked");
    try {
      if (!email) {
        alert("Please enter email");
        return;
      }
      const res = await API.post("/auth/send-otp", { email });
      console.log("OTP Response:", res.data);
      localStorage.setItem("email", email);
      navigate("/otp");
    } catch (err) {
      console.log(err);
      alert("Failed to send OTP");
    }
  };

  return (
    <div style={styles.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .login-page { font-family: 'DM Sans', sans-serif; }

        .grid-bg {
          position: fixed;
          inset: 0;
          background-image:
            linear-gradient(rgba(139, 92, 246, 0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(139, 92, 246, 0.04) 1px, transparent 1px);
          background-size: 48px 48px;
          pointer-events: none;
        }

        .orb1 {
          position: fixed;
          top: -120px;
          left: -120px;
          width: 480px;
          height: 480px;
          background: radial-gradient(circle, rgba(109, 40, 217, 0.3) 0%, transparent 70%);
          pointer-events: none;
        }

        .orb2 {
          position: fixed;
          bottom: -100px;
          right: -100px;
          width: 400px;
          height: 400px;
          background: radial-gradient(circle, rgba(59, 130, 246, 0.2) 0%, transparent 70%);
          pointer-events: none;
        }

        .logo-word {
          font-family: 'Syne', sans-serif;
          font-weight: 800;
          font-size: 22px;
          background: linear-gradient(135deg, #a78bfa, #60a5fa);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          letter-spacing: -0.5px;
        }

        .logo-tag {
          font-size: 11px;
          color: #4b5563;
          margin-top: 2px;
          letter-spacing: 0.5px;
        }

        .card {
          background: rgba(15, 15, 25, 0.85);
          border: 1px solid rgba(139, 92, 246, 0.18);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border-radius: 24px;
          padding: 44px 40px;
          width: 100%;
          max-width: 420px;
          position: relative;
          overflow: hidden;
        }

        .card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(167, 139, 250, 0.5), transparent);
        }

        .card-title {
          font-family: 'Syne', sans-serif;
          font-size: 26px;
          font-weight: 700;
          color: #f1f5f9;
          letter-spacing: -0.5px;
          margin-bottom: 6px;
        }

        .card-sub {
          font-size: 13px;
          color: #64748b;
          margin-bottom: 36px;
        }

        .input-label {
          font-size: 11px;
          font-weight: 500;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 8px;
          display: block;
        }

        .email-input {
          width: 100%;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
          padding: 14px 16px;
          color: #e2e8f0;
          font-size: 14px;
          font-family: 'DM Sans', sans-serif;
          outline: none;
          transition: all 0.2s ease;
        }

        .email-input::placeholder { color: #4b5563; }

        .email-input:focus {
          border-color: rgba(139, 92, 246, 0.6);
          background: rgba(139, 92, 246, 0.06);
          box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
        }

        .send-btn {
          width: 100%;
          padding: 15px;
          border-radius: 12px;
          border: none;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          font-weight: 600;
          color: #fff;
          background: linear-gradient(135deg, #7c3aed, #4f46e5);
          letter-spacing: 0.3px;
          transition: all 0.2s ease;
          position: relative;
          overflow: hidden;
          margin-top: 24px;
        }

        .send-btn::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, #8b5cf6, #6366f1);
          opacity: 0;
          transition: opacity 0.2s ease;
        }

        .send-btn:hover::before { opacity: 1; }
        .send-btn:active { transform: scale(0.98); }

        .send-btn span { position: relative; z-index: 1; }

        .footer-text {
          font-size: 11px;
          color: #374151;
          text-align: center;
          margin-top: 24px;
        }

        .divider {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 24px 0;
        }

        .divider-line {
          flex: 1;
          height: 1px;
          background: rgba(255,255,255,0.06);
        }

        .divider-text {
          font-size: 11px;
          color: #374151;
        }
      `}</style>

      <div className="grid-bg" />
      <div className="orb1" />
      <div className="orb2" />

      {/* Logo */}
      <div style={{ position: 'absolute', top: 24, right: 28, textAlign: 'right' }}>
        <div className="logo-word">OrderMate</div>
        <div className="logo-tag">Order together. Save together.</div>
      </div>

      {/* Card */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '0 24px' }}>
        <div className="card">
          <div style={{ marginBottom: 32 }}>
            <div className="card-title">Welcome back</div>
            <div className="card-sub">Sign in with your college email to continue</div>
          </div>

          <label className="input-label">Email Address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@nitjsr.ac.in"
            className="email-input"
          />

          <button onClick={handleSendOTP} className="send-btn">
            <span>Send OTP →</span>
          </button>

          <p className="footer-text">
            By continuing, you agree to our Terms &amp; Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    background: '#080810',
    position: 'relative',
    fontFamily: "'DM Sans', sans-serif",
  }
};

export default Login;
