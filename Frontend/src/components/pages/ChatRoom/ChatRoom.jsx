import { useParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { socket } from "../../../socket";

function ChatRoom() {
  const { orderId } = useParams();

  const [msg, setMsg] = useState("");
  const [messages, setMessages] = useState([]);

  const bottomRef = useRef(null);

  const user = JSON.parse(localStorage.getItem("user")) || {
    name: "You",
  };

  // Join room
  useEffect(() => {
    socket.emit("joinOrderRoom", orderId);

    socket.on("newMessage", (data) => {
      setMessages((prev) => [...prev, data]);
    });

    return () => socket.off("newMessage");
  }, [orderId]);

  // Auto scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Send
  const sendMessage = () => {
    if (!msg.trim()) return;

   const user = JSON.parse(localStorage.getItem("user"));

const messageData = {
  orderId,
  text: msg,
  sender: user?.name || "User",
  time: new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  }),
};
    socket.emit("sendMessage", messageData);
    setMsg("");
  };

  return (
    <div className="min-h-screen bg-[#E6EAF0] flex flex-col">

      {/* Header */}
      <div className="p-4 text-center shadow-md bg-[#E6EAF0] sticky top-0 z-10">
        <h1 className="text-lg font-bold text-[#6C5CE7]">
          Order Chat
        </h1>
        <p className="text-xs text-gray-500">
          Order ID: {orderId.slice(-6)}
        </p>
      </div>

      {/* Messages */}
      <div className="bg-white rounded-xl p-4 h-[400px] overflow-y-auto mb-4 space-y-3">
  {messages.map((m, i) => {
    const isMine = m.sender === user.name;

    return (
      <div
        key={i}
        className={`flex ${
          isMine ? "justify-end" : "justify-start"
        }`}
      >
        <div
          className={`max-w-[75%] px-4 py-2 rounded-2xl shadow-md ${
            isMine
              ? "bg-[#6C5CE7] text-white rounded-br-sm"
              : "bg-[#F5F5F5] text-gray-800 rounded-bl-sm"
          }`}
        >
          {/* Sender Name */}
          <p
            className={`text-[11px] font-semibold mb-1 ${
              isMine
                ? "text-gray-200 text-right"
                : "text-[#6C5CE7]"
            }`}
          >
            {isMine ? "You" : m.sender}
          </p>

          {/* Message */}
          <p className="text-sm">{m.text}</p>

          {/* Time */}
          <p
            className={`text-[10px] mt-1 text-right ${
              isMine
                ? "text-gray-200"
                : "text-gray-400"
            }`}
          >
            {m.time}
          </p>
        </div>
      </div>
    );
  })}
</div>

      {/* Input */}
      <div className="p-3 bg-[#E6EAF0] sticky bottom-0">
        <div className="flex gap-2">

          <input
            value={msg}
            onChange={(e) => setMsg(e.target.value)}
            placeholder="Message..."
            onKeyDown={(e) =>
              e.key === "Enter" && sendMessage()
            }
            className="flex-1 px-4 py-3 rounded-full outline-none
            bg-white text-sm shadow-md"
          />

          <button
            onClick={sendMessage}
            className="px-5 rounded-full bg-[#6C5CE7] text-white font-medium shadow-md active:scale-95 transition"
          >
            Send
          </button>

        </div>
      </div>
    </div>
  );
}

export default ChatRoom;