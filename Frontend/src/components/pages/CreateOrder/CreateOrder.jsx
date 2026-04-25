import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API } from "../../../api/api";

function CreateOrder() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    platform: "instamart",
    targetAmount: "",
    duration: " ",
    college: "NIT Jamshedpur",
    hostel: "",
  });

  const handleSubmit = async () => {
    try {
      const res = await API.post("/orders/create", {
        ...form,
        targetAmount: Number(form.targetAmount),
        duration: Number(form.duration),
      });
      navigate("/active-orders");
    } catch (err) {
      console.log("❌ ERROR:", err.response?.data);
      alert(err.response?.data?.message || "Failed to create order");
    }
  };

  const platformEmoji = {
    instamart: "🛒",
    blinkit: "💛",
    zepto: "⚡",
    amazon: "📦",
    flipkart: "🛍️",
  };

  return (
    <div style={{ minHeight: '100vh', background: '#080810', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 24px', position: 'relative', fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500;600&display=swap');

        .co-grid {
          position: fixed; inset: 0;
          background-image:
            linear-gradient(rgba(139,92,246,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(139,92,246,0.04) 1px, transparent 1px);
          background-size: 48px 48px; pointer-events: none;
        }
        .co-orb1 {
          position: fixed; top: -100px; left: -100px;
          width: 420px; height: 420px;
          background: radial-gradient(circle, rgba(109,40,217,0.22) 0%, transparent 70%);
          pointer-events: none;
        }
        .co-orb2 {
          position: fixed; bottom: -80px; right: -80px;
          width: 340px; height: 340px;
          background: radial-gradient(circle, rgba(59,130,246,0.13) 0%, transparent 70%);
          pointer-events: none;
        }
        .co-logo {
          font-family: 'Syne', sans-serif; font-weight: 800; font-size: 22px;
          background: linear-gradient(135deg, #a78bfa, #60a5fa);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
        }
        .co-card {
          background: rgba(15,15,25,0.88);
          border: 1px solid rgba(139,92,246,0.18);
          backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px);
          border-radius: 24px; padding: 44px 40px;
          width: 100%; max-width: 440px; position: relative; overflow: hidden;
        }
        .co-card::before {
          content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(167,139,250,0.5), transparent);
        }
        .co-title {
          font-family: 'Syne', sans-serif; font-size: 26px; font-weight: 700;
          color: #f1f5f9; letter-spacing: -0.5px; margin-bottom: 6px;
        }
        .co-sub { font-size: 13px; color: #64748b; margin-bottom: 32px; }

        .co-label {
          display: block; font-size: 11px; font-weight: 500;
          color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;
        }

        .co-select, .co-input {
          width: 100%;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 12px; padding: 13px 16px;
          color: #e2e8f0; font-size: 14px;
          font-family: 'DM Sans', sans-serif;
          outline: none; transition: all 0.2s ease;
          -webkit-appearance: none; appearance: none;
        }
        .co-input::placeholder { color: #374151; }
        .co-select:focus, .co-input:focus {
          border-color: rgba(139,92,246,0.6);
          background: rgba(139,92,246,0.06);
          box-shadow: 0 0 0 3px rgba(139,92,246,0.1);
        }
        .co-select { cursor: pointer; }
        .co-select option { background: #111827; color: #e2e8f0; }

        .co-field { margin-bottom: 20px; }
        .co-select-wrap { position: relative; }
        .co-arrow {
          position: absolute; right: 14px; top: 50%; transform: translateY(-50%);
          color: #4b5563; pointer-events: none; font-size: 12px;
        }

        /* Platform pill selector */
        .co-platforms {
          display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 20px;
        }
        .co-pill {
          padding: 8px 14px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.08);
          background: rgba(255,255,255,0.04); color: #64748b;
          font-size: 12px; font-weight: 500; cursor: pointer;
          font-family: 'DM Sans', sans-serif; transition: all 0.2s ease;
          display: flex; align-items: center; gap: 6px;
        }
        .co-pill:hover { border-color: rgba(139,92,246,0.35); color: #a78bfa; }
        .co-pill.active {
          background: rgba(124,58,237,0.18);
          border-color: rgba(139,92,246,0.6);
          color: #a78bfa;
          box-shadow: 0 0 0 2px rgba(139,92,246,0.1);
        }

        /* Input row */
        .co-row { display: flex; gap: 12px; margin-bottom: 20px; }
        .co-row .co-field { margin-bottom: 0; flex: 1; }

        .co-btn {
          width: 100%; padding: 15px; border-radius: 12px; border: none; cursor: pointer;
          font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 600;
          color: #fff; background: linear-gradient(135deg, #7c3aed, #4f46e5);
          transition: all 0.2s ease; position: relative; overflow: hidden; margin-top: 8px;
        }
        .co-btn::before {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(135deg, #8b5cf6, #6366f1);
          opacity: 0; transition: opacity 0.2s ease;
        }
        .co-btn:hover::before { opacity: 1; }
        .co-btn:active { transform: scale(0.98); }
        .co-btn span { position: relative; z-index: 1; }

        .co-input-prefix {
          position: relative;
        }
        .co-input-prefix .prefix {
          position: absolute; left: 14px; top: 50%; transform: translateY(-50%);
          color: #4b5563; font-size: 14px; font-weight: 500; pointer-events: none;
        }
        .co-input-prefix .co-input { padding-left: 28px; }
      `}</style>

      <div className="co-grid" />
      <div className="co-orb1" />
      <div className="co-orb2" />

      {/* Logo */}
      <div style={{ position: 'absolute', top: 24, right: 28, textAlign: 'right' }}>
        <div className="co-logo">OrderMate</div>
        <div style={{ fontSize: 11, color: '#374151', marginTop: 2 }}>Order together. Save together.</div>
      </div>

      <div className="co-card">
        <div className="co-title">Create Order</div>
        <div className="co-sub">Set up a group order for your hostel</div>

        {/* Platform Pills */}
        <label className="co-label">Platform</label>
        <div className="co-platforms">
          {["instamart", "blinkit", "zepto", "amazon", "flipkart"].map((p) => (
            <button
              key={p}
              onClick={() => setForm({ ...form, platform: p })}
              className={`co-pill${form.platform === p ? ' active' : ''}`}
            >
              <span>{platformEmoji[p]}</span>
              <span style={{ textTransform: 'capitalize' }}>{p}</span>
            </button>
          ))}
        </div>

        {/* College */}
        <div className="co-field">
          <label className="co-label">College</label>
          <div className="co-select-wrap">
            <select
              value={form.college}
              onChange={(e) => setForm({ ...form, college: e.target.value })}
              className="co-select"
            >
              <option value="NIT Jamshedpur">NIT Jamshedpur</option>
            </select>
            <span className="co-arrow">▾</span>
          </div>
        </div>

        {/* Hostel */}
        <div className="co-field">
          <label className="co-label">Hostel</label>
          <div className="co-select-wrap">
            <select
              value={form.hostel}
              onChange={(e) => setForm({ ...form, hostel: e.target.value })}
              className="co-select"
            >
              <option value="">Select your hostel</option>
              <option value="A">Hostel A (Girls)</option>
              <option value="B">Hostel B (Girls)</option>
              <option value="C">Hostel C (Girls)</option>
              <option value="D">Hostel D (Girls)</option>
              <option value="E">Hostel E (Boys)</option>
              <option value="F">Hostel F (Boys)</option>
              <option value="G">Hostel G (Boys)</option>
              <option value="H">Hostel H (Boys)</option>
              <option value="I">Hostel I (Boys)</option>
              <option value="J">Hostel J (Boys)</option>
              <option value="K">Hostel K (Boys)</option>
              <option value="L">Hostel L (Boys)</option>
              <option value="M">Hostel M (Girls)</option>
            </select>
            <span className="co-arrow">▾</span>
          </div>
        </div>

        {/* Amount + Duration in a row */}
        <div className="co-row">
          <div className="co-field">
            <label className="co-label">Required Amount</label>
            <div className="co-input-prefix">
              <span className="prefix">₹</span>
              <input
                type="number"
                placeholder="Required Amount"
                value={form.targetAmount}
                onChange={(e) => setForm({ ...form, targetAmount: e.target.value })}
                className="co-input"
              />
            </div>
          </div>
          <div className="co-field">
            <label className="co-label">Duration(in mins)</label>
            <div className="co-input-prefix">
              <input
                type="number"
                placeholder="Set Time"
                value={form.duration}
                onChange={(e) => setForm({ ...form, duration: e.target.value })}
                className="co-input"
                style={{ paddingRight: 14 }}
              />
            </div>
          </div>
        </div>

        <button onClick={handleSubmit} className="co-btn">
          <span>Create Order →</span>
        </button>
      </div>
    </div>
  );
}

export default CreateOrder;
