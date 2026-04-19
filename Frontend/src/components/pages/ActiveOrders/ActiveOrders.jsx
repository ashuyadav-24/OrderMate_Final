import { useEffect, useState } from "react";
import { API } from "../../../api/api";

function ActiveOrders() {
  const [orders, setOrders] = useState([]);
  const [requestedIds, setRequestedIds] = useState([]);
  const [time, setTime] = useState(Date.now());
  
  // ─────────────────────────────────────────────
  // 🔥 Fetch all active orders
  // ─────────────────────────────────────────────
  const fetchOrders = async () => {
    try {
      const res = await API.get("/orders");
      setOrders(res.data);
    } catch (err) {
      console.log("❌ ERROR FETCHING ORDERS:", err.response?.data);
      // ❌ removed alert (bad UX for background fetch)
    }
  };

  // ─────────────────────────────────────────────
  // 🔁 Auto refresh every 5 seconds
  // ─────────────────────────────────────────────
  useEffect(() => {
    fetchOrders();

    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, []);

  // ─────────────────────────────────────────────
  // ⏱️ Live timer update every second
  // ─────────────────────────────────────────────
  useEffect(() => {
    const interval = setInterval(() => {
      setTime(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // ─────────────────────────────────────────────
  // ⏱️ Calculate remaining time
  // ─────────────────────────────────────────────
  const getTimeLeft = (expiresAt) => {
    const diff = new Date(expiresAt) - time;
    if (diff <= 0) return "Expired";

    const min = Math.floor(diff / 60000);
    const sec = Math.floor((diff % 60000) / 1000);

    return `${min}m ${sec}s`;
  };

  // ─────────────────────────────────────────────
  // 🔥 Join request
  // ─────────────────────────────────────────────
  const handleJoin = async (id) => {
    try {
      await API.post("/requests/send", {
        orderId: id,
        amount: 50, // temporary fixed amount
      });

      setRequestedIds((prev) => [...prev, id]);
      fetchOrders();
    } catch (err) {
      console.log("❌ JOIN ERROR:", err.response?.data);
      alert(err.response?.data?.message || "Failed to join");
    }
  };

  // ─────────────────────────────────────────────
  // 🏠 Format hostel name
  // ─────────────────────────────────────────────
  const formatHostel = (hostel) => {
    if (!hostel) return "";

    const girls = ["A", "B", "C", "D", "M"];
    const type = girls.includes(hostel) ? "Girls" : "Boys";

    return `Hostel ${hostel} (${type})`;
  };

  return (
    <div className="min-h-screen bg-[#E6EAF0] px-6 py-8">

      {/* Title */}
      <h1 className="text-xl font-semibold text-gray-800 mb-6">
        Active Orders
      </h1>

      {/* ─────────────────────────────────────────────
          📭 No Orders UI
      ───────────────────────────────────────────── */}
      {orders.length === 0 ? (
        <div className="text-center mt-20 text-gray-500">
          <h2 className="text-lg font-semibold">
            No Active Orders 😴
          </h2>
          <p className="text-sm mt-2">
            Be the first one to create an order!
          </p>
        </div>
      ) : (
        // ─────────────────────────────────────────────
        // 📦 Orders List
        // ─────────────────────────────────────────────
        orders.map((order) => {
          const remaining = Math.max(
            
            0,
            order.targetAmount - order.currentAmount
          );

          const isFull = false;

          return (
            <div
              key={order._id}
              className="p-6 mb-5 rounded-2xl
              bg-[#E6EAF0]
              shadow-[8px_8px_16px_#C5C9D0,-8px_-8px_16px_#FFFFFF]"
            >
              {/* Platform */}
              <h2 className="text-lg font-semibold text-[#6C5CE7]">
                {order.platform}
              </h2>

              {/* Hostel */}
              <p className="text-sm text-gray-500 mt-1">
                {formatHostel(order.hostel)}
              </p>

              {/* Remaining amount */}
              <p className="text-green-600 text-sm mt-2">
                Need ₹{remaining} more
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
                disabled={isFull || requestedIds.includes(order._id)}
                onClick={() => handleJoin(order._id)}
                className={`mt-3 w-full py-2 rounded-xl text-white 
                ${isFull ? "bg-gray-400" : "bg-[#6C5CE7]"}
                shadow-[6px_6px_12px_#C5C9D0,-6px_-6px_12px_#FFFFFF]
                active:scale-95 transition`}
              >
            {isFull
              ? "Full"
              : requestedIds.includes(order._id)
              ? "Requested"
              : "Join"}
              </button>
            </div>
          );
        })
      )}

      {/* ─────────────────────────────────────────────
          🔻 Bottom Branding
      ───────────────────────────────────────────── */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 text-center">
        <h2 className="text-xl font-bold text-[#6C5CE7]">
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