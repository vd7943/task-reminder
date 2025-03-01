import React from "react";
import { useAuth } from "../context/AuthProvider";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const Logout = () => {
  const [authUser, setAuthUser] = useAuth();

  const navigate = useNavigate();
  const handleLogout = () => {
    try {
      setAuthUser({
        ...authUser,
        user: null,
      });
      localStorage.removeItem("User");
      toast.success("Logout successfully");
      setTimeout(() => {
        navigate("/");
        window.location.reload();
      }, 1000);
    } catch (error) {
      toast.error("Error: " + error.message);
    }
  };

  return (
    <div>
      <button
        className="px-6 py-2 text-lg font-semibold text-white bg-red-500 rounded-lg cursor-pointer shadow-lg 
               transform transition-all duration-300 hover:scale-102 hover:shadow-xl active:scale-95"
        onClick={handleLogout}
      >
        Logout
      </button>
    </div>
  );
};

export default Logout;
