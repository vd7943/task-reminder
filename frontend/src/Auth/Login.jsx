import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { FaGithub, FaGoogle } from "react-icons/fa";

const Login = () => {
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const navigate = useNavigate();

  const onSubmit = async (data) => {
    const formData = new FormData();
    formData.append("email", data.email);
    formData.append("password", data.password);

    setLoading(true);

    try {
      const res = await axios.post(
        "https://task-reminder-4sqz.onrender.com/user/login",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      if (res.data) {
        toast.success("Login successfully!");
        setTimeout(() => {
          localStorage.setItem("User", JSON.stringify(res.data.user));
          navigate("/");
          window.location.reload();
        }, 1000);
      }
    } catch (error) {
      if (error.response) {
        toast.error("Error: " + error.response.data.message);
      }
    } finally {
      setLoading(false);
    }
  };
  const handleGitHubLogIn = () => {
    window.location.href = "https://task-reminder-4sqz.onrender.com/user/auth/github";
  };

  const handleGoogleLogIn = () => {
    window.location.href = "https://task-reminder-4sqz.onrender.com/user/auth/google";
  };

  return (
    <div className="flex w-screen h-screen items-center justify-center py-3">
      <div id="my_modal_3" className="flex justify-center items-center">
        <div className="bg-[#FFFFFF2B] rounded-xl px-10 py-5 flex flex-col">
          <h3 className="font-bold text-center text-4xl pb-2">Login</h3>
          <div>
            <form
              action=""
              onSubmit={handleSubmit(onSubmit)}
              className="flex flex-col space-y-2"
            >
              <label className="text-xl pt-1">Email</label>
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full mt-1 p-2 border rounded-md outline-none"
                {...register("email", { required: true })}
              />
              {errors.email && (
                <span className="text-sm text-red-500">
                  This field is required!
                </span>
              )}

              <label className="text-xl pt-1">Password</label>
              <input
                type="password"
                placeholder="Enter your password"
                className="w-full mt-1 p-2 border rounded-md outline-none"
                {...register("password", { required: true })}
              />
              {errors.password && (
                <span className="text-sm text-red-500">
                  This field is required!
                </span>
              )}

              <div className="pt-4 flex flex-col gap-4 items-center">
                <button
                  className="bg-[#9D60EC] text-[#151025] py-3 text-lg mb-1 w-full rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 hover:bg-[#c095f8] duration-300 cursor-pointer"
                  type="submit"
                >
                  {loading ? "Logging..." : "Login"}
                </button>
              </div>
              <button
                type="button"
                onClick={handleGoogleLogIn}
                className="bg-white mb-3 flex items-center justify-center gap-3 text-gray-700 border border-gray-300 py-3 px-8 rounded-xl shadow-md hover:shadow-lg transform hover:scale-105 duration-300 cursor-pointer"
              >
                <FaGoogle size={20} className="text-[#EA4335]" />
                Login in with Google
              </button>

              <button
                type="button"
                onClick={handleGitHubLogIn}
                className="bg-[#151025] flex items-center justify-center gap-2 text-white py-3 px-8 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 duration-300 cursor-pointer"
              >
                <FaGithub size={20} />
                Login in with GitHub
              </button>
              <p className="mx-auto">
                Not registered?{" "}
                <span className="underline text-blue-500 cursor-pointer">
                  <Link to="/signup">Signup</Link>
                </span>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
