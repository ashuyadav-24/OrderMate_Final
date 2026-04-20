import { useEffect, useState } from "react";
import { API } from "../../../api/api";
import { useNavigate } from "react-router-dom";
import { socket } from "../../../socket";

function ActiveOrders() {
  const [orders, setOrders] = useState([]);
  const [requestedIds, setRequestedIds] = useState([]);
  const [time, setTime] = useState(Date.now());

  const navigate = useNavigate();

  // =====================================
  // Safe User Getter
  // =====================================
  const getUser = () => {
    try {
      const raw = localStorage.getItem("user");

      if (!raw || raw === "undefined") return {};

      const parsed = JSON.parse(raw);

      return parsed._id
        ? parsed
        : parsed.user || parsed;
    } catch {
      return {};
    }
  };

  const user = getUser();

  // =====================================
  // Fetch Orders
  // =====================================
  const fetchOrders = async () => {
    try {
      const res = await API.get("/orders");
      setOrders(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchOrders();

    const interval = setInterval(fetchOrders, 3000);

    return () => clearInterval(interval);
  }, []);

  // =====================================
  // Live Timer
  // =====================================
  useEffect(() => {
    const timer = setInterval(() => {
      setTime(Date.now());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // =====================================
  // 🔥 FINAL SOCKET FIX
  // =====================================
  useEffect(() => {
    if (user?._id) {
      socket.emit("joinRoom", user._id);
    }

    // Accepted → direct chat
    socket.on("requestAccepted", (data) => {
      setRequestedIds((prev) =>
        prev.filter((id) => id !== data.orderId)
      );

      navigate(`/chat/${data.orderId}`);
    });

    // Declined
    socket.on("requestDeclined", (data) => {
      setRequestedIds((prev) =>
        prev.filter((id) => id !== data.orderId)
      );

      alert("Your request was declined");
    });

    return () => {
      socket.off("requestAccepted");
      socket.off("requestDeclined");
    };
  }, [user?._id, navigate]);

  // =====================================
  // Time Left
  // =====================================
  const getTimeLeft = (expiresAt) => {
    const diff = new Date(expiresAt) - time;

    if (diff <= 0) return "Expired";

    const min = Math.floor(diff / 60000);
    const sec = Math.floor((diff % 60000) / 1000);

    return `${min}m ${sec}s`;
  };

  // =====================================
  // Join Request
  // =====================================
  const handleJoin = async (orderId) => {
    try {
      await API.post("/requests/send", {
        orderId,
        amount: 0,
      });

      setRequestedIds((prev) => [
        ...prev,
        orderId,
      ]);
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Failed to join"
      );
    }
  };

  return (
    <div className="min-h-screen bg-[#E6EAF0] px-6 py-8">

      {/* Header */}
      <h1 className="text-xl font-semibold text-gray-800 mb-6">
        Active Orders
      </h1>

      {/* Empty State */}
      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center mt-28 text-center">
          <div className="text-5xl mb-4">🛒</div>

          <h2 className="text-xl font-semibold text-gray-700">
            No Active Orders
          </h2>

          <p className="text-sm text-gray-500 mt-2">
            Start an order and invite others.
          </p>
        </div>
      ) : (
        orders.map((order) => {
          const requested =
            requestedIds.includes(order._id);

          return (
            <div
              key={order._id}
              className="p-5 mb-5 rounded-2xl bg-[#E6EAF0]
              shadow-[8px_8px_16px_#C5C9D0,-8px_-8px_16px_#FFFFFF]"
            >
              {/* Platform */}
              <h2 className="text-lg font-semibold text-[#6C5CE7] capitalize">
                {order.platform}
              </h2>

              {/* Hostel */}
              <p className="text-sm text-gray-500 mt-1">
                Hostel {order.hostel}
              </p>

              {/* Target */}
              <p className="text-sm font-medium text-green-600 mt-1">
                Target: ₹{order.targetAmount}
              </p>

              {/* Participants */}
              <p className="text-xs text-gray-500 mt-1">
                👥 {order.participants?.length || 0} joined
              </p>

              {/* Timer */}
              <p className="text-xs text-gray-500 mt-1">
                ⏱ {getTimeLeft(order.expiresAt)}
              </p>

              {/* Join Button */}
              <button
                onClick={() =>
                  handleJoin(order._id)
                }
                disabled={requested}
                className={`mt-3 w-full py-2 rounded-xl text-white
                ${
                  requested
                    ? "bg-gray-400"
                    : "bg-[#6C5CE7]"
                }
                shadow-md active:scale-95 transition`}
              >
                {requested
                  ? "Requested ⏳"
                  : "Join"}
              </button>
            </div>
          );
        })
      )}

      {/* Bottom Middle Logo */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 text-center pointer-events-none">
        <h2 className="text-lg font-bold text-[#6C5CE7]">
          OrderMate
        </h2>

        <p className="text-xs text-gray-500 mt-1">
          Order together. Save together.
        </p>
      </div>
    </div>
  );
}

export default ActiveOrders;