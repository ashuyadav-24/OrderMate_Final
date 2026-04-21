import { useEffect, useState } from "react";
import { API } from "../../../api/api";
import { useNavigate } from "react-router-dom";
import { socket } from "../../../socket";
import NotificationBell from "../NotificationBell/NotificationBell.jsx";

function ActiveOrders() {
  const [orders, setOrders] = useState([]);
  const [requestedIds, setRequestedIds] = useState(
    () => JSON.parse(localStorage.getItem("requestedIds") || "[]")
  );
  const [acceptedIds, setAcceptedIds] = useState([]);
  const [time, setTime] = useState(Date.now());
  const [toast, setToast] = useState(null);

  const navigate = useNavigate();

  const getUser = () => {
    try {
      const raw = localStorage.getItem("user");

      if (!raw || raw === "undefined" || raw === "null") return {};

      const p = JSON.parse(raw);

      return p._id ? p : p.user || p;
    } catch {
      return {};
    }
  };

  const user = getUser();

  const showToast = (msg, type = "info") => {
    setToast({ msg, type });

    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  useEffect(() => {
    localStorage.setItem(
      "requestedIds",
      JSON.stringify(requestedIds)
    );
  }, [requestedIds]);

  const fetchOrders = async () => {
    try {
      const res = await API.get("/orders");
      setOrders(res.data || []);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchOrders();

    const interval = setInterval(() => {
      fetchOrders();
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(Date.now());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    socket.emit("joinUserRoom", user._id);

    socket.on("requestAccepted", async ({ orderId }) => {
  showToast("🎉 Request accepted! Start chat now.", "success");

  // remove pending requested state
  setRequestedIds((prev) =>
    prev.filter((id) => id !== orderId)
  );

  // force accepted state for Start Chat button
  setAcceptedIds((prev) =>
    prev.includes(orderId)
      ? prev
      : [...prev, orderId]
  );

  await fetchOrders();

  // Optional auto redirect after accept
  navigate(`/chat/${orderId}`);
});

    socket.on("requestDeclined", ({ orderId }) => {
      showToast("❌ Request declined", "error");

      setRequestedIds((prev) =>
        prev.filter((id) => id !== orderId)
      );
    });

    return () => {
      socket.off("requestAccepted");
      socket.off("requestDeclined");
    };
  }, []);

  const getTimeLeft = (expiresAt) => {
    const diff = new Date(expiresAt) - time;

    if (diff <= 0) return "Expired";

    const min = Math.floor(diff / 60000);
    const sec = Math.floor((diff % 60000) / 1000);

    return `${min}m ${sec}s`;
  };

  const isParticipant = (order) =>
    order.participants?.some(
      (p) =>
        String(p.userId?._id || p.userId) ===
        String(user._id)
    );

  const isAdmin = (order) =>
    String(order.admin?._id || order.admin) ===
    String(user._id);

  const handleJoin = async (orderId) => {
    try {
      await API.post("/requests/send", {
        orderId,
        amount: 0,
      });

      setRequestedIds((prev) =>
        prev.includes(orderId)
          ? prev
          : [...prev, orderId]
      );

      showToast("⏳ Request sent to admin");
    } catch (err) {
      showToast(
        err.response?.data?.message ||
          "Failed to join",
        "error"
      );
    }
  };

  return (
    <div className="min-h-screen bg-[#E6EAF0] px-6 py-8">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 rounded-xl shadow-lg text-white text-sm font-medium
          ${
            toast.type === "success"
              ? "bg-green-500"
              : toast.type === "error"
              ? "bg-red-500"
              : "bg-[#6C5CE7]"
          }`}
        >
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-semibold text-gray-800">
          Active Orders
        </h1>

        <NotificationBell />
      </div>

      {/* Orders */}
      {orders.length === 0 ? (
        <div className="mt-28 text-center text-gray-500">
          <h2 className="text-xl font-semibold">
            No Active Orders 😴
          </h2>
        </div>
      ) : (
        orders.map((order) => {
          const admin = isAdmin(order);

          const participant =
            isParticipant(order) ||
            acceptedIds.includes(order._id);

          const requested =
            requestedIds.includes(order._id);

          const isClosed =
            order.status === "closed";

          let label,
            color,
            disabled,
            action;
if (isClosed) {
  label = "Closed";
  color = "bg-gray-400";
  disabled = true;
} else if (admin) {
  label = "Created by You 👑";
  color = "bg-[#6C5CE7]";
  disabled = true;
} else if (participant) {
  label = "Start Chat 💬";
  color = "bg-green-600";
  disabled = false;
  action = () => navigate(`/chat/${order._id}`);
} else if (requested) {
  label = "Requested ⏳";
  color = "bg-gray-400";
  disabled = true;
} else {
  label = "Join";
  color = "bg-[#6C5CE7]";
  disabled = false;
  action = () => handleJoin(order._id);
}

          return (
            <div
              key={order._id}
              className="p-5 mb-5 rounded-2xl bg-[#E6EAF0]
              shadow-[8px_8px_16px_#C5C9D0,-8px_-8px_16px_#FFFFFF]"
            >
              <div className="flex justify-between items-start">
                <h2 className="text-lg font-semibold text-[#6C5CE7] capitalize">
                  {order.platform}
                </h2>

                <span
                  className={`text-xs px-2 py-1 rounded-full font-medium
                  ${
                    order.status === "open"
                      ? "bg-green-100 text-green-700"
                      : order.status === "matched"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {order.status}
                </span>
              </div>

              <p className="text-sm text-gray-500 mt-1">
                Hostel {order.hostel}
              </p>

              <p className="text-sm text-gray-700 mt-1">
                ₹{order.currentAmount} / ₹
                {order.targetAmount}
              </p>

              <p className="text-green-600 text-sm">
                Need ₹
                {Math.max(
                  0,
                  order.targetAmount -
                    order.currentAmount
                )}{" "}
                more
              </p>

              <p className="text-xs text-gray-500 mt-1">
                👥{" "}
                {order.participants?.length || 0} joined
              </p>

              <p className="text-xs text-gray-500 mt-1">
                ⏱ {getTimeLeft(order.expiresAt)}
              </p>

              {order.admin?.userName && (
                <p className="text-xs text-gray-400 mt-1">
                  by @{order.admin.userName}
                </p>
              )}

              <button
                onClick={action}
                disabled={disabled}
                className={`mt-3 w-full py-2 rounded-xl text-white ${color}
                shadow-md active:scale-95 transition
                disabled:opacity-70 disabled:cursor-not-allowed`}
              >
                {label}
              </button>
            </div>
          );
        })
      )}

      {/* Footer */}
      {/* Footer */}
<div className="mt-8 pb-6 text-center">
  <h2 className="text-xl font-bold text-[#6C5CE7]">
    OrderMate
  </h2>

  <p className="text-xs text-gray-500">
    Order together. Save together.
  </p>
</div>
    </div>
  );
}

export default ActiveOrders;