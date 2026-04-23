import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { API } from "../../../api/api.js";
import { socket } from "../../../socket";
import { Bell, Power } from "lucide-react";

function Home() {
  const navigate = useNavigate();

  const getStoredUser = () => {
    try {
      const raw = localStorage.getItem("user");
      if (!raw || raw === "undefined" || raw === "null") return null;
      const p = JSON.parse(raw);
      return p._id ? p : (p.user || null);
    } catch { return null; }
  };

  const [user, setUser] = useState(getStoredUser);
  const [requests, setRequests] = useState([]);
  const [showBell, setShowBell] = useState(false);
  const [toast, setToast] = useState(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const bellRef = useRef(null);

  const showToast = (msg, type = "info") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchUser = async () => {
    try {
      const res = await API.get("/auth/me");
      setUser(res.data.user);
      localStorage.setItem("user", JSON.stringify(res.data.user));
    } catch (err) {
      if (!getStoredUser()) navigate("/");
    }
  };

  const fetchRequests = async () => {
    try {
      const res = await API.get("/requests/my-pending");
      setRequests(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchUser();
    fetchRequests();
    const interval = setInterval(fetchRequests, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (user?._id) {
      socket.emit("joinUserRoom");
    }
  }, [user]);

  useEffect(() => {
    socket.on("newRequest", (data) => {
      showToast(`📩 ${data.name} (@${data.userName}) wants to join!`, "info");
      fetchRequests();
    });
    return () => socket.off("newRequest");
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (bellRef.current && !bellRef.current.contains(e.target)) {
        setShowBell(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAccept = async (id, orderId) => {
    try {
      await API.patch(`/requests/${id}/accept`);
      fetchRequests();
      navigate(`/chat/${orderId}`);
    } catch (err) {
      showToast("Failed to accept request", "error");
    }
  };

  const handleDecline = async (id) => {
    try {
      await API.patch(`/requests/${id}/decline`);
      fetchRequests();
      showToast("Request declined", "info");
    } catch (err) {
      showToast("Failed to decline request", "error");
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    socket.disconnect();
    navigate("/");
  };

  if (!user) {
    return (
      <div style={{ minHeight: '100vh', background: '#080810', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#4b5563', fontSize: 14 }}>Loading...</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#080810', padding: '32px 24px', position: 'relative', fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500;600&display=swap');

        .hm-grid {
          position: fixed; inset: 0;
          background-image:
            linear-gradient(rgba(139,92,246,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(139,92,246,0.04) 1px, transparent 1px);
          background-size: 48px 48px; pointer-events: none;
        }
        .hm-orb {
          position: fixed; top: -80px; right: -80px;
          width: 380px; height: 380px;
          background: radial-gradient(circle, rgba(109,40,217,0.2) 0%, transparent 70%);
          pointer-events: none;
        }
        .hm-logo {
          font-family: 'Syne', sans-serif; font-weight: 800; font-size: 20px;
          background: linear-gradient(135deg, #a78bfa, #60a5fa);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
        }
        .hm-welcome {
          font-family: 'Syne', sans-serif; font-size: 24px; font-weight: 700;
          color: #f1f5f9; letter-spacing: -0.5px;
        }
        .hm-college { font-size: 13px; color: #4b5563; margin-top: 4px; }

        .hm-icon-btn {
          padding: 10px; border-radius: 12px; border: none; cursor: pointer;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          display: flex; align-items: center; justify-content: center;
          transition: all 0.2s ease;
        }
        .hm-icon-btn:hover { background: rgba(255,255,255,0.08); border-color: rgba(139,92,246,0.3); }
        .hm-icon-btn:active { transform: scale(0.95); }

        .hm-card {
          background: rgba(15,15,25,0.7);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 20px; padding: 24px;
          cursor: pointer; transition: all 0.25s ease;
          position: relative; overflow: hidden;
        }
        .hm-card::before {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(135deg, rgba(124,58,237,0.08), rgba(99,102,241,0.04));
          opacity: 0; transition: opacity 0.25s ease;
        }
        .hm-card:hover { border-color: rgba(139,92,246,0.35); transform: translateY(-2px); }
        .hm-card:hover::before { opacity: 1; }
        .hm-card:active { transform: scale(0.98) translateY(0); }

        .hm-card-icon {
          font-size: 28px; margin-bottom: 12px;
        }
        .hm-card-title {
          font-family: 'Syne', sans-serif; font-size: 16px; font-weight: 700;
          color: #e2e8f0; margin-bottom: 6px;
        }
        .hm-card-sub { font-size: 13px; color: #4b5563; }

        .hm-badge {
          position: absolute; top: -1px; right: -1px;
          width: 16px; height: 16px; border-radius: 50%;
          background: #ef4444; color: #fff;
          font-size: 9px; font-weight: 700;
          display: flex; align-items: center; justify-content: center;
        }

        .hm-dropdown {
          position: absolute; right: 0; top: calc(100% + 10px);
          width: 288px; background: rgba(12,12,20,0.95);
          border: 1px solid rgba(139,92,246,0.2);
          backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
          border-radius: 18px; padding: 16px; z-index: 100;
          box-shadow: 0 24px 48px rgba(0,0,0,0.5);
        }
        .hm-dropdown::before {
          content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(167,139,250,0.4), transparent);
        }
        .hm-drop-title {
          font-family: 'Syne', sans-serif; font-size: 13px; font-weight: 700;
          color: #94a3b8; text-transform: uppercase; letter-spacing: 1px;
          margin-bottom: 14px;
        }
        .hm-req-item {
          padding-bottom: 14px; margin-bottom: 14px;
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }
        .hm-req-item:last-child { border-bottom: none; margin-bottom: 0; padding-bottom: 0; }
        .hm-req-name { font-size: 13px; color: #cbd5e1; }
        .hm-req-platform { color: #a78bfa; font-weight: 600; }
        .hm-req-btns { display: flex; gap: 8px; margin-top: 10px; }
        .hm-accept-btn, .hm-decline-btn {
          flex: 1; padding: 8px; border-radius: 10px; border: none;
          font-size: 12px; font-weight: 600; cursor: pointer;
          font-family: 'DM Sans', sans-serif; transition: all 0.2s ease;
        }
        .hm-accept-btn { background: rgba(5,150,105,0.2); color: #34d399; border: 1px solid rgba(52,211,153,0.25); }
        .hm-accept-btn:hover { background: rgba(5,150,105,0.3); }
        .hm-decline-btn { background: rgba(220,38,38,0.15); color: #f87171; border: 1px solid rgba(248,113,113,0.2); }
        .hm-decline-btn:hover { background: rgba(220,38,38,0.25); }

        .hm-modal-overlay {
          position: fixed; inset: 0; background: rgba(0,0,0,0.7);
          backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px);
          z-index: 999; display: flex; align-items: center; justify-content: center; padding: 24px;
        }
        .hm-modal {
          background: rgba(12,12,20,0.98);
          border: 1px solid rgba(239,68,68,0.25);
          border-radius: 22px; padding: 28px;
          width: 100%; max-width: 340px;
          box-shadow: 0 32px 64px rgba(0,0,0,0.6);
        }
        .hm-modal-title {
          font-family: 'Syne', sans-serif; font-size: 18px; font-weight: 700;
          color: #f1f5f9; margin-bottom: 8px;
        }
        .hm-modal-sub { font-size: 13px; color: #4b5563; margin-bottom: 24px; line-height: 1.6; }
        .hm-modal-btns { display: flex; gap: 10px; }
        .hm-cancel-btn {
          flex: 1; padding: 12px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.08);
          background: rgba(255,255,255,0.04); color: #94a3b8;
          font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 500;
          cursor: pointer; transition: all 0.2s ease;
        }
        .hm-cancel-btn:hover { background: rgba(255,255,255,0.08); }
        .hm-logout-btn {
          flex: 1; padding: 12px; border-radius: 12px; border: none;
          background: linear-gradient(135deg, #dc2626, #b91c1c);
          color: #fff; font-family: 'DM Sans', sans-serif;
          font-size: 13px; font-weight: 600; cursor: pointer;
          transition: all 0.2s ease;
        }
        .hm-logout-btn:hover { opacity: 0.9; }
        .hm-logout-btn:active { transform: scale(0.97); }

        .hm-toast {
          position: fixed; top: 20px; left: 50%; transform: translateX(-50%);
          z-index: 9999; padding: 12px 22px; border-radius: 12px;
          font-size: 13px; font-weight: 500; color: #fff;
          font-family: 'DM Sans', sans-serif;
          box-shadow: 0 8px 32px rgba(0,0,0,0.5); max-width: 320px; text-align: center;
          animation: slideDown 0.3s ease;
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateX(-50%) translateY(-8px); }
          to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }

        .hm-footer {
          text-align: center; padding: 40px 0 8px;
        }
        .hm-footer-logo {
          font-family: 'Syne', sans-serif; font-weight: 800; font-size: 20px;
          background: linear-gradient(135deg, #a78bfa, #60a5fa);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
        }
        .hm-footer-tag { font-size: 11px; color: #1f2937; margin-top: 4px; }

        .hm-divider {
          height: 1px; background: rgba(255,255,255,0.05);
          margin: 12px 0;
        }
      `}</style>

      <div className="hm-grid" />
      <div className="hm-orb" />

      {/* Toast */}
      {toast && (
        <div className="hm-toast" style={{
          background: toast.type === 'success'
            ? 'linear-gradient(135deg,#059669,#047857)'
            : toast.type === 'error'
            ? 'linear-gradient(135deg,#dc2626,#b91c1c)'
            : 'linear-gradient(135deg,#7c3aed,#4f46e5)'
        }}>
          {toast.msg}
        </div>
      )}

      {/* Logout Modal */}
      {showLogoutConfirm && (
        <div className="hm-modal-overlay">
          <div className="hm-modal">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <div style={{ padding: '8px', background: 'rgba(239,68,68,0.15)', borderRadius: 10, display: 'flex' }}>
                <Power size={18} color="#ef4444" />
              </div>
              <div className="hm-modal-title">Log out?</div>
            </div>
            <div className="hm-modal-sub">You'll need to verify your email again to log back in.</div>
            <div className="hm-modal-btns">
              <button onClick={() => setShowLogoutConfirm(false)} className="hm-cancel-btn">Cancel</button>
              <button onClick={handleLogout} className="hm-logout-btn">Log out</button>
            </div>
          </div>
        </div>
      )}

      {/* Top Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 40, position: 'relative', zIndex: 10 }}>
        <div>
          <div className="hm-welcome">Hey, {user.name || "User"} 👋</div>
          <div className="hm-college">{user.collegeName || "No college"}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Bell */}
          <div ref={bellRef} style={{ position: 'relative' }}>
            <button onClick={() => setShowBell(!showBell)} className="hm-icon-btn" style={{ position: 'relative' }}>
              <Bell size={20} color="#a78bfa" />
              {requests.length > 0 && (
                <span className="hm-badge">{requests.length}</span>
              )}
            </button>
            {showBell && (
              <div className="hm-dropdown">
                <div className="hm-drop-title">Join Requests</div>
                {requests.length === 0 ? (
                  <p style={{ fontSize: 13, color: '#374151' }}>No new requests</p>
                ) : (
                  requests.map((req) => (
                    <div key={req._id} className="hm-req-item">
                      <div className="hm-req-name">
                        <strong style={{ color: '#e2e8f0' }}>{req.userId?.name}</strong>{" "}
                        wants to join{" "}
                        <span className="hm-req-platform capitalize">{req.orderId?.platform}</span>
                      </div>
                      <div className="hm-req-btns">
                        <button onClick={() => handleAccept(req._id, req.orderId._id)} className="hm-accept-btn">✓ Accept</button>
                        <button onClick={() => handleDecline(req._id)} className="hm-decline-btn">✕ Decline</button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
          {/* Power */}
          <button onClick={() => setShowLogoutConfirm(true)} className="hm-icon-btn">
            <Power size={20} color="#4b5563" />
          </button>
        </div>
      </div>

      {/* Action Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, position: 'relative', zIndex: 5 }}>
        <div onClick={() => navigate("/create-order")} className="hm-card">
          <div className="hm-card-icon">🛒</div>
          <div className="hm-card-title">Create New Order</div>
          <div className="hm-card-sub">Start a group order and let others join</div>
          <div style={{ position: 'absolute', bottom: 20, right: 20, color: '#4b5563', fontSize: 18 }}>→</div>
        </div>

        <div onClick={() => navigate("/active-orders")} className="hm-card">
          <div className="hm-card-icon">⏱️</div>
          <div className="hm-card-title">View Active Orders</div>
          <div className="hm-card-sub">See ongoing orders in your hostel</div>
          <div style={{ position: 'absolute', bottom: 20, right: 20, color: '#4b5563', fontSize: 18 }}>→</div>
        </div>
      </div>

      {/* Footer */}
      <div className="hm-footer">
        <div className="hm-divider" />
        <div className="hm-footer-logo">OrderMate</div>
        <div className="hm-footer-tag">Order together. Save together.</div>
      </div>
    </div>
  );
}

export default Home;
