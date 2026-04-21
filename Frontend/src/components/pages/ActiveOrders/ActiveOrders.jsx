import { useEffect, useState } from "react";
import { API } from "../../../api/api";
import { useNavigate } from "react-router-dom";
import { socket } from "../../../socket";

function ActiveOrders() {
  const [orders, setOrders] = useState([]);
  const [requestedIds, setRequestedIds] = useState(
    JSON.parse(localStorage.getItem("requestedIds")) || []
  );
  const [time, setTime] = useState(Date.now());

  const navigate = useNavigate();

  const getUser = () => {
    try {
      const raw = localStorage.getItem("user");
      if (!raw || raw === "undefined") return {};
      const parsed = JSON.parse(raw);
      return parsed._id ? parsed : parsed.user || parsed;
    } catch {
      return {};
    }
  };

  const user = getUser();

  // save requested ids
  useEffect(() => {
    localStorage.setItem(
      "requestedIds",
      JSON.stringify(requestedIds)
    );
  }, [requestedIds]);

  const fetchOrders = async () => {
    try {
      const res = await API.get("/orders");
      const data = res.data || [];
      setOrders(data);

      // 🔥 auto redirect if user already participant
      const joinedOrder = data.find((order) =>
        order.participants?.some(
          (p) =>
            String(p.userId?._id || p.userId) ===
            String(user._id)
        )
      );

      if (joinedOrder?.isChatEnabled) {
        navigate(`/chat/${joinedOrder._id}`);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(Date.now());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (user?._id) {
      socket.emit("joinRoom", user._id);
    }

    socket.on("requestAccepted", (data) => {
      setRequestedIds((prev) =>
        prev.filter((id) => id !== data.orderId)
      );

      navigate(`/chat/${data.orderId}`);
    });

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

  const getTimeLeft = (expiresAt) => {
    const diff = new Date(expiresAt) - time;
    if (diff <= 0) return "Expired";

    const min = Math.floor(diff / 60000);
    const sec = Math.floor((diff % 60000) / 1000);

    return `${min}m ${sec}s`;
  };

  const handleJoin = async (orderId) => {
    try {
      await API.post("/requests/send", {
        orderId,
        amount: 0,
      });

      setRequestedIds((prev) => [...prev, orderId]);
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Failed to join"
      );
    }
  };

  return (
    <div className="min-h-screen bg-[#E6EAF0] px-6 py-8">
      <h1 className="text-xl font-semibold text-gray-800 mb-6">
        Active Orders
      </h1>

      {orders.length === 0 ? (
        <div className="mt-28 text-center">
          <h2 className="text-xl font-semibold">
            No Active Orders
          </h2>
        </div>
      ) : (
        orders.map((order) => {
          const requested =
            requestedIds.includes(order._id);

          const joined = order.participants?.some(
            (p) =>
              String(p.userId?._id || p.userId) ===
              String(user._id)
          );

          return (
            <div
              key={order._id}
              className="p-5 mb-5 rounded-2xl bg-white shadow"
            >
              <h2 className="text-lg font-semibold text-[#6C5CE7] capitalize">
                {order.platform}
              </h2>

              <p>Hostel {order.hostel}</p>

              <p className="text-green-600">
                Target: ₹{order.targetAmount}
              </p>

              <p>
                👥 {order.participants?.length || 0} joined
              </p>

              <p>
                ⏱ {getTimeLeft(order.expiresAt)}
              </p>

              <button
                disabled={requested || joined}
                onClick={() =>
                  handleJoin(order._id)
                }
                className={`mt-3 w-full py-2 rounded-xl text-white ${
                  joined
                    ? "bg-green-500"
                    : requested
                    ? "bg-gray-400"
                    : "bg-[#6C5CE7]"
                }`}
              >
                {joined
                  ? "Joined ✅"
                  : requested
                  ? "Requested ⏳"
                  : "Join"}
              </button>
            </div>
          );
        })
      )}
    </div>
  );
}

export default ActiveOrders;