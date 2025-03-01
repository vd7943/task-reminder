import React, { useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const AddUser = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const navigate = useNavigate();

  const [selectedFile, setSelectedFile] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState("");

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
    if (!selectedFile) {
      toast.error("Please select a profile image.");
      return;
    }

    const formData = new FormData();
    formData.append("profileImage", selectedFile);
    formData.append("fullname", data.fullname);
    formData.append("email", data.email);
    formData.append("password", data.password);

    try {
      const res = await axios.post(
        "http://localhost:3000/user/signup",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      if (res.data) {
        toast.success("User added successfully!");
        setTimeout(() => {
          navigate("/user-list");
        }, 1000);
      }
    } catch (error) {
      if (error.response) {
        toast.error("Error: " + error.response.data.message);
      }
    }
  };
  return (
    <div className="flex flex-col h-screen lg:h-full pt-10 lg:pt-2 items-start ml-[2%] xl:ml-[11%] my-8">
      <h2 className="text-2xl lg:text-3xl">Add User</h2>
      <div className="flex flex-col bg-[#FFFFFF2B] items-start p-8 rounded-lg lg:w-[700px] mx-auto mt-4 shadow-lg">
        <form
          action=""
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-3 w-full "
        >
          <label className="text-xl py-1">Profile Image</label>
          <input
            type="file"
            className="w-full mt-1 p-2 border rounded-md outline-none"
            {...register("profileImage", { required: true })}
            onChange={handleFileChange}
          />
          <div className="flex items-center justify-center gap-3">
            <img
              src={
                profileImagePreview ? profileImagePreview : "./imageHolder.jpg"
              }
              alt="profileImagePreview"
              className="w-32"
            />
          </div>
          {errors.profileImage && (
            <span className="text-sm text-red-500">
              This field is required!
            </span>
          )}
          <label className="text-xl pt-1">Full Name</label>
          <input
            type="name"
            placeholder="Enter your fullname"
            className="w-full mt-1 p-2 border rounded-md outline-none"
            {...register("fullname", { required: true })}
          />
          {errors.fullname && (
            <span className="text-sm text-red-500">
              This field is required!
            </span>
          )}
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
              className="bg-[#9D60EC] text-[#151025] py-3 text-lg px-8 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 hover:bg-[#c095f8] duration-300 cursor-pointer"
              type="submit"
            >
              Add User
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddUser;
