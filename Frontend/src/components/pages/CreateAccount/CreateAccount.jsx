import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API } from "../../../api/api.js";

function CreateAccount() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    collegeName: "NIT Jamshedpur",
    hostelName: "",
    userName: "",
  });

  const handleCreateAccount = async () => {
    try {
      const { name, collegeName, hostelName, userName } = form;
      if (!name || !collegeName || !hostelName || !userName) {
        alert("All fields are required");
        return;
      }
      const res = await API.put("/auth/profile", { name, collegeName, hostelName, userName });
      localStorage.setItem("user", JSON.stringify(res.data.user));
      navigate("/home");
    } catch (err) {
      console.log(err);
      alert(err.response?.data?.message || "Error creating profile");
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#080810', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 24px', position: 'relative' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500;600&display=swap');

        .ca-grid {
          position: fixed; inset: 0;
          background-image:
            linear-gradient(rgba(139,92,246,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(139,92,246,0.04) 1px, transparent 1px);
          background-size: 48px 48px; pointer-events: none;
        }
        .ca-orb1 {
          position: fixed; bottom: -100px; right: -100px;
          width: 450px; height: 450px;
          background: radial-gradient(circle, rgba(109,40,217,0.2) 0%, transparent 70%);
          pointer-events: none;
        }
        .ca-orb2 {
          position: fixed; top: -80px; left: -80px;
          width: 350px; height: 350px;
          background: radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 70%);
          pointer-events: none;
        }
        .ca-logo {
          font-family: 'Syne', sans-serif; font-weight: 800; font-size: 22px;
          background: linear-gradient(135deg, #a78bfa, #60a5fa);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
        }
        .ca-card {
          background: rgba(15,15,25,0.88);
          border: 1px solid rgba(139,92,246,0.18);
          backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px);
          border-radius: 24px; padding: 44px 40px;
          width: 100%; max-width: 440px; position: relative; overflow: hidden;
        }
        .ca-card::before {
          content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(167,139,250,0.5), transparent);
        }
        .ca-title {
          font-family: 'Syne', sans-serif; font-size: 26px; font-weight: 700;
          color: #f1f5f9; letter-spacing: -0.5px; margin-bottom: 6px;
        }
        .ca-sub { font-size: 13px; color: #64748b; margin-bottom: 32px; }
        .ca-label {
          display: block; font-size: 11px; font-weight: 500;
          color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;
        }
        .ca-input, .ca-select {
          width: 100%;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 12px; padding: 13px 16px;
          color: #e2e8f0; font-size: 14px;
          font-family: 'DM Sans', sans-serif;
          outline: none; transition: all 0.2s ease; margin-bottom: 20px;
          -webkit-appearance: none; appearance: none;
        }
        .ca-input::placeholder { color: #374151; }
        .ca-input:focus, .ca-select:focus {
          border-color: rgba(139,92,246,0.6);
          background: rgba(139,92,246,0.06);
          box-shadow: 0 0 0 3px rgba(139,92,246,0.1);
        }
        .ca-select { cursor: pointer; }
        .ca-select option { background: #111827; color: #e2e8f0; }
        .ca-select-wrap { position: relative; margin-bottom: 20px; }
        .ca-select-wrap .ca-select { margin-bottom: 0; }
        .ca-select-arrow {
          position: absolute; right: 14px; top: 50%; transform: translateY(-50%);
          color: #4b5563; pointer-events: none; font-size: 12px;
        }
        .ca-btn {
          width: 100%; padding: 15px; border-radius: 12px; border: none; cursor: pointer;
          font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 600;
          color: #fff; background: linear-gradient(135deg, #7c3aed, #4f46e5);
          transition: all 0.2s ease; position: relative; overflow: hidden; margin-top: 4px;
        }
        .ca-btn::before {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(135deg, #8b5cf6, #6366f1);
          opacity: 0; transition: opacity 0.2s ease;
        }
        .ca-btn:hover::before { opacity: 1; }
        .ca-btn:active { transform: scale(0.98); }
        .ca-btn span { position: relative; z-index: 1; }
      `}</style>

      <div className="ca-grid" />
      <div className="ca-orb1" />
      <div className="ca-orb2" />

      <div style={{ position: 'absolute', top: 24, right: 28, textAlign: 'right' }}>
        <div className="ca-logo">OrderMate</div>
        <div style={{ fontSize: 11, color: '#374151', marginTop: 2 }}>Order together. Save together.</div>
      </div>

      <div className="ca-card">
        <div className="ca-title">Set up your profile</div>
        <div className="ca-sub">Tell us a bit about yourself to get started</div>

        <label className="ca-label">Full Name</label>
        <input
          type="text"
          placeholder="Your full name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="ca-input"
        />

        <label className="ca-label">College</label>
        <div className="ca-select-wrap">
          <select
            value={form.collegeName}
            onChange={(e) => setForm({ ...form, collegeName: e.target.value })}
            className="ca-select"
          >
            <option value="NIT Jamshedpur">NIT Jamshedpur</option>
          </select>
          <span className="ca-select-arrow">▾</span>
        </div>

        <label className="ca-label">Hostel</label>
        <div className="ca-select-wrap">
          <select
            value={form.hostelName}
            onChange={(e) => setForm({ ...form, hostelName: e.target.value })}
            className="ca-select"
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
          <span className="ca-select-arrow">▾</span>
        </div>

        <label className="ca-label">Username</label>
        <input
          type="text"
          placeholder="@yourhandle"
          value={form.userName}
          onChange={(e) => setForm({ ...form, userName: e.target.value })}
          className="ca-input"
        />

        <button onClick={handleCreateAccount} className="ca-btn">
          <span>Create Account →</span>
        </button>
      </div>
    </div>
  );
}

export default CreateAccount;
