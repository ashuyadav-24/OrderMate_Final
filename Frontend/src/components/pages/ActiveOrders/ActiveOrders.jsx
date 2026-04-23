import { useEffect, useState } from "react";
import { API } from "../../../api/api";
import { useNavigate } from "react-router-dom";
import { socket } from "../../../socket";
import NotificationBell from "../NotificationBell/NotificationBell.jsx";

function ActiveOrders() {
  const [orders, setOrders] = useState([]);
  const [requestedIds, setRequestedIds] = useState(
    () => JSON.parse(localStorage.getItem("requestedIds") || "[]")
  );
  const [acceptedIds, setAcceptedIds] = useState([]);
  const [time, setTime] = useState(Date.now());
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();

  const getUser = () => {
    try {
      const raw = localStorage.getItem("user");
      if (!raw || raw === "undefined" || raw === "null") return {};
      const p = JSON.parse(raw);
      return p._id ? p : p.user || p;
    } catch {
      return {};
    }
  };

  const user = getUser();

  const showToast = (msg, type = "info") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    localStorage.setItem("requestedIds", JSON.stringify(requestedIds));
  }, [requestedIds]);

  const fetchOrders = async () => {
    try {
      const res = await API.get("/orders");
      setOrders(res.data || []);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setTime(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    socket.emit("joinUserRoom", user._id);

    socket.on("requestAccepted", async ({ orderId }) => {
      showToast("🎉 Request accepted! Start chat now.", "success");
      setRequestedIds((prev) => prev.filter((id) => id !== orderId));
      setAcceptedIds((prev) => prev.includes(orderId) ? prev : [...prev, orderId]);
      await fetchOrders();
      setTimeout(() => navigate(`/chat/${orderId}`), 500);
    });

    socket.on("requestDeclined", ({ orderId }) => {
      showToast("❌ Request declined", "error");
      setRequestedIds((prev) => prev.filter((id) => id !== orderId));
    });

    return () => {
      socket.off("requestAccepted");
      socket.off("requestDeclined");
    };
  }, []);

  const getTimeLeft = (expiresAt) => {
    const diff = new Date(expiresAt) - time;
    if (diff <= 0) return "Expired";
    const min = Math.floor(diff / 60000);
    const sec = Math.floor((diff % 60000) / 1000);
    return `${min}m ${sec}s`;
  };

  const isParticipant = (order) =>
    order.participants?.some(
      (p) => String(p.userId?._id || p.userId) === String(user._id)
    );

  const isAdmin = (order) =>
    String(order.admin?._id || order.admin) === String(user._id);

  const handleJoin = async (orderId) => {
    try {
      await API.post("/requests/send", { orderId, amount: 0 });
      setRequestedIds((prev) => prev.includes(orderId) ? prev : [...prev, orderId]);
      showToast("⏳ Request sent to admin");
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to join", "error");
    }
  };

  const statusColor = (status) => {
    if (status === 'open') return { bg: 'rgba(5,150,105,0.15)', color: '#34d399', border: 'rgba(52,211,153,0.2)' };
    if (status === 'matched') return { bg: 'rgba(59,130,246,0.15)', color: '#60a5fa', border: 'rgba(96,165,250,0.2)' };
    return { bg: 'rgba(255,255,255,0.05)', color: '#4b5563', border: 'rgba(255,255,255,0.08)' };
  };

  return (
    <div style={{ minHeight: '100vh', background: '#080810', padding: '32px 20px', position: 'relative', fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500;600&display=swap');

        .ao-grid {
          position: fixed; inset: 0;
          background-image:
            linear-gradient(rgba(139,92,246,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(139,92,246,0.04) 1px, transparent 1px);
          background-size: 48px 48px; pointer-events: none;
        }
        .ao-orb {
          position: fixed; top: -100px; right: -100px;
          width: 400px; height: 400px;
          background: radial-gradient(circle, rgba(109,40,217,0.2) 0%, transparent 70%);
          pointer-events: none;
        }
        .ao-title {
          font-family: 'Syne', sans-serif; font-size: 22px; font-weight: 800;
          color: #f1f5f9; letter-spacing: -0.5px;
        }
        .ao-card {
          background: rgba(13,13,22,0.8);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 20px; padding: 20px;
          margin-bottom: 14px; position: relative;
          transition: border-color 0.2s ease;
          overflow: hidden;
        }
        .ao-card::before {
          content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(167,139,250,0.2), transparent);
        }
        .ao-card:hover { border-color: rgba(139,92,246,0.25); }
        .ao-platform {
          font-family: 'Syne', sans-serif; font-size: 17px; font-weight: 700;
          color: #e2e8f0; text-transform: capitalize; letter-spacing: -0.3px;
        }
        .ao-hostel { font-size: 12px; color: '#374151'; margin-top: 2px; }
        .ao-amount { font-size: 15px; color: #cbd5e1; margin-top: 8px; font-weight: 500; }
        .ao-need { font-size: 13px; color: #34d399; margin-top: 4px; }
        .ao-meta {
          display: flex; gap: 16px; margin-top: 10px; flex-wrap: wrap;
        }
        .ao-meta-item { font-size: 12px; color: #374151; display: flex; align-items: center; gap: 4px; }
        .ao-meta-item span { color: #64748b; }
        .ao-by { font-size: 11px; color: '#1f2937'; margin-top: 6px; }

        .ao-badge {
          padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 600;
          border: 1px solid;
        }

        .ao-btn {
          width: 100%; padding: 12px; border-radius: 12px; border: none;
          font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 600;
          cursor: pointer; margin-top: 14px; transition: all 0.2s ease;
          position: relative; overflow: hidden;
        }
        .ao-btn:active:not(:disabled) { transform: scale(0.98); }
        .ao-btn:disabled { cursor: not-allowed; opacity: 0.55; }

        .ao-btn-join {
          background: linear-gradient(135deg, #7c3aed, #4f46e5);
          color: #fff;
        }
        .ao-btn-join::before {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(135deg, #8b5cf6, #6366f1);
          opacity: 0; transition: opacity 0.2s;
        }
        .ao-btn-join:not(:disabled):hover::before { opacity: 1; }
        .ao-btn-join span { position: relative; z-index: 1; }

        .ao-btn-chat {
          background: rgba(5,150,105,0.2);
          color: #34d399;
          border: 1px solid rgba(52,211,153,0.25) !important;
        }
        .ao-btn-chat:not(:disabled):hover { background: rgba(5,150,105,0.3); }

        .ao-btn-disabled {
          background: rgba(255,255,255,0.04);
          color: #374151;
          border: 1px solid rgba(255,255,255,0.06) !important;
        }

        .ao-empty {
          text-align: center; margin-top: 100px;
          font-family: 'Syne', sans-serif;
        }
        .ao-empty-icon { font-size: 48px; margin-bottom: 16px; }
        .ao-empty-title { font-size: 18px; color: #374151; font-weight: 700; }
        .ao-empty-sub { font-size: 13px; color: '#1f2937'; margin-top: 6px; }

        .ao-toast {
          position: fixed; top: 20px; left: 50%; transform: translateX(-50%);
          z-index: 9999; padding: 12px 22px; border-radius: 12px;
          font-size: 13px; font-weight: 500; color: #fff;
          font-family: 'DM Sans', sans-serif;
          max-width: 300px; text-align: center;
          box-shadow: 0 8px 32px rgba(0,0,0,0.5);
          animation: aoSlide 0.3s ease;
        }
        @keyframes aoSlide {
          from { opacity: 0; transform: translateX(-50%) translateY(-8px); }
          to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }

        .ao-footer {
          text-align: center; padding: 32px 0 8px;
        }
        .ao-footer-logo {
          font-family: 'Syne', sans-serif; font-weight: 800; font-size: 18px;
          background: linear-gradient(135deg, #a78bfa, #60a5fa);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
        }
        .ao-footer-tag { font-size: 11px; color: '#1f2937'; margin-top: 4px; }
        .ao-divider { height: 1px; background: rgba(255,255,255,0.04); margin: 8px 0; }
      `}</style>

      <div className="ao-grid" />
      <div className="ao-orb" />

      {toast && (
        <div className="ao-toast" style={{
          background: toast.type === 'success'
            ? 'linear-gradient(135deg,#059669,#047857)'
            : toast.type === 'error'
            ? 'linear-gradient(135deg,#dc2626,#b91c1c)'
            : 'linear-gradient(135deg,#7c3aed,#4f46e5)'
        }}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28, position: 'relative', zIndex: 10 }}>
        <div className="ao-title">Active Orders</div>
        <NotificationBell />
      </div>

      {/* Orders */}
      <div style={{ position: 'relative', zIndex: 5 }}>
        {orders.length === 0 ? (
          <div className="ao-empty">
            <div className="ao-empty-icon">😴</div>
            <div className="ao-empty-title">No Active Orders</div>
            <div className="ao-empty-sub">Check back soon or create one yourself!</div>
          </div>
        ) : (
          orders.map((order) => {
            const admin = isAdmin(order);
            const participant = isParticipant(order) || acceptedIds.includes(order._id);
            const requested = requestedIds.includes(order._id);
            const isClosed = order.status === "closed";

            let label, btnClass, disabled, action;

            if (isClosed) {
              label = "Closed";
              btnClass = "ao-btn ao-btn-disabled";
              disabled = true;
            } else if (admin) {
              label = "👑 Created by You";
              btnClass = "ao-btn ao-btn-disabled";
              disabled = true;
            } else if (participant) {
              label = "💬 Start Chat";
              btnClass = "ao-btn ao-btn-chat";
              disabled = false;
              action = () => navigate(`/chat/${order._id}`);
            } else if (requested) {
              label = "⏳ Pending...";
              btnClass = "ao-btn ao-btn-disabled";
              disabled = true;
            } else {
              label = "Join Order";
              btnClass = "ao-btn ao-btn-join";
              disabled = false;
              action = () => handleJoin(order._id);
            }

            const sc = statusColor(order.status);
            const progress = Math.min(100, (order.currentAmount / order.targetAmount) * 100);

            return (
              <div key={order._id} className="ao-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <div>
                    <div className="ao-platform">{order.platform}</div>
                    <div style={{ fontSize: 12, color: '#374151', marginTop: 2 }}>Hostel {order.hostel}</div>
                  </div>
                  <span className="ao-badge" style={{ background: sc.bg, color: sc.color, borderColor: sc.border }}>
                    {order.status}
                  </span>
                </div>

                {/* Progress bar */}
                <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 4, margin: '12px 0 8px', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', width: `${progress}%`,
                    background: 'linear-gradient(90deg, #7c3aed, #6366f1)',
                    borderRadius: 4, transition: 'width 0.5s ease'
                  }} />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span style={{ color: '#94a3b8' }}>₹{order.currentAmount} raised</span>
                  <span style={{ color: '#4b5563' }}>of ₹{order.targetAmount}</span>
                </div>

                <div style={{ color: '#34d399', fontSize: 12, marginTop: 4 }}>
                  Need ₹{Math.max(0, order.targetAmount - order.currentAmount)} more
                </div>

                <div className="ao-meta">
                  <div className="ao-meta-item">👥 <span>{order.participants?.length || 0} joined</span></div>
                  <div className="ao-meta-item">⏱ <span style={{ color: getTimeLeft(order.expiresAt) === 'Expired' ? '#ef4444' : '#64748b' }}>{getTimeLeft(order.expiresAt)}</span></div>
                  {order.admin?.userName && (
                    <div className="ao-meta-item">by <span>@{order.admin.userName}</span></div>
                  )}
                </div>

                <button
                  onClick={action}
                  disabled={disabled}
                  className={btnClass}
                >
                  {btnClass.includes('join') ? <span>{label}</span> : label}
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      <div className="ao-footer">
        <div className="ao-divider" />
        <div className="ao-footer-logo">OrderMate</div>
        <div className="ao-footer-tag">Order together. Save together.</div>
      </div>
    </div>
  );
}

export default ActiveOrders;
