import { useEffect, useRef, useState } from "react";
import { Bell } from "lucide-react";
import { API } from "../../../api/api";
import { socket } from "../../../socket";
import { useNavigate } from "react-router-dom";

function NotificationBell() {
  const [requests, setRequests] = useState([]);
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const bellRef = useRef(null);
  const navigate = useNavigate();

  const showToast = (msg, type = "info") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchRequests = async () => {
    try {
      const res = await API.get("/requests/my-pending");
      setRequests(res.data || []);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchRequests();
    const interval = setInterval(fetchRequests, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    socket.on("newRequest", ({ name, userName }) => {
      showToast(`📩 ${name} (@${userName}) wants to join!`, "info");
      fetchRequests();
    });
    return () => socket.off("newRequest");
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (bellRef.current && !bellRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleAccept = async (req) => {
    try {
      await API.patch(`/requests/${req._id}/accept`);
      fetchRequests();
      setOpen(false);
      navigate(`/chat/${req.orderId._id}`);
    } catch (err) {
      showToast("Failed to accept", "error");
    }
  };

  const handleDecline = async (req) => {
    try {
      await API.patch(`/requests/${req._id}/decline`);
      fetchRequests();
      showToast("Request declined");
    } catch (err) {
      showToast("Failed to decline", "error");
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700&family=DM+Sans:wght@400;500;600&display=swap');

        .nb-btn {
          padding: 10px; border-radius: 12px; border: none; cursor: pointer;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          display: flex; align-items: center; justify-content: center;
          transition: all 0.2s ease; position: relative;
        }
        .nb-btn:hover { background: rgba(255,255,255,0.08); border-color: rgba(139,92,246,0.35); }
        .nb-btn:active { transform: scale(0.95); }

        .nb-badge {
          position: absolute; top: -1px; right: -1px;
          width: 16px; height: 16px; border-radius: 50%;
          background: #ef4444; color: #fff;
          font-size: 9px; font-weight: 700;
          display: flex; align-items: center; justify-content: center;
          font-family: 'DM Sans', sans-serif;
        }

        .nb-dropdown {
          position: absolute; right: 0; top: calc(100% + 10px);
          width: 288px;
          background: rgba(10,10,18,0.97);
          border: 1px solid rgba(139,92,246,0.2);
          backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px);
          border-radius: 18px; padding: 16px; z-index: 500;
          box-shadow: 0 24px 48px rgba(0,0,0,0.6);
          font-family: 'DM Sans', sans-serif;
        }
        .nb-dropdown::before {
          content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(167,139,250,0.4), transparent);
        }
        .nb-drop-title {
          font-family: 'Syne', sans-serif; font-size: 12px; font-weight: 700;
          color: #64748b; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 14px;
        }
        .nb-empty { font-size: 13px; color: '#374151'; }
        .nb-req {
          padding-bottom: 14px; margin-bottom: 14px;
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }
        .nb-req:last-child { border-bottom: none; margin-bottom: 0; padding-bottom: 0; }
        .nb-req-text { font-size: 13px; color: #cbd5e1; line-height: 1.5; }
        .nb-platform { color: #a78bfa; font-weight: 600; }
        .nb-btns { display: flex; gap: 8px; margin-top: 10px; }
        .nb-accept {
          flex: 1; padding: 8px; border-radius: 10px; border: none;
          background: rgba(5,150,105,0.18); color: #34d399;
          border: 1px solid rgba(52,211,153,0.2);
          font-size: 12px; font-weight: 600; cursor: pointer;
          font-family: 'DM Sans', sans-serif; transition: all 0.2s ease;
        }
        .nb-accept:hover { background: rgba(5,150,105,0.3); }
        .nb-decline {
          flex: 1; padding: 8px; border-radius: 10px; border: none;
          background: rgba(220,38,38,0.12); color: #f87171;
          border: 1px solid rgba(248,113,113,0.18);
          font-size: 12px; font-weight: 600; cursor: pointer;
          font-family: 'DM Sans', sans-serif; transition: all 0.2s ease;
        }
        .nb-decline:hover { background: rgba(220,38,38,0.22); }

        .nb-toast {
          position: fixed; top: 20px; left: 50%; transform: translateX(-50%);
          z-index: 9999; padding: 12px 22px; border-radius: 12px;
          font-size: 13px; font-weight: 500; color: #fff;
          font-family: 'DM Sans', sans-serif;
          max-width: 300px; text-align: center;
          box-shadow: 0 8px 32px rgba(0,0,0,0.5);
          animation: nbSlide 0.3s ease;
        }
        @keyframes nbSlide {
          from { opacity: 0; transform: translateX(-50%) translateY(-8px); }
          to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>

      {toast && (
        <div className="nb-toast" style={{
          background: toast.type === 'error'
            ? 'linear-gradient(135deg,#dc2626,#b91c1c)'
            : 'linear-gradient(135deg,#7c3aed,#4f46e5)'
        }}>
          {toast.msg}
        </div>
      )}

      <div ref={bellRef} style={{ position: 'relative' }}>
        <button onClick={() => setOpen(!open)} className="nb-btn">
          <Bell size={20} color="#a78bfa" />
          {requests.length > 0 && (
            <span className="nb-badge">{requests.length}</span>
          )}
        </button>

        {open && (
          <div className="nb-dropdown">
            <div className="nb-drop-title">Join Requests</div>
            {requests.length === 0 ? (
              <p style={{ fontSize: 13, color: '#374151' }}>No pending requests</p>
            ) : (
              requests.map((req) => (
                <div key={req._id} className="nb-req">
                  <div className="nb-req-text">
                    <strong style={{ color: '#e2e8f0' }}>{req.userId?.name}</strong>
                    {" "}wants to join{" "}
                    <span className="nb-platform capitalize">{req.orderId?.platform}</span>
                  </div>
                  <div className="nb-btns">
                    <button onClick={() => handleAccept(req)} className="nb-accept">✓ Accept</button>
                    <button onClick={() => handleDecline(req)} className="nb-decline">✕ Decline</button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </>
  );
}

export default NotificationBell;
