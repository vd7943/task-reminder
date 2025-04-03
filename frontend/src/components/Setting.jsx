import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useAuth } from "../context/AuthProvider";
import toast from "react-hot-toast";
import axios from "axios";
import { FaEdit } from "react-icons/fa";

const Setting = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm();

  const [selectedFile, setSelectedFile] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState("");
  const [authUser, setAuthUser] = useAuth();
  const [timeLeft, setTimeLeft] = useState(null);
  const [subscription, setSubscription] = useState(null);

  useEffect(() => {
    axios
      .get(`https://task-reminder-4sqz.onrender.com/user/${authUser?._id}`, {
        withCredentials: true,
      })
      .then((response) => {
        if (response?.data?.user?.subscriptionEndDate) {
          setSubscription(response?.data?.user?.subscriptionEndDate);
        }
      })
      .catch((error) => console.error(error));
  }, []);

  const calculateTimeLeft = (subscription) => {
    if (!subscription) {
      setTimeLeft("Plz subscribe !");
      return;
    }
    const expiryDate = new Date(subscription);
    expiryDate.setHours(expiryDate.getHours() - 5);
    expiryDate.setMinutes(expiryDate.getMinutes() - 30);

    const now = new Date();
    const timeLeftMs = expiryDate - now;

    if (timeLeftMs <= 0) {
      setTimeLeft("Plz subscribe !");
      return;
    }

    const days = Math.floor(timeLeftMs / (1000 * 60 * 60 * 24));
    setTimeLeft(`${days} Days !`);
  };

  useEffect(() => {
    if (subscription) {
      calculateTimeLeft(subscription);
    }
  }, [subscription]);

  const subscriptionEndDate = subscription ? new Date(subscription) : null;

  if (subscriptionEndDate) {
    subscriptionEndDate.setHours(subscriptionEndDate.getHours() - 5);
    subscriptionEndDate.setMinutes(subscriptionEndDate.getMinutes() - 30);
  }

  useEffect(() => {
    if (authUser) {
      setValue("fullname", authUser.fullname);
      setValue("email", authUser.email);
      setValue("emailTime", authUser.emailTime);
      setProfileImagePreview(authUser.profileImage?.url || "");
    }
  }, [authUser, setValue]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      setProfileImagePreview(reader.result);
      setSelectedFile(file);
    };
  };

  const onSubmit = async (data) => {
    const formData = new FormData();
    if (selectedFile) {
      formData.append("profileImage", selectedFile);
    }
    if (data.fullname) {
      formData.append("fullname", data.fullname);
    }
    if (data.email) {
      formData.append("email", data.email);
    }
    if (data.password) {
      formData.append("password", data.password);
    }
    if (data.emailTime) {
      formData.append("emailTime", data.emailTime);
    }

    try {
      const res = await axios.put(
        `https://task-reminder-4sqz.onrender.com/user/edit/${authUser._id}`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      if (res.data) {
        toast.success(res.data.message);
        setTimeout(() => {
          localStorage.setItem("User", JSON.stringify(res.data.user));
          window.location.reload();
        }, 1000);
      }
    } catch (error) {
      if (error.response) {
        toast.error("Error: " + error.response.data.message);
      }
    }
  };
  return (
    <div className="flex flex-col h-full pt-10 md:pt-0 lg:items-start md:ml-4 xl:ml-[10%] my-8">
      <h2 className="text-3xl text-center mt-4 lg:mt-0 lg:text-3xl">
        Edit Profile
      </h2>
      <div className="flex flex-col bg-[#FFFFFF2B] items-start p-8 rounded-lg w-105 lg:w-[700px] mx-auto mt-3 shadow-2xl">
        <form
          action=""
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-6 w-full"
        >
          <div className="relative flex justify-center items-center">
            <img
              src={profileImagePreview || authUser?.profileImage?.url}
              alt="profileImagePreview"
              className="w-46 h-46 object-cover rounded-full border-4 border-[#9D60EC]"
            />
            <FaEdit
              className="absolute text-gray-300 bottom-0 right-0 lg:right-[35%] text-4xl cursor-pointer rounded-full p-2"
              onClick={() => document.getElementById("file-input").click()}
            />
          </div>

          <input
            id="file-input"
            type="file"
            className="hidden"
            {...register("profileImage")}
            onChange={handleFileChange}
          />

          <div className="flex flex-col gap-3">
            <label className="text-lg">Full Name</label>
            <input
              type="text"
              placeholder="Enter your fullname"
              className="w-full p-3 rounded-lg border-2 border-[#D0D0D0] focus:border-[#9D60EC] outline-none transition duration-300"
              {...register("fullname")}
            />

            <label className="text-lg">Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full p-3 rounded-lg border-2 border-[#D0D0D0] focus:border-[#9D60EC] outline-none transition duration-300"
              {...register("email")}
            />

            <label className="text-lg">Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              className="w-full p-3 rounded-lg border-2 border-[#D0D0D0] focus:border-[#9D60EC] outline-none transition duration-300"
              {...register("password")}
            />
            {(authUser.userType === "Custom" ||
              authUser.userType === "Manage") && (
              <>
                <label className="text-lg">Preferred Email Time</label>
                <input
                  type="time"
                  className="w-full p-3 rounded-lg border-2 border-[#D0D0D0] focus:border-[#9D60EC] outline-none transition duration-300"
                  {...register("emailTime")}
                />
              </>
            )}
          </div>

          <div className="pt-6 flex justify-center">
            <button
              className="bg-[#9D60EC] text-white cursor-pointer py-3 px-8 rounded-lg shadow-lg hover:shadow-2xl transform hover:scale-105 hover:bg-[#c095f8] duration-300"
              type="submit"
            >
              Update Profile
            </button>
          </div>
        </form>
        {authUser.role === "User" && (
          <div className="mt-8 lg:mt-6 w-full flex flex-col items-center">
            <div className="bg-gradient-to-r from-[#9D60EC] to-[#BE1966] p-6 rounded-lg shadow-lg text-white w-full max-w-md text-center">
              <h4 className="text-lg font-semibold">📅 Subscription Details</h4>
              <div className="mt-3 flex flex-col gap-2">
                <div className="flex justify-between items-center border-b border-white pb-2">
                  <span className="text-md font-medium">
                    Subscription Ends In:
                  </span>
                  <span
                    className={`text-lg font-bold ${
                      timeLeft?.includes("Plz subscribe")
                        ? "text-red-500"
                        : "text-green-400"
                    }`}
                  >
                    {authUser.userType === "Regular"
                      ? "Plz Subscribe!"
                      : timeLeft}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-md font-medium">
                    Subscription End Date:
                  </span>
                  <span className="text-lg font-bold text-yellow-300">
                    {subscriptionEndDate
                      ? new Date(subscriptionEndDate).toDateString()
                      : "N/A"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Setting;
