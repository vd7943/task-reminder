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
  const [userTypes, setUserTypes] = useState([]);

  const fetchUserTypes = async () => {
    try {
      const response = await axios.get(
        "https://task-reminder-4sqz.onrender.com/config/get-user-type"
      );
      setUserTypes(response.data.userTypes || []);
    } catch (error) {
      console.error("Failed to fetch user types.");
    }
  };

  useEffect(() => {
    fetchUserTypes();
  }, []);

  const RegularType = userTypes[0];
  const CustomType = userTypes[1];
  const ManageType = userTypes[2];

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
            {(authUser.userType === CustomType ||
              authUser.userType === ManageType) && (
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
      </div>
    </div>
  );
};

export default Setting;
