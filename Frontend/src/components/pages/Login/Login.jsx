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

  const features = [
    {
      icon: "🛒",
      title: "Create a Group Order",
      desc: "Pick a platform — Instamart, Zepto, Blinkit — set a target amount and a countdown timer.",
    },
    {
      icon: "📣",
      title: "Let Your Hostel Know",
      desc: "Your order goes live instantly. Anyone in your hostel can see it and request to join.",
    },
    {
      icon: "💬",
      title: "Chat & Coordinate",
      desc: "Once matched, jump into a real-time chat room to finalize what everyone needs.",
    },
    {
      icon: "💸",
      title: "Split & Save Together",
      desc: "Hit the minimum order amount together and everyone saves on delivery fees.",
    },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#080810', position: 'relative', fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .lg-grid {
          position: fixed; inset: 0;
          background-image:
            linear-gradient(rgba(139,92,246,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(139,92,246,0.04) 1px, transparent 1px);
          background-size: 48px 48px; pointer-events: none;
        }
        .lg-orb1 {
          position: fixed; top: -120px; left: -120px;
          width: 500px; height: 500px;
          background: radial-gradient(circle, rgba(109,40,217,0.28) 0%, transparent 70%);
          pointer-events: none;
        }
        .lg-orb2 {
          position: fixed; bottom: -100px; right: -100px;
          width: 420px; height: 420px;
          background: radial-gradient(circle, rgba(59,130,246,0.18) 0%, transparent 70%);
          pointer-events: none;
        }

        .lg-logo {
          font-family: 'Syne', sans-serif; font-weight: 800; font-size: 22px;
          background: linear-gradient(135deg, #a78bfa, #60a5fa);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
          letter-spacing: -0.5px;
        }
        .lg-logo-tag { font-size: 11px; color: #8b95a5; margin-top: 2px; letter-spacing: 0.5px; }

        .lg-layout {
          min-height: 100vh;
          display: flex; align-items: center; justify-content: center;
          padding: 64px 40px; gap: 72px; position: relative; z-index: 1;
        }

        /* ── Left ── */
        .lg-left { flex: 1; max-width: 460px; }

        .lg-headline {
          font-family: 'Syne', sans-serif;
          font-size: clamp(30px, 3.5vw, 46px);
          font-weight: 800; color: #f1f5f9;
          line-height: 1.12; letter-spacing: -1.5px;
          margin-bottom: 16px;
        }
        .lg-headline-accent {
          background: linear-gradient(135deg, #a78bfa, #60a5fa);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
        }

        .lg-tagline {
          font-size: 14px; color: #8b95a5; line-height: 1.75;
          margin-bottom: 36px; max-width: 400px;
        }

        .lg-features { display: flex; flex-direction: column; gap: 8px; }

        .lg-feature {
          display: flex; align-items: flex-start; gap: 14px;
          padding: 15px 18px; border-radius: 16px;
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.05);
          transition: all 0.25s ease;
          animation: lgFadeUp 0.5s ease both;
        }
        .lg-feature:nth-child(1) { animation-delay: 0.05s; }
        .lg-feature:nth-child(2) { animation-delay: 0.13s; }
        .lg-feature:nth-child(3) { animation-delay: 0.21s; }
        .lg-feature:nth-child(4) { animation-delay: 0.29s; }
        .lg-feature:hover {
          background: rgba(139,92,246,0.08);
          border-color: rgba(139,92,246,0.22);
          transform: translateX(5px);
        }

        @keyframes lgFadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .lg-feat-icon {
          width: 40px; height: 40px; border-radius: 12px; flex-shrink: 0;
          background: rgba(124,58,237,0.15);
          border: 1px solid rgba(139,92,246,0.22);
          display: flex; align-items: center; justify-content: center;
          font-size: 18px;
        }
        .lg-feat-title {
          font-family: 'Syne', sans-serif; font-size: 14px; font-weight: 700;
          color: #e2e8f0; margin-bottom: 3px; letter-spacing: -0.2px;
        }
        .lg-feat-desc { font-size: 12px; color: #8b95a5; line-height: 1.6; }

        .lg-stats {
          display: flex; gap: 0; margin-top: 32px; padding-top: 24px;
          border-top: 1px solid rgba(255,255,255,0.05);
        }
        .lg-stat {
          flex: 1; display: flex; flex-direction: column; gap: 3px;
          padding: 0 20px;
        }
        .lg-stat:first-child { padding-left: 0; }
        .lg-stat + .lg-stat { border-left: 1px solid rgba(255,255,255,0.06); }
        .lg-stat-num {
          font-family: 'Syne', sans-serif; font-size: 22px; font-weight: 800;
          color: #a78bfa; letter-spacing: -0.5px;
        }
        .lg-stat-label { font-size: 11px; color: #8b95a5; }

        /* ── Right: Card ── */
        .lg-card {
          background: rgba(15,15,25,0.88);
          border: 1px solid rgba(139,92,246,0.18);
          backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px);
          border-radius: 24px; padding: 44px 40px;
          width: 100%; max-width: 400px; flex-shrink: 0;
          position: relative; overflow: hidden;
          animation: lgFadeUp 0.4s ease both;
        }
        .lg-card::before {
          content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(167,139,250,0.5), transparent);
        }

        .lg-card-title {
          font-family: 'Syne', sans-serif; font-size: 24px; font-weight: 700;
          color: #f1f5f9; letter-spacing: -0.5px; margin-bottom: 6px;
        }
        .lg-card-sub { font-size: 13px; color: #8b95a5; margin-bottom: 32px; }

        .lg-input-label {
          font-size: 11px; font-weight: 500; color: #94a3b8;
          text-transform: uppercase; letter-spacing: 1px;
          margin-bottom: 8px; display: block;
        }

        .lg-email-input {
          width: 100%;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 12px; padding: 14px 16px;
          color: #e2e8f0; font-size: 14px;
          font-family: 'DM Sans', sans-serif;
          outline: none; transition: all 0.2s ease;
        }
        .lg-email-input::placeholder { color: #6b7280; }
        .lg-email-input:focus {
          border-color: rgba(139,92,246,0.6);
          background: rgba(139,92,246,0.06);
          box-shadow: 0 0 0 3px rgba(139,92,246,0.1);
        }

        .lg-send-btn {
          width: 100%; padding: 15px; border-radius: 12px; border: none; cursor: pointer;
          font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 600;
          color: #fff; background: linear-gradient(135deg, #7c3aed, #4f46e5);
          letter-spacing: 0.3px; transition: all 0.2s ease;
          position: relative; overflow: hidden; margin-top: 22px;
        }
        .lg-send-btn::before {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(135deg, #8b5cf6, #6366f1);
          opacity: 0; transition: opacity 0.2s ease;
        }
        .lg-send-btn:hover::before { opacity: 1; }
        .lg-send-btn:active { transform: scale(0.98); }
        .lg-send-btn span { position: relative; z-index: 1; }

        .lg-footer-text {
          font-size: 11px; color: #6b7280; text-align: center; margin-top: 22px;
        }

        /* trust badges */
        .lg-badges {
          display: flex; gap: 8px; flex-wrap: wrap; margin-top: 22px;
        }
        .lg-badge {
          padding: 5px 10px; border-radius: 8px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          font-size: 11px; color: #8b95a5;
          display: flex; align-items: center; gap: 5px;
        }

        /* Responsive */
        @media (max-width: 860px) {
          .lg-layout {
            flex-direction: column; gap: 36px;
            padding: 88px 20px 40px; align-items: stretch;
          }
          .lg-left { max-width: 100%; }
          .lg-tagline { display: none; }
          .lg-stats { display: none; }
          .lg-card { max-width: 100%; }
          .lg-headline { font-size: 28px; }
        }
      `}</style>

      <div className="lg-grid" />
      <div className="lg-orb1" />
      <div className="lg-orb2" />

      {/* Logo */}
      <div style={{ position: 'absolute', top: 24, right: 28, textAlign: 'right', zIndex: 10 }}>
        <div className="lg-logo">OrderMate</div>
        <div className="lg-logo-tag">Order together. Save together.</div>
      </div>

      <div className="lg-layout">

        {/* ── Left: Hero ── */}
        <div className="lg-left">
          <h1 className="lg-headline">
            Group orders,<br />
            <span className="lg-headline-accent">zero wasted fees.</span>
          </h1>
          <p className="lg-tagline">
            OrderMate lets hostel students pool their Instamart, Zepto, Blinkit and more orders — hit the free-delivery minimum together and everyone saves.
          </p>

          <div className="lg-features">
            {features.map((f, i) => (
              <div className="lg-feature" key={i}>
                <div className="lg-feat-icon">{f.icon}</div>
                <div>
                  <div className="lg-feat-title">{f.title}</div>
                  <div className="lg-feat-desc">{f.desc}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="lg-stats">
            <div className="lg-stat">
              <span className="lg-stat-num">5+</span>
              <span className="lg-stat-label">Platforms</span>
            </div>
            <div className="lg-stat">
              <span className="lg-stat-num">₹0</span>
              <span className="lg-stat-label">Delivery fee</span>
            </div>
            <div className="lg-stat">
              <span className="lg-stat-num">NIT JSR</span>
              <span className="lg-stat-label">Campus</span>
            </div>
          </div>
        </div>

        {/* ── Right: Card ── */}
        <div className="lg-card">
          <div className="lg-card-title">Sign in</div>
          <div className="lg-card-sub">Enter your  email to get started</div>

          <label className="lg-input-label">Email Address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email Address"
            className="lg-email-input"
            onKeyDown={(e) => e.key === "Enter" && handleSendOTP()}
          />

          <button onClick={handleSendOTP} className="lg-send-btn">
            <span>Send OTP →</span>
          </button>

          <div className="lg-badges">
            <div className="lg-badge">🔒 OTP verified</div>
            <div className="lg-badge">🎓 College only</div>
            <div className="lg-badge">⚡ Instant access</div>
          </div>

          <p className="lg-footer-text">
            By continuing, you agree to our Terms &amp; Privacy Policy
          </p>
        </div>

      </div>
    </div>
  );
}

export default Login;
