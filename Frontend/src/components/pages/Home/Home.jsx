import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { API } from "../../../api/api.js";

function Home() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

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

  useEffect(() => {
    fetchUser();
  }, []);

  if (!user) {
    return <p className="text-center mt-10">Loading...</p>;
  }

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

    </div>
  );
}

export default Home;