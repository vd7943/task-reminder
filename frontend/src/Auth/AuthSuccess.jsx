import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

const AuthSuccess = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAuthUser = async () => {
      try {
        const res = await axios.get("https://task-reminder-4sqz.onrender.com/user/auth/success", {
          withCredentials: true,
        });

        if (res.data.user) {
          toast.success("Login successfull!");
          setTimeout(() => {
            localStorage.setItem("User", JSON.stringify(res.data.user));
            navigate("/");
            window.location.reload();
          }, 1000);
        }
      } catch (error) {
        console.error("Auth Error:", error);
        toast.error("Authentication failed.");
        navigate("/login");
      }
    };

    fetchAuthUser();
  }, [navigate]);

  return (
    <div className="flex w-screen items-center justify-center h-screen bg-gray-900">
      <div className="bg-gray-800 text-white p-6 rounded-lg shadow-lg text-center w-96 animate-fadeIn">
        <div className="flex justify-center mb-4">
          <div className="h-12 w-12 border-4 border-t-transparent border-white rounded-full animate-spin"></div>
        </div>
        <h2 className="text-2xl font-semibold">Authenticating...</h2>
        <p className="mt-2">Please wait while we verify your credentials.</p>
      </div>
    </div>
  );
};

export default AuthSuccess;
