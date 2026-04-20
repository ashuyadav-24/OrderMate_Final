import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { socket } from "../../../socket";
import { API } from "../../../api/api";

function ChatRoom() {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [msg, setMsg] = useState("");
  const [messages, setMessages] = useState([]);
  const bottomRef = useRef(null);

  // ✅ SAFE USER
  const getUser = () => {
    try {
      const raw = localStorage.getItem("user");
      if (!raw) return {};

      const parsed = JSON.parse(raw);

      return {
        _id:
          parsed._id ||
          parsed.user?._id ||
          "",
        name:
          parsed.name ||
          parsed.user?.name ||
          "",
        userName:
          parsed.userName ||
          parsed.user?.userName ||
          "",
      };
    } catch {
      return {};
    }
  };

  const user = getUser();

  // Load old messages
  const loadMessages = async () => {
    try {
      const res = await API.get(`/chat/${orderId}`);

      setMessages(
        (res.data || []).map((m) => ({
          _id: m._id,
          text: m.text,
          senderId:
            m.sender?._id ||
            m.senderId,
          sender:
            m.sender?.name,
          userName:
            m.sender?.userName,
          time: new Date(
            m.createdAt
          ).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        }))
      );
    } catch {}
  };

  useEffect(() => {
    loadMessages();

    socket.emit("joinOrderRoom", orderId);

    socket.on("newMessage", (data) => {
      setMessages((prev) => [
        ...prev,
        {
          _id: data._id,
          text: data.text,
          senderId:
            data.senderId ||
            data.sender?._id,
          sender:
            data.sender?.name,
          userName:
            data.sender?.userName,
          time: new Date(
            data.createdAt
          ).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ]);
    });

    return () => {
      socket.off("newMessage");
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
      text: msg,
    });

    setMsg("");
  };

  return (
    <div className="min-h-screen bg-[#E6EAF0] flex flex-col">

      {/* Header */}
      <div className="p-4 shadow-md bg-[#E6EAF0]">
        <h1 className="text-lg font-bold text-[#6C5CE7]">
          Chat Room
        </h1>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((m, i) => {
          const isMine =
            String(m.senderId) ===
            String(user._id);

          return (
            <div
              key={m._id || i}
              className={`flex ${
                isMine
                  ? "justify-end"
                  : "justify-start"
              }`}
            >
              <div
                className={`max-w-[75%] px-4 py-2 rounded-2xl shadow-md ${
                  isMine
                    ? "bg-[#6C5CE7] text-white"
                    : "bg-white text-black"
                }`}
              >
                {!isMine && (
                  <p className="text-xs text-[#6C5CE7] mb-1 font-semibold">
                    @{m.userName}
                  </p>
                )}

                <p>{m.text}</p>

                <p className="text-[10px] text-right mt-1 opacity-70">
                  {m.time}
                </p>
              </div>
            </div>
          );
        })}

        <div ref={bottomRef}></div>
      </div>

      {/* Input */}
      <div className="p-3 bg-[#E6EAF0]">
        <div className="flex gap-2">
          <input
            value={msg}
            onChange={(e) =>
              setMsg(e.target.value)
            }
            onKeyDown={(e) =>
              e.key === "Enter" &&
              sendMessage()
            }
            placeholder="Message..."
            className="flex-1 px-4 py-3 rounded-full bg-white"
          />

          <button
            onClick={sendMessage}
            className="px-5 rounded-full bg-[#6C5CE7] text-white"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

export default ChatRoom;