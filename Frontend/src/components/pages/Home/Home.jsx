import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { API } from "../../../api/api.js";
import { socket } from "../../../socket";
import { Bell, Power } from "lucide-react";

function Home() {
  const navigate = useNavigate();
  // ✅ Read from localStorage first — instant load, no waiting for API
  const getStoredUser = () => {
    try {
      const raw = localStorage.getItem("user");
      if (!raw || raw === "undefined" || raw === "null") return null;
      const p = JSON.parse(raw);
      return p._id ? p : (p.user || null);
    } catch { return null; }
  };
  const [user, setUser] = useState(getStoredUser);
  const [requests, setRequests] = useState([]);
  const [showBell, setShowBell] = useState(false);
  const [toast, setToast] = useState(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const bellRef = useRef(null);

  const showToast = (msg, type = "info") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchUser = async () => {
    try {
      const res = await API.get("/auth/me");
      setUser(res.data.user);
      // ✅ Keep localStorage in sync with latest user data from server
      localStorage.setItem("user", JSON.stringify(res.data.user));
    } catch (err) {
      // Only redirect if no local user either
      if (!getStoredUser()) navigate("/");
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
      socket.emit("joinUserRoom");
    }
  }, [user]);

  // ✅ New request notification — no alert(), uses toast
  useEffect(() => {
    socket.on("newRequest", (data) => {
      showToast(`📩 ${data.name} (@${data.userName}) wants to join!`, "info");
      fetchRequests();
    });
    return () => socket.off("newRequest");
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (bellRef.current && !bellRef.current.contains(e.target)) {
        setShowBell(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAccept = async (id, orderId) => {
    try {
      await API.patch(`/requests/${id}/accept`);
      fetchRequests();
      navigate(`/chat/${orderId}`);
    } catch (err) {
      showToast("Failed to accept request", "error");
    }
  };

  const handleDecline = async (id) => {
    try {
      await API.patch(`/requests/${id}/decline`);
      fetchRequests();
      showToast("Request declined", "info");
    } catch (err) {
      showToast("Failed to decline request", "error");
    }
  };

  // ✅ Logout — clears localStorage and redirects
  const handleLogout = () => {
    localStorage.clear();
    socket.disconnect();
    navigate("/");
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#E6EAF0] flex items-center justify-center">
        <p className="text-gray-500 text-sm">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#E6EAF0] px-6 py-8">

      {/* ── Toast ── */}
      {toast && (
        <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-xl shadow-lg text-white text-sm font-medium max-w-xs text-center
          ${toast.type === "success" ? "bg-green-500" : toast.type === "error" ? "bg-red-500" : "bg-[#6C5CE7]"}`}>
          {toast.msg}
        </div>
      )}

      {/* ✅ Logout Confirm Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-6">
          <div className="bg-[#E6EAF0] rounded-2xl p-6 w-full max-w-sm
            shadow-[8px_8px_16px_#C5C9D0,-8px_-8px_16px_#FFFFFF]">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-full bg-red-100">
                <Power size={20} className="text-red-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800">Log out?</h3>
            </div>
            <p className="text-sm text-gray-500 mb-6">
              You'll need to verify your email again to log back in.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-2 rounded-xl text-gray-700 text-sm font-medium
                bg-[#E6EAF0] shadow-[4px_4px_8px_#C5C9D0,-4px_-4px_8px_#FFFFFF]">
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 py-2 rounded-xl bg-red-500 text-white text-sm font-medium shadow-md active:scale-95 transition">
                Log out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Top bar ── */}
      <div className="flex justify-between items-center mb-10">

        {/* Welcome */}
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">
            Welcome, {user.name || "User"} 👋
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {user.collegeName || "No college"}
          </p>
        </div>

        {/* Right side icons */}
        <div className="flex items-center gap-3">

          {/* 🔔 Bell */}
          <div ref={bellRef} className="relative">
            <button
              onClick={() => setShowBell(!showBell)}
              className="relative p-2 rounded-xl bg-[#E6EAF0]
                shadow-[4px_4px_8px_#C5C9D0,-4px_-4px_8px_#FFFFFF]
                active:shadow-[inset_4px_4px_8px_#C5C9D0,inset_-4px_-4px_8px_#FFFFFF]
                transition">
              <Bell className="text-[#6C5CE7]" size={22} />
              {requests.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-bold">
                  {requests.length}
                </span>
              )}
            </button>

            {/* Dropdown */}
            {showBell && (
              <div className="absolute right-0 mt-3 w-72 p-4 rounded-2xl bg-[#E6EAF0] z-40
                shadow-[8px_8px_16px_#C5C9D0,-8px_-8px_16px_#FFFFFF]">
                <h2 className="font-semibold text-gray-800 mb-3">Join Requests</h2>
                {requests.length === 0 ? (
                  <p className="text-sm text-gray-500">No new requests</p>
                ) : (
                  requests.map((req) => (
                    <div key={req._id} className="mb-4 pb-4 border-b border-gray-200 last:border-0 last:mb-0 last:pb-0">
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">{req.userId?.name}</span> wants to join{" "}
                        <span className="text-[#6C5CE7] font-medium capitalize">{req.orderId?.platform}</span>
                      </p>
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={() => handleAccept(req._id, req.orderId._id)}
                          className="flex-1 py-1.5 bg-green-500 text-white text-xs rounded-lg font-medium active:scale-95 transition">
                          ✓ Accept
                        </button>
                        <button
                          onClick={() => handleDecline(req._id)}
                          className="flex-1 py-1.5 bg-red-400 text-white text-xs rounded-lg font-medium active:scale-95 transition">
                          ✕ Decline
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* ✅ Power / Logout button */}
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="p-2 rounded-xl bg-[#E6EAF0]
              shadow-[4px_4px_8px_#C5C9D0,-4px_-4px_8px_#FFFFFF]
              active:shadow-[inset_4px_4px_8px_#C5C9D0,inset_-4px_-4px_8px_#FFFFFF]
              active:scale-95 transition group">
            <Power size={22} className="text-gray-400 group-hover:text-red-500 transition-colors" />
          </button>

        </div>
      </div>

      {/* ── Cards ── */}
      <div
        onClick={() => navigate("/create-order")}
        className="p-6 rounded-2xl mb-6 cursor-pointer
        bg-[#E6EAF0]
        shadow-[8px_8px_16px_#C5C9D0,-8px_-8px_16px_#FFFFFF]
        hover:shadow-[4px_4px_10px_#C5C9D0,-4px_-4px_10px_#FFFFFF]
        active:shadow-[inset_6px_6px_12px_#C5C9D0,inset_-6px_-6px_12px_#FFFFFF]
        active:scale-95 transition">
        <h2 className="text-lg font-semibold text-[#8d83dc]">🛒 Create New Order</h2>
        <p className="text-sm text-[#8d83dc] mt-1">Start an order and let others join</p>
      </div>

      <div
        onClick={() => navigate("/active-orders")}
        className="p-6 rounded-2xl cursor-pointer
        bg-[#E6EAF0]
        shadow-[8px_8px_16px_#C5C9D0,-8px_-8px_16px_#FFFFFF]
        hover:shadow-[4px_4px_10px_#C5C9D0,-4px_-4px_10px_#FFFFFF]
        active:shadow-[inset_6px_6px_12px_#C5C9D0,inset_-6px_-6px_12px_#FFFFFF]
        active:scale-95 transition">
        <h2 className="text-lg font-semibold text-[#8d83dc]">⏱️ View Active Orders</h2>
        <p className="text-sm text-[#8d83dc] mt-1">See ongoing orders in your hostel</p>
      </div>

      {/* ── Branding ── */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-center">
        <h2 className="text-2xl font-bold text-[#6C5CE7]">OrderMate</h2>
        <p className="text-xs text-gray-500 mt-1">Order together. Save together.</p>
      </div>

    </div>
  );
}

export default Home;
