import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API } from "../../../api/api.js";

function CreateAccount() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    collegeName: "NIT Jamshedpur",
    hostelName: "",
    userName: "",
  });

  const handleCreateAccount = async () => {
    try {
      const { name, collegeName, hostelName, userName } = form;

      if (!name || !collegeName || !hostelName || !userName) {
        alert("All fields are required");
        return;
      }

      const res = await API.put("/auth/profile", {
        name,
        collegeName,
        hostelName,
        userName,
      });

      // ✅ Save updated user to localStorage so it persists across tabs
      localStorage.setItem("user", JSON.stringify(res.data.user));

      navigate("/home");

    } catch (err) {
      console.log(err);
      alert(err.response?.data?.message || "Error creating profile");
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

      {/* Card */}
      <div className="w-full max-w-md p-10 rounded-3xl 
        bg-[#E6EAF0]/80 backdrop-blur-xl
        shadow-[12px_12px_24px_#C5C9D0,-12px_-12px_24px_#FFFFFF]">

        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold text-gray-800">
            Create Account
          </h1>
          <p className="text-sm text-gray-500 mt-2">
            Tell us about yourself
          </p>
        </div>

        {/* Name */}
        <div className="mb-5">
          <p className="text-xs text-gray-900 mb-1 ml-1">
            Full Name
          </p>
          <input
            type="text"
            placeholder="Enter your name"
            value={form.name}
            onChange={(e) =>
              setForm({ ...form, name: e.target.value })
            }
            className="w-full p-4 rounded-xl outline-none 
            bg-[#E6EAF0]
            shadow-[inset_6px_6px_12px_#C5C9D0,inset_-6px_-6px_12px_#FFFFFF]"
          />
        </div>

        {/* College (Dropdown) */}
        <div className="mb-5">
          <p className="text-xs text-gray-900 mb-1 ml-1">
            College
          </p>
          <select
            value={form.collegeName}
            onChange={(e) =>
              setForm({ ...form, collegeName: e.target.value })
            }
            className="w-full p-4 rounded-xl outline-none 
            bg-[#E6EAF0]
            shadow-[inset_6px_6px_12px_#C5C9D0,inset_-6px_-6px_12px_#FFFFFF]"
          >
            <option value="NIT Jamshedpur">NIT Jamshedpur</option>
          </select>
        </div>

        {/* Hostel (Dropdown) */}
        <div className="mb-5">
          <p className="text-xs text-gray-900 mb-1 ml-1">
            Hostel
          </p>
          <select
            value={form.hostelName}
            onChange={(e) =>
              setForm({ ...form, hostelName: e.target.value })
            }
            className="w-full p-4 rounded-xl outline-none 
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
        </div>

        {/* Username */}
        <div className="mb-5">
          <p className="text-xs text-gray-900 mb-1 ml-1">
            Username
          </p>
          <input
            type="text"
            placeholder="Choose a username"
            value={form.userName}
            onChange={(e) =>
              setForm({ ...form, userName: e.target.value })
            }
            className="w-full p-4 rounded-xl outline-none 
            bg-[#E6EAF0]
            shadow-[inset_6px_6px_12px_#C5C9D0,inset_-6px_-6px_12px_#FFFFFF]"
          />
        </div>

        {/* Button */}
        <button
          onClick={handleCreateAccount}
          className="w-full py-4 rounded-xl text-white bg-[#6C5CE7]
          shadow-[6px_6px_12px_#C5C9D0,-6px_-6px_12px_#FFFFFF]
          active:scale-95 transition"
        >
          Create Account
        </button>

      </div>
    </div>
  );
}

export default CreateAccount;