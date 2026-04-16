import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API } from "../../../api/api.js";

function CreateAccount() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    collegeName: "",
    hostelName: "",
    userName: "",
  });

  // 🔥 Submit profile to backend
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

      console.log("PROFILE RESPONSE:", res.data);

      // ✅ After success → go home
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

        {/* Inputs */}
        {[
          { name: "name", label: "Full Name", placeholder: "Enter your name" },
          { name: "collegeName", label: "College", placeholder: "Enter your college" },
          { name: "hostelName", label: "Hostel", placeholder: "Enter your hostel" },
          { name: "userName", label: "Username", placeholder: "Choose a username" },
        ].map((field) => (
          <div key={field.name} className="mb-5">
            
            <p className="text-xs text-gray-900 mb-1 ml-1">
              {field.label}
            </p>

            <input
              type="text"
              placeholder={field.placeholder}
              value={form[field.name]}
              onChange={(e) =>
                setForm({ ...form, [field.name]: e.target.value })
              }
              className="w-full text-sm text-gray-800 p-4 rounded-xl outline-none 
              bg-[#E6EAF0]
              shadow-[inset_6px_6px_12px_#C5C9D0,inset_-6px_-6px_12px_#FFFFFF]
              focus:shadow-[inset_3px_3px_6px_#C5C9D0,inset_-3px_-3px_6px_#FFFFFF]"
            />
          </div>
        ))}

        {/* Button */}
        <button 
          onClick={handleCreateAccount}
          className="w-full text-sm font-medium py-4 rounded-xl 
          text-white bg-[#6C5CE7]
          shadow-[6px_6px_12px_#C5C9D0,-6px_-6px_12px_#FFFFFF]
          active:scale-95 transition">
          Create Account
        </button>

      </div>
    </div>
  );
}

export default CreateAccount;