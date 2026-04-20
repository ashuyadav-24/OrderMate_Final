import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API } from "../../../api/api";

function CreateOrder() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    platform: "instamart",
    targetAmount: "",
    duration: " ",
    college: "NIT Jamshedpur",
    hostel: "",
  });

  const handleSubmit = async () => {
    try {
      const res = await API.post("/orders/create", {
        ...form,
        targetAmount: Number(form.targetAmount),
        duration: Number(form.duration),
      });

      navigate("/active-orders");

    } catch (err) {
      console.log("❌ ERROR:", err.response?.data);
      alert(err.response?.data?.message || "Failed to create order");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#EEF2F7] to-[#DDE3EC] flex items-center justify-center px-6">

      {/* Logo */}
      <div className="absolute top-6 right-6 text-right">
        <h2 className="text-2xl font-bold text-[#6C5CE7]">
          OrderMate
        </h2>
        <p className="text-xs text-gray-500 mt-1">
          Order together. Save together.
        </p>
      </div>

      <div className="w-full max-w-md p-10 rounded-3xl 
        bg-[#E6EAF0]/80 backdrop-blur-xl
        shadow-[12px_12px_24px_#C5C9D0,-12px_-12px_24px_#FFFFFF]">

        <h1 className="text-xl font-semibold text-gray-800 mb-6 text-center">
          Create Order
        </h1>

        {/* Platform */}
        <select
          value={form.platform}
          onChange={(e) =>
            setForm({ ...form, platform: e.target.value })
          }
          className="w-full mb-4 p-4 rounded-xl outline-none 
          bg-[#E6EAF0]
          shadow-[inset_6px_6px_12px_#C5C9D0,inset_-6px_-6px_12px_#FFFFFF]"
        >
          <option value="instamart">Instamart</option>
          <option value="blinkit">Blinkit</option>
          <option value="zepto">Zepto</option>
          <option value="amazon">Amazon</option>
          <option value="flipkart">Flipkart</option>
        </select>

        {/* College */}
        <select
          value={form.college}
          onChange={(e) =>
            setForm({ ...form, college: e.target.value })
          }
          className="w-full mb-4 p-4 rounded-xl outline-none 
          bg-[#E6EAF0]
          shadow-[inset_6px_6px_12px_#C5C9D0,inset_-6px_-6px_12px_#FFFFFF]"
        >
          <option value="NIT Jamshedpur">NIT Jamshedpur</option>
        </select>

        {/* Hostel */}
        <select
          value={form.hostel}
          onChange={(e) =>
            setForm({ ...form, hostel: e.target.value })
          }
          className="w-full mb-4 p-4 rounded-xl outline-none 
          bg-[#E6EAF0]
          shadow-[inset_6px_6px_12px_#C5C9D0,inset_-6px_-6px_12px_#FFFFFF]"
        >
          <option value="">Select Hostel</option>

          <option value="A">Hostel A (Girls)</option>
          <option value="B">Hostel B (Girls)</option>
          <option value="C">Hostel C (Girls)</option>
          <option value="D">Hostel D (Girls)</option>

          <option value="E">Hostel E (Boys)</option>
          <option value="F">Hostel F (Boys)</option>
          <option value="G">Hostel G (Boys)</option>
          <option value="H">Hostel H (Boys)</option>
          <option value="I">Hostel I (Boys)</option>
          <option value="J">Hostel J (Boys)</option>
          <option value="K">Hostel K (Boys)</option>
          <option value="L">Hostel L (Boys)</option>

          <option value="M">Hostel M (Girls)</option>
        </select>

        {/* Target */}
        <input
          type="number"
          placeholder="Target Amount ₹"
          value={form.targetAmount}
          onChange={(e) =>
            setForm({ ...form, targetAmount: e.target.value })
          }
          className="w-full mb-4 p-4 rounded-xl outline-none 
          bg-[#E6EAF0]
          shadow-[inset_6px_6px_12px_#C5C9D0,inset_-6px_-6px_12px_#FFFFFF]"
        />

        {/* Duration */}
        <input
          type="number"
          placeholder="Time (minutes)"
          value={form.duration}
          onChange={(e) =>
            setForm({ ...form, duration: e.target.value })
          }
          className="w-full mb-6 p-4 rounded-xl outline-none 
          bg-[#E6EAF0]
          shadow-[inset_6px_6px_12px_#C5C9D0,inset_-6px_-6px_12px_#FFFFFF]"
        />

        <button
          onClick={handleSubmit}
          className="w-full py-4 rounded-xl text-white bg-[#6C5CE7]
          shadow-[6px_6px_12px_#C5C9D0,-6px_-6px_12px_#FFFFFF]
          active:scale-95 transition"
        >
          Create Order
        </button>

      </div>
    </div>
  );
}

export default CreateOrder;