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
  const [showConfirm, setShowConfirm] = useState(false);
  const [toast, setToast] = useState(null);

  const bottomRef = useRef(null);

  const getUser = () => {
    try {
      const raw = localStorage.getItem("user");
      if (!raw || raw === "undefined" || raw === "null") return {};
      const p = JSON.parse(raw);
      return p._id ? p : (p.user || p);
    } catch { return {}; }
  };
  const user = getUser();

  const showToast = (msg, type = "info") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Load order info
  const fetchOrder = async () => {
    try {
      const res = await API.get(`/orders/${orderId}`);
      setOrder(res.data);
    } catch (err) {
      console.error("Failed to load order");
    }
  };

  // ✅ Load message history — restored on refresh
  const loadMessages = async () => {
    try {
      const res = await API.get(`/chat/${orderId}`);
      setMessages(
        (res.data || []).map((m) => ({
          _id: m._id,
          text: m.text,
          senderId: m.sender?._id,
          sender: m.sender?.name,
          userName: m.sender?.userName,
          time: new Date(m.createdAt).toLocaleTimeString([], {
            hour: "2-digit", minute: "2-digit",
          }),
        }))
      );
    } catch {}
  };

  useEffect(() => {
    fetchOrder();
    loadMessages();

    socket.emit("joinOrderRoom", orderId);
    socket.emit("joinUserRoom"); // stay in personal room for bell notifications

    socket.on("newMessage", (data) => {
      setMessages((prev) => [
        ...prev,
        {
          _id: data._id,
          text: data.text,
          senderId: data.sender?._id || data.senderId,
          sender: data.sender?.name,
          userName: data.sender?.userName,
          time: new Date(data.createdAt).toLocaleTimeString([], {
            hour: "2-digit", minute: "2-digit",
          }),
        },
      ]);
    });

    // ✅ When a new user is accepted into this chat, refresh order so member count updates
    socket.on("requestAccepted", () => {
      fetchOrder();
    });

    // ✅ Chat ended → messages already deleted on server → clear locally + go home
    socket.on("chatEnded", () => {
      setMessages([]);
      showToast("Chat ended by admin", "error");
      setTimeout(() => navigate("/active-orders"), 2000);
    });

    socket.on("error", ({ message }) => showToast(message, "error"));

    return () => {
      socket.emit("leaveOrderRoom", orderId);
      socket.off("newMessage");
      socket.off("chatEnded");
      socket.off("requestAccepted");
      socket.off("error");
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

  // ✅ End chat → deletes messages on server
  const handleEndChat = async () => {
    try {
      await API.delete(`/chat/end/${orderId}`);
      setShowConfirm(false);
      // chatEnded socket event handles redirect for everyone
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to end chat", "error");
      setShowConfirm(false);
    }
  };

  const isAdmin = String(order?.admin?._id || order?.admin) === String(user._id);

  return (
    <div className="min-h-screen bg-[#E6EAF0] flex flex-col">

      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 rounded-xl shadow-lg text-white text-sm font-medium max-w-xs text-center
          ${toast.type === "success" ? "bg-green-500" : toast.type === "error" ? "bg-red-500" : "bg-[#6C5CE7]"}`}>
          {toast.msg}
        </div>
      )}

      {/* ✅ End Chat Confirm Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-6">
          <div className="bg-[#E6EAF0] p-6 rounded-2xl w-full max-w-sm
            shadow-[8px_8px_16px_#C5C9D0,-8px_-8px_16px_#FFFFFF]">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">End Chat?</h2>
            <p className="text-sm text-gray-500 mb-5">
              This will close the chat for everyone and delete all messages permanently.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowConfirm(false)}
                className="flex-1 py-2 rounded-xl bg-gray-200 text-gray-700 text-sm font-medium">
                Cancel
              </button>
              <button onClick={handleEndChat}
                className="flex-1 py-2 rounded-xl bg-red-500 text-white text-sm font-medium active:scale-95 transition">
                End & Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="p-4 bg-[#E6EAF0] sticky top-0 z-10 flex justify-between items-center
        shadow-[0_4px_12px_#C5C9D0]">
        <div>
          <h1 className="text-lg font-bold text-[#6C5CE7] capitalize">
            {order?.platform ? `${order.platform} Order` : "Chat Room"}
          </h1>
          <p className="text-xs text-gray-500">
            {order?.participants?.length || 0} members · #{orderId.slice(-6)}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* ✅ Bell visible in ChatRoom too */}
          <NotificationBell />

          {/* Only admin sees End Chat */}
          {isAdmin && (
            <button onClick={() => setShowConfirm(true)}
              className="px-3 py-2 rounded-xl bg-red-500 text-white text-sm shadow-md active:scale-95 transition">
              End Chat
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <p className="text-center text-gray-400 mt-10 text-sm">No messages yet. Say hi! 👋</p>
        )}
        {messages.map((m, i) => {
          const isMine = String(m.senderId) === String(user._id);
          return (
            <div key={m._id || i} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[75%] px-4 py-2 rounded-2xl shadow-md
                ${isMine ? "bg-[#6C5CE7] text-white rounded-br-sm" : "bg-white text-gray-800 rounded-bl-sm"}`}>
                {!isMine && (
                  <p className="text-[11px] font-semibold text-[#6C5CE7] mb-1">
                    @{m.userName || m.sender}
                  </p>
                )}
                <p className="text-sm break-words">{m.text}</p>
                <p className={`text-[10px] mt-1 text-right ${isMine ? "text-gray-200" : "text-gray-400"}`}>
                  {m.time}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-3 bg-[#E6EAF0] sticky bottom-0">
        <div className="flex gap-2">
          <input
            value={msg}
            onChange={(e) => setMsg(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Message..."
            className="flex-1 px-4 py-3 rounded-full outline-none bg-white text-sm shadow-md"
          />
          <button onClick={sendMessage}
            className="px-5 rounded-full bg-[#6C5CE7] text-white font-medium shadow-md active:scale-95 transition">
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

export default ChatRoom;
