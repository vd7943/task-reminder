import React from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import toast from "react-hot-toast";

const EmailTemplate = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    const formData = new FormData();
    formData.append("userType", data.userType);
    formData.append("subject", data.subject);
    formData.append("body", data.body);
    formData.append("taskLink", data.taskLink);

    try {
      const res = await axios.post(
        "http://localhost:3000/email/set-template",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      if (res.data) {
        toast.success(res.data.message);
        setTimeout(() => {
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
    <div className="flex flex-col h-screen lg:h-full pt-10 lg:pt-2 items-start ml-[2%] xl:ml-[11%] my-8">
      <h2 className="text-2xl lg:text-3xl">Set Email Template</h2>
      <div className="flex flex-col bg-[#FFFFFF2B] items-start p-8 rounded-lg lg:w-[700px] mx-auto mt-4 shadow-lg">
        <form
          action=""
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-3 w-full "
        >
          <label className="text-xl py-1">
            User Type
            <select
              className="w-full mt-1 p-2 border rounded-md outline-none"
              {...register("userType", { required: true })}
            >
              <option value="" className="text-black">
                Select user type
              </option>
              <option value="Custom" className="text-black">
                Custom
              </option>
              <option value="Manage" className="text-black">
                Manage
              </option>
            </select>
          </label>
          {errors.userType && (
            <span className="text-sm text-red-500">
              This field is required!
            </span>
          )}
          <label className="text-xl pt-1">Subject</label>
          <input
            type="text"
            placeholder="Enter your fullname"
            className="w-full mt-1 p-2 border rounded-md outline-none"
            {...register("subject", { required: true })}
          />
          {errors.subject && (
            <span className="text-sm text-red-500">
              This field is required!
            </span>
          )}
          <label className="text-xl pt-1">Body</label>
          <textarea
            rows={5}
            placeholder="Enter your email"
            className="w-full mt-1 p-2 border rounded-md outline-none"
            {...register("body", { required: true })}
          />
          {errors.body && (
            <span className="text-sm text-red-500">
              This field is required!
            </span>
          )}

          <label className="text-xl pt-1">Task Link</label>
          <input
            type="text"
            placeholder="Enter your password"
            className="w-full mt-1 p-2 border rounded-md outline-none"
            {...register("taskLink", { required: true })}
          />
          {errors.taskLink && (
            <span className="text-sm text-red-500">
              This field is required!
            </span>
          )}

          <div className="pt-4 flex flex-col gap-4 items-center">
            <button
              className="bg-[#9D60EC] text-[#151025] py-3 text-lg px-8 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 hover:bg-[#c095f8] duration-300 cursor-pointer"
              type="submit"
            >
              Add Template
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmailTemplate;
