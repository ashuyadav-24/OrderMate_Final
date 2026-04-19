import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { API } from "../../../api/api.js";
import { socket } from "../../../socket"; 
import { Bell } from "lucide-react";
function Home() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  const [requests, setRequests] = useState([]);
  const [showBell, setShowBell] = useState(false);

  const bellRef = useRef(null);

  // 🔥 Fetch user from backend
  const fetchUser = async () => {
    try {
      const res = await API.get("/auth/me");

      console.log("USER:", res.data);

      setUser(res.data.user);

    } catch (err) {
      console.log(err);

      // ❌ Token invalid → go login
      navigate("/");
    }
  };

  const fetchRequests = async () => {
  try {
    const res = await API.get("/requests/my-pending");
    setRequests(res.data);
  } catch (err) {
    console.log(err);
  }
  };

  useEffect(() => {
  fetchUser();
  fetchRequests();

  const interval = setInterval(fetchRequests, 3000);

  return () => clearInterval(interval);
}, []);

  useEffect(() => {
  if (user?._id) {
    socket.emit("joinRoom", user._id);
    console.log("🔥 Joined socket room:", user._id);
  }
}, [user]);

useEffect(() => {
  socket.on("newRequest", (data) => {
    console.log("🔥 NEW REQUEST:", data);

    alert(`🔥 ${data.userName} sent a join request`);
  });

  return () => socket.off("newRequest");
}, []);

useEffect(() => {
  const handleClickOutside = (event) => {
    if (
      bellRef.current &&
      !bellRef.current.contains(event.target)
    ) {
      setShowBell(false);
    }
  };

  document.addEventListener("mousedown", handleClickOutside);

  return () => {
    document.removeEventListener(
      "mousedown",
      handleClickOutside
    );
  };
  }, []);

const handleAccept = async (id, orderId) => {
  try {
    await API.patch(`/requests/${id}/accept`);
    navigate(`/chat/${orderId}`);
  } catch (err) {
    console.log(err);
  }
};

const handleDecline = async (id) => {
  try {
    await API.patch(`/requests/${id}/decline`);
    fetchRequests();
  } catch (err) {
    console.log(err);
  }
};


  if (!user) {
    return <p className="text-center mt-10">Loading...</p>;
  }
  console.log("USER STATE:", user);
  return (
    <div className="min-h-screen bg-[#E6EAF0] px-6 py-8">

      {/* Logo */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-center">
        <h2 className="text-2xl font-bold text-[#6C5CE7]">
          OrderMate
        </h2>
        <p className="text-xs text-gray-500 mt-1">
          Order together. Save together.
        </p>
      </div>

      {/* Welcome */}
      <div className="mb-10">
        <h1 className="text-2xl font-semibold text-gray-800">
          Welcome, {user.name || "User"} 👋
        </h1>

        <p className="text-sm text-gray-500 mt-1">
          {user.collegeName || "No college"}
        </p>
      </div>

      {/* Create Order */}
      <div
        onClick={() => navigate("/create-order")}
        className="p-6 rounded-2xl mb-6 cursor-pointer
        bg-[#E6EAF0]
        shadow-[8px_8px_16px_#C5C9D0,-8px_-8px_16px_#FFFFFF]
        hover:shadow-[4px_4px_10px_#C5C9D0,-4px_-4px_10px_#FFFFFF]
        active:shadow-[inset_6px_6px_12px_#C5C9D0,inset_-6px_-6px_12px_#FFFFFF]
        active:scale-95 transition">

        <h2 className="text-lg font-semibold text-[#8d83dc]">
          🛒 Create New Order
        </h2>

        <p className="text-sm text-[#8d83dc] mt-1">
          Start an order and let others join
        </p>
      </div>

      {/* View Orders */}
      <div
        onClick={() => navigate("/active-orders")}
        className="p-6 rounded-2xl cursor-pointer
        bg-[#E6EAF0]
        shadow-[8px_8px_16px_#C5C9D0,-8px_-8px_16px_#FFFFFF]
        hover:shadow-[4px_4px_10px_#C5C9D0,-4px_-4px_10px_#FFFFFF]
        active:shadow-[inset_6px_6px_12px_#C5C9D0,inset_-6px_-6px_12px_#FFFFFF]
        active:scale-95 transition">

        <h2 className="text-lg font-semibold text-[#8d83dc]">
          ⏱️ View Active Orders
        </h2>

        <p className="text-sm text-[#8d83dc] mt-1">
          See ongoing orders in your hostel
        </p>
      </div>

      <div
          ref={bellRef}
          className="absolute top-6 right-6"
>
  <button
    onClick={() => setShowBell(!showBell)}
    className="relative"
  >
    <Bell className="text-[#6C5CE7]" size={28} />

    {requests.length > 0 && (
      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-1 rounded-full">
        {requests.length}
      </span>
    )}
  </button>

  {showBell && (
    <div className="mt-3 w-72 p-4 rounded-2xl bg-white shadow-xl">
      <h2 className="font-semibold mb-3">Requests</h2>

      {requests.length === 0 ? (
        <p className="text-sm text-gray-500">
          No new requests
        </p>
      ) : (
        requests.map((req) => (
          <div key={req._id} className="mb-4">
            <p className="text-sm">
              {req.userId?.name} wants to join{" "}
              {req.orderId?.platform}
            </p>

            <div className="flex gap-2 mt-2">
              <button
                onClick={() =>
                  handleAccept(req._id, req.orderId._id)
                }
                className="px-3 py-1 bg-green-500 text-white rounded-lg"
              >
                Accept
              </button>

              <button
                onClick={() => handleDecline(req._id)}
                className="px-3 py-1 bg-red-500 text-white rounded-lg"
              >
                Reject
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  )}
</div>

    </div>
  );
}

export default Home;