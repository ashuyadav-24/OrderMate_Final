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

    if (!raw || raw === "undefined" || raw === "null") {
      return {};
    }

    const parsed = JSON.parse(raw);

    return parsed._id ? parsed : parsed.user || parsed;
  } catch {
    return {};
  }
};

const user = getUser();

  const fetchOrder = async () => {
    const res = await API.get(`/orders/${orderId}`);
    setOrder(res.data);
  };

  const loadMessages = async () => {
    const res = await API.get(`/chat/${orderId}`);

    setMessages(
      res.data.map((m) => ({
        _id: m._id,
        text: m.text,
        senderId: m.sender?._id,
        userName: m.sender?.userName,
      }))
    );
  };

  useEffect(() => {
    fetchOrder();
    loadMessages();

    socket.emit("joinOrderRoom", orderId);

    socket.on("newMessage", (data) => {
      setMessages((prev) => [...prev, data]);
    });

    socket.on("memberLeft", ({ userName, name }) => {
      setMessages((prev) => [
        ...prev,
        {
          _id: Date.now(),
          system: true,
          text: `@${userName || name} left the chat`,
        },
      ]);
    });

    socket.on("chatEnded", () => {
      navigate("/active-orders");
    });

    return () => {
      socket.off("newMessage");
      socket.off("memberLeft");
      socket.off("chatEnded");
    };
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  const sendMessage = () => {
    if (!msg.trim()) return;

    socket.emit("sendMessage", {
      orderId,
      text: msg,
    });

    setMsg("");
  };

  const leaveChat = async () => {
    await API.post(`/orders/leave/${orderId}`);
    navigate("/active-orders");
  };

  const isAdmin =
    String(order?.admin?._id || order?.admin) ===
    String(user._id);

  return (
    <div className="min-h-screen bg-[#E6EAF0] flex flex-col">
      <div className="p-4 flex justify-between">
        <h1>{order?.platform} Order</h1>

        <div className="flex gap-2">
          <NotificationBell />

          <button
            onClick={leaveChat}
            className="bg-red-500 text-white px-3 py-2 rounded-xl"
          >
            {isAdmin ? "End Chat" : "Leave Chat"}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((m, i) =>
          m.system ? (
            <p
              key={i}
              className="text-center text-xs text-gray-400 italic"
            >
              {m.text}
            </p>
          ) : (
            <div key={i}>
              <b>@{m.userName}</b> {m.text}
            </div>
          )
        )}

        <div ref={bottomRef} />
      </div>

      <div className="p-3 flex gap-2">
        <input
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
          className="flex-1 border px-3 py-2 rounded-xl"
        />

        <button
          onClick={sendMessage}
          className="bg-purple-600 text-white px-4 rounded-xl"
        >
          Send
        </button>
      </div>
    </div>
  );
}

export default ChatRoom;