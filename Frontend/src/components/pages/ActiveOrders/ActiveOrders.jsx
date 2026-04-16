import { useEffect, useState } from "react";
import { API } from "../../../api/api";

function ActiveOrders() {
  const [orders, setOrders] = useState([]);
  const [time, setTime] = useState(Date.now());

  // 🔥 Fetch orders
  const fetchOrders = async () => {
    try {
      const res = await API.get("/orders");
      setOrders(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  // 🔁 Auto refresh (every 5 sec)
  useEffect(() => {
    fetchOrders();

    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, []);

  // ⏱️ Live timer update
  useEffect(() => {
    const interval = setInterval(() => {
      setTime(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // ⏱️ Time left
  const getTimeLeft = (expiresAt) => {
    const diff = new Date(expiresAt) - time;
    if (diff <= 0) return "Expired";

    const min = Math.floor(diff / 60000);
    const sec = Math.floor((diff % 60000) / 1000);

    return `${min}m ${sec}s`;
  };

  // 🔥 Join order
  const handleJoin = async (id) => {
    const amount = prompt("Enter your amount");
    if (!amount) return;

    try {
      await API.post("/orders/join", {
        orderId: id,
        amount: Number(amount),
      });

      fetchOrders();
    } catch (err) {
      console.log(err);
      alert("Failed to join");
    }
  };

  return (
    <div className="min-h-screen bg-[#E6EAF0] px-6 py-8">

      <h1 className="text-xl font-semibold text-gray-800 mb-6">
        Active Orders
      </h1>

      {orders.map((order) => {
        const remaining = Math.max(
          0,
          order.targetAmount - order.currentAmount
        );

        const isFull = order.currentAmount >= order.targetAmount;

        return (
          <div
            key={order._id}
            className="p-6 mb-5 rounded-2xl
            bg-[#E6EAF0]
            shadow-[8px_8px_16px_#C5C9D0,-8px_-8px_16px_#FFFFFF]"
          >
            <h2 className="text-lg font-semibold text-[#6C5CE7]">
              {order.platform}
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              {order.hostel}
            </p>

            <p className="mt-2 text-gray-700">
              ₹{order.currentAmount} / ₹{order.targetAmount}
            </p>

            <p className="text-green-600 text-sm">
              Need ₹{remaining} more
            </p>

            {/* 👥 Participants */}
            <p className="text-xs text-gray-500 mt-1">
              👥 {order.participants?.length || 0} joined
            </p>

            {/* ⏱ Timer */}
            <p className="text-xs text-gray-500 mt-1">
              ⏱ {getTimeLeft(order.expiresAt)}
            </p>

            <button
              disabled={isFull}
              onClick={() => handleJoin(order._id)}
              className={`mt-3 w-full py-2 rounded-xl text-white 
              ${isFull ? "bg-gray-400" : "bg-[#6C5CE7]"}
              shadow-[6px_6px_12px_#C5C9D0,-6px_-6px_12px_#FFFFFF]
              active:scale-95 transition`}
            >
              {isFull ? "Full" : "Join"}
            </button>
          </div>
        );
      })}
    </div>
  );
}

export default ActiveOrders;