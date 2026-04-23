import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { socket } from "../../../socket";
import { API } from "../../../api/api";
import NotificationBell from "../NotificationBell/NotificationBell.jsx";

function ChatRoom() {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [msg, setMsg] = useState("");
  const [messages, setMessages] = useState([]);
  const [order, setOrder] = useState(null);

  const bottomRef = useRef(null);

  const getUser = () => {
    try {
      const raw = localStorage.getItem("user");
      if (!raw || raw === "undefined" || raw === "null") return {};
      const parsed = JSON.parse(raw);
      return parsed._id ? parsed : parsed.user || parsed;
    } catch {
      return {};
    }
  };

  const user = getUser();

  const currentUserName = String(
    user?.userName || user?.username || user?.name || ""
  ).toLowerCase();

  const fetchOrder = async () => {
    try {
      const res = await API.get(`/orders/${orderId}`);
      setOrder(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const loadMessages = async () => {
    try {
      const res = await API.get(`/chat/${orderId}`);
      setMessages(
        res.data.map((m) => ({
          _id: m._id,
          text: m.text,
          senderId: m.sender?._id,
          userName: m.sender?.userName,
          createdAt: m.createdAt,
        }))
      );
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchOrder();
    loadMessages();
    socket.emit("joinOrderRoom", orderId);

    socket.on("newMessage", (data) => {
      setMessages((prev) => [
        ...prev,
        {
          _id: data._id || Date.now(),
          text: data.text,
          senderId: data.sender?._id || data.senderId,
          userName: data.sender?.userName || data.userName || data.sender?.name || "User",
        },
      ]);
    });

    socket.on("memberLeft", ({ userName, name }) => {
      setMessages((prev) => [
        ...prev,
        { _id: Date.now(), system: true, text: `@${userName || name} left the chat` },
      ]);
      fetchOrder();
    });

    socket.on("requestAccepted", () => fetchOrder());
    socket.on("memberJoined", () => fetchOrder());
    socket.on("chatEnded", () => navigate("/active-orders"));

    return () => {
      socket.off("newMessage");
      socket.off("memberLeft");
      socket.off("requestAccepted");
      socket.off("memberJoined");
      socket.off("chatEnded");
    };
  }, [orderId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!msg.trim()) return;
    socket.emit("sendMessage", { orderId, text: msg.trim() });
    setMsg("");
  };

  const leaveChat = async () => {
    try {
      await API.post(`/orders/leave/${orderId}`);
      navigate("/active-orders");
    } catch (err) {
      console.log(err);
    }
  };

  const isAdmin =
    String(order?.admin?._id || order?.admin) === String(user._id);

  const platformEmoji = {
    instamart: "🛒", blinkit: "💛", zepto: "⚡",
    amazon: "📦", flipkart: "🛍️",
  };

  const platformInitial = order?.platform?.charAt(0)?.toUpperCase() || "O";
  const emoji = platformEmoji[order?.platform?.toLowerCase()] || "🛒";

  // Generate a consistent subtle color per username for avatars
  const getUserColor = (name = "") => {
    const colors = [
      "#7c3aed", "#2563eb", "#059669", "#d97706",
      "#db2777", "#0891b2", "#65a30d", "#9333ea"
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <div style={{ height: '100vh', background: '#080810', display: 'flex', flexDirection: 'column', fontFamily: "'DM Sans', sans-serif", overflow: 'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500;600&display=swap');

        /* scrollbar */
        .cr-messages::-webkit-scrollbar { width: 4px; }
        .cr-messages::-webkit-scrollbar-track { background: transparent; }
        .cr-messages::-webkit-scrollbar-thumb { background: rgba(139,92,246,0.2); border-radius: 4px; }
        .cr-messages::-webkit-scrollbar-thumb:hover { background: rgba(139,92,246,0.4); }

        .cr-grid {
          position: fixed; inset: 0;
          background-image:
            linear-gradient(rgba(139,92,246,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(139,92,246,0.03) 1px, transparent 1px);
          background-size: 48px 48px; pointer-events: none; z-index: 0;
        }

        /* Header */
        .cr-header {
          position: sticky; top: 0; z-index: 50;
          background: rgba(8,8,16,0.92);
          border-bottom: 1px solid rgba(255,255,255,0.06);
          backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
          padding: 12px 16px;
          display: flex; align-items: center; justify-content: space-between;
        }
        .cr-header::after {
          content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(139,92,246,0.3), transparent);
        }

        .cr-back-btn {
          width: 36px; height: 36px; border-radius: 10px; border: none; cursor: pointer;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          color: #94a3b8; font-size: 16px;
          display: flex; align-items: center; justify-content: center;
          transition: all 0.2s ease;
        }
        .cr-back-btn:hover { background: rgba(255,255,255,0.08); color: #e2e8f0; }

        .cr-avatar {
          width: 38px; height: 38px; border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          font-size: 18px; flex-shrink: 0;
          background: rgba(124,58,237,0.2);
          border: 1px solid rgba(139,92,246,0.3);
        }
        .cr-room-name {
          font-family: 'Syne', sans-serif; font-size: 15px; font-weight: 700;
          color: #f1f5f9; text-transform: capitalize; letter-spacing: -0.2px;
        }
        .cr-room-meta { font-size: 11px; color: #4b5563; margin-top: 1px; }

        .cr-leave-btn {
          padding: 7px 14px; border-radius: 10px; border: none; cursor: pointer;
          font-family: 'DM Sans', sans-serif; font-size: 12px; font-weight: 600;
          transition: all 0.2s ease;
        }
        .cr-leave-admin {
          background: rgba(220,38,38,0.15); color: #f87171;
          border: 1px solid rgba(248,113,113,0.2);
        }
        .cr-leave-admin:hover { background: rgba(220,38,38,0.25); }
        .cr-leave-member {
          background: rgba(255,255,255,0.05); color: #64748b;
          border: 1px solid rgba(255,255,255,0.08);
        }
        .cr-leave-member:hover { background: rgba(255,255,255,0.09); color: #94a3b8; }

        /* Messages area */
        .cr-messages {
          flex: 1; overflow-y: auto; padding: 20px 16px;
          display: flex; flex-direction: column; gap: 10px;
          position: relative; z-index: 1;
        }

        /* System message */
        .cr-system {
          display: flex; justify-content: center; margin: 4px 0;
        }
        .cr-system-pill {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.08);
          color: #374151; font-size: 11px; padding: 4px 12px;
          border-radius: 20px; font-style: italic;
        }

        /* Message bubble */
        .cr-bubble-row { display: flex; }
        .cr-bubble-row.mine { justify-content: flex-end; }
        .cr-bubble-row.theirs { justify-content: flex-start; }

        .cr-msg-wrap { max-width: 72%; display: flex; flex-direction: column; }
        .cr-msg-wrap.mine { align-items: flex-end; }
        .cr-msg-wrap.theirs { align-items: flex-start; }

        .cr-sender-row { display: flex; align-items: center; gap: 6px; margin-bottom: 4px; }
        .cr-mini-avatar {
          width: 20px; height: 20px; border-radius: 6px;
          display: flex; align-items: center; justify-content: center;
          font-size: 9px; font-weight: 700; color: #fff; flex-shrink: 0;
        }
        .cr-sender-name { font-size: 11px; color: #4b5563; }

        .cr-bubble {
          padding: 10px 14px; border-radius: 16px;
          font-size: 14px; line-height: 1.5; word-break: break-word;
          max-width: 100%;
        }
        .cr-bubble.mine {
          background: linear-gradient(135deg, #7c3aed, #4f46e5);
          color: #fff;
          border-bottom-right-radius: 4px;
        }
        .cr-bubble.theirs {
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.08);
          color: #e2e8f0;
          border-bottom-left-radius: 4px;
        }

        .cr-empty {
          display: flex; flex-direction: column; align-items: center;
          justify-content: center; flex: 1; gap: 10px;
          color: #1f2937;
        }
        .cr-empty-icon { font-size: 40px; opacity: 0.5; }
        .cr-empty-text { font-size: 13px; }

        /* Input bar */
        .cr-input-bar {
          padding: 12px 16px;
          background: rgba(8,8,16,0.95);
          border-top: 1px solid rgba(255,255,255,0.06);
          display: flex; align-items: center; gap: 10px;
          position: relative; z-index: 50;
        }
        .cr-input-bar::before {
          content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(139,92,246,0.25), transparent);
        }

        .cr-text-input {
          flex: 1; background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 14px; padding: 12px 16px;
          color: #e2e8f0; font-size: 14px;
          font-family: 'DM Sans', sans-serif;
          outline: none; transition: all 0.2s ease;
          resize: none;
        }
        .cr-text-input::placeholder { color: '#1f2937'; }
        .cr-text-input:focus {
          border-color: rgba(139,92,246,0.5);
          background: rgba(139,92,246,0.06);
          box-shadow: 0 0 0 3px rgba(139,92,246,0.08);
        }

        .cr-send-btn {
          width: 46px; height: 46px; border-radius: 14px; border: none; cursor: pointer;
          background: linear-gradient(135deg, #7c3aed, #4f46e5);
          color: #fff; font-size: 18px; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          transition: all 0.2s ease; position: relative; overflow: hidden;
        }
        .cr-send-btn::before {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(135deg, #8b5cf6, #6366f1);
          opacity: 0; transition: opacity 0.2s;
        }
        .cr-send-btn:hover::before { opacity: 1; }
        .cr-send-btn:active { transform: scale(0.94); }
        .cr-send-btn span { position: relative; z-index: 1; }
      `}</style>

      <div className="cr-grid" />

      {/* Header */}
      <div className="cr-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button onClick={() => navigate("/active-orders")} className="cr-back-btn">←</button>
          <div className="cr-avatar">{emoji}</div>
          <div>
            <div className="cr-room-name">{order?.platform || "Order Room"}</div>
            <div className="cr-room-meta">
              {order?.participants?.length || 0} members · Hostel {order?.hostel}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <NotificationBell />
          <button
            onClick={leaveChat}
            className={`cr-leave-btn ${isAdmin ? 'cr-leave-admin' : 'cr-leave-member'}`}
          >
            {isAdmin ? "⚡ End" : "Leave"}
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="cr-messages">
        {messages.length === 0 && (
          <div className="cr-empty">
            <div className="cr-empty-icon">💬</div>
            <div className="cr-empty-text">No messages yet — say hello!</div>
          </div>
        )}

        {messages.map((m, i) => {
          if (m.system) {
            return (
              <div key={m._id || i} className="cr-system">
                <span className="cr-system-pill">{m.text}</span>
              </div>
            );
          }

          const messageUserName = String(m.userName || "").toLowerCase();
          const isMine = currentUserName && messageUserName && currentUserName === messageUserName;
          const avatarColor = getUserColor(m.userName || "");

          return (
            <div key={m._id || i} className={`cr-bubble-row ${isMine ? 'mine' : 'theirs'}`}>
              <div className={`cr-msg-wrap ${isMine ? 'mine' : 'theirs'}`}>
                {!isMine && (
                  <div className="cr-sender-row">
                    <div
                      className="cr-mini-avatar"
                      style={{ background: avatarColor }}
                    >
                      {(m.userName || "U").charAt(0).toUpperCase()}
                    </div>
                    <span className="cr-sender-name">@{m.userName}</span>
                  </div>
                )}
                <div className={`cr-bubble ${isMine ? 'mine' : 'theirs'}`}>
                  {m.text}
                </div>
              </div>
            </div>
          );
        })}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="cr-input-bar">
        <input
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Type a message..."
          className="cr-text-input"
        />
        <button onClick={sendMessage} className="cr-send-btn">
          <span>↑</span>
        </button>
      </div>
    </div>
  );
}

export default ChatRoom;
