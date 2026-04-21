import { useEffect, useRef, useState } from "react";
import { Bell } from "lucide-react";
import { API } from "../../../api/api";
import { socket } from "../../../socket";
import { useNavigate } from "react-router-dom";

// ─────────────────────────────────────────────
// 🔔 NOTIFICATION BELL — shared across all pages
// Shows pending join requests for admin
// Works on Home, ActiveOrders, ChatRoom etc.
// ─────────────────────────────────────────────
function NotificationBell() {
  const [requests, setRequests] = useState([]);
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const bellRef = useRef(null);
  const navigate = useNavigate();

  const showToast = (msg, type = "info") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchRequests = async () => {
    try {
      const res = await API.get("/requests/my-pending");
      setRequests(res.data || []);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchRequests();
    const interval = setInterval(fetchRequests, 5000);
    return () => clearInterval(interval);
  }, []);

  // Listen for new requests via socket
  useEffect(() => {
    socket.on("newRequest", ({ name, userName }) => {
      showToast(`📩 ${name} (@${userName}) wants to join!`, "info");
      fetchRequests();
    });
    return () => socket.off("newRequest");
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (bellRef.current && !bellRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleAccept = async (req) => {
    try {
      await API.patch(`/requests/${req._id}/accept`);
      fetchRequests();
      setOpen(false);
      navigate(`/chat/${req.orderId._id}`);
    } catch (err) {
      showToast("Failed to accept", "error");
    }
  };

  const handleDecline = async (req) => {
    try {
      await API.patch(`/requests/${req._id}/decline`);
      fetchRequests();
      showToast("Request declined");
    } catch (err) {
      showToast("Failed to decline", "error");
    }
  };

  return (
    <>
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-[999] px-5 py-2.5 rounded-xl shadow-lg text-white text-sm font-medium max-w-xs text-center
          ${toast.type === "error" ? "bg-red-500" : "bg-[#6C5CE7]"}`}>
          {toast.msg}
        </div>
      )}

      <div ref={bellRef} className="relative">
        <button
          onClick={() => setOpen(!open)}
          className="relative p-2 rounded-xl bg-[#E6EAF0]
            shadow-[4px_4px_8px_#C5C9D0,-4px_-4px_8px_#FFFFFF]
            active:shadow-[inset_4px_4px_8px_#C5C9D0,inset_-4px_-4px_8px_#FFFFFF] transition">
          <Bell size={22} className="text-[#6C5CE7]" />
          {requests.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-bold">
              {requests.length}
            </span>
          )}
        </button>

        {open && (
          <div className="absolute right-0 mt-3 w-72 p-4 rounded-2xl z-50
            bg-[#E6EAF0] shadow-[8px_8px_16px_#C5C9D0,-8px_-8px_16px_#FFFFFF]">
            <h2 className="font-semibold text-gray-800 mb-3 text-sm">Join Requests</h2>
            {requests.length === 0 ? (
              <p className="text-sm text-gray-400">No pending requests</p>
            ) : (
              requests.map((req) => (
                <div key={req._id} className="mb-4 pb-4 border-b border-gray-200 last:border-0 last:mb-0 last:pb-0">
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">{req.userId?.name}</span>
                    {" "}wants to join{" "}
                    <span className="text-[#6C5CE7] font-medium capitalize">{req.orderId?.platform}</span>
                  </p>
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => handleAccept(req)}
                      className="flex-1 py-1.5 bg-green-500 text-white text-xs rounded-lg font-medium active:scale-95 transition">
                      ✓ Accept
                    </button>
                    <button
                      onClick={() => handleDecline(req)}
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
    </>
  );
}

export default NotificationBell;
