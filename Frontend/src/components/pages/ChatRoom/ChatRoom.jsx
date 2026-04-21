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

const currentUserName = String(
  user?.userName ||
  user?.username ||
  user?.name ||
  ""
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
          userName:
            data.sender?.userName ||
            data.userName ||
            data.sender?.name ||
            "User",
        },
      ]);
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

      fetchOrder();
    });

    socket.on("requestAccepted", () => {
      fetchOrder();
    });

    socket.on("memberJoined", () => {
      fetchOrder();
    });

    socket.on("chatEnded", () => {
      navigate("/active-orders");
    });

    return () => {
  socket.off("newMessage");
  socket.off("memberLeft");
  socket.off("requestAccepted");
  socket.off("memberJoined");
  socket.off("chatEnded");
};
  }, [orderId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  const sendMessage = () => {
    if (!msg.trim()) return;

    socket.emit("sendMessage", {
      orderId,
      text: msg.trim(),
    });

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
    String(order?.admin?._id || order?.admin) ===
    String(user._id);

  return (
    <div className="h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white border-b px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/active-orders")}
            className="text-xl"
          >
            ←
          </button>

          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 text-white flex items-center justify-center font-bold uppercase">
            {order?.platform?.charAt(0) || "O"}
          </div>

          <div>
            <h1 className="font-semibold text-sm capitalize text-gray-900">
              {order?.platform || "Order Room"}
            </h1>

            <p className="text-xs text-gray-500">
              {order?.participants?.length || 0} members
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <NotificationBell />

          <button
            onClick={leaveChat}
            className="text-xs px-3 py-2 rounded-full bg-red-500 text-white font-medium"
          >
            {isAdmin ? "End" : "Leave"}
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-3 bg-[#fafafa]">
        {messages.length === 0 && (
          <p className="text-center text-sm text-gray-400 mt-10">
            No messages yet 👋
          </p>
        )}

        {messages.map((m, i) => {
          if (m.system) {
            return (
              <div key={m._id || i} className="text-center">
                <span className="text-[11px] bg-gray-200 text-gray-600 px-3 py-1 rounded-full">
                  {m.text}
                </span>
              </div>
            );
          }

          const messageUserName = String(
  m.userName || ""
).toLowerCase();

const isMine =
  currentUserName &&
  messageUserName &&
  currentUserName === messageUserName;

          return (
            <div
              key={m._id || i}
              className={`flex ${
                isMine
                  ? "justify-end"
                  : "justify-start"
              }`}
            >
              <div className="max-w-[78%]">
                {!isMine && (
                  <p className="text-[11px] text-gray-500 mb-1 ml-2">
                    @{m.userName}
                  </p>
                )}

                <div
                  className={`px-4 py-2 rounded-2xl text-sm shadow-sm ${
                    isMine
                      ? "bg-[#6C5CE7] text-white rounded-br-md"
                      : "bg-white text-gray-900 border rounded-bl-md"
                  }`}
                >
                  {m.text}
                </div>
              </div>
            </div>
          );
        })}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t bg-white px-3 py-3">
        <div className="flex items-center gap-2">
          <input
            value={msg}
            onChange={(e) => setMsg(e.target.value)}
            onKeyDown={(e) =>
              e.key === "Enter" && sendMessage()
            }
            placeholder="Message..."
            className="flex-1 bg-gray-100 px-4 py-3 rounded-full outline-none text-sm"
          />

          <button
            onClick={sendMessage}
            className="px-5 py-3 rounded-full bg-[#6C5CE7] text-white font-medium"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

export default ChatRoom;