import React from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthProvider";
import { useNavigate } from "react-router-dom";

const TaskReminder = () => {
  const [authUser, setAuthUser] = useAuth();
  const navigate = useNavigate();
  const userId = authUser._id;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    try {
      const response = await axios.post(
        "http://localhost:3000/task/task-reminder",
        { ...data, userId },
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      toast.success(response.data.message);
      setTimeout(() => {
        navigate("/task-list");
      }, 1000);
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className="flex flex-col pt-10 md:pt-0 h-screen md:h-full items-start ml-2 xl:ml-[10%] my-8">
      <h2 className="text-2xl lg:text-3xl">Task Reminder</h2>
      <div className="flex flex-col bg-[#FFFFFF2B] items-start p-8 rounded-lg lg:w-[700px] mx-auto mt-4 shadow-lg">
        <form
          action=""
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-3 w-full "
        >
          <label className="text-xl py-1">
            Task Name
            <input
              type="text"
              className="w-full mt-1 p-2 border rounded-md outline-none"
              {...register("taskName", { required: true })}
            />
          </label>

          <label className="text-xl py-1">
            Category
            <select
              className="w-full mt-1 p-2 border rounded-md outline-none"
              {...register("category", { required: true })}
            >
              <option value="" className="text-black">
                Select a category
              </option>
              <option value="Meeting" className="text-black">
                Meeting
              </option>
              <option value="Gym" className="text-black">
                Gym
              </option>
              <option value="Diet" className="text-black">
                Diet
              </option>
              <option value="Medical" className="text-black">
                Medical
              </option>
              <option value="Other" className="text-black">
                Other
              </option>
            </select>
          </label>

          <label className="text-xl py-1">
            Reminder Date & Time
            <input
              type="datetime-local"
              className="w-full mt-1 p-2 border rounded-md outline-none"
              {...register("reminderDateTime", { required: true })}
            />
          </label>

          <label className="text-xl py-1">
            Schedule Date & Time
            <input
              type="datetime-local"
              className="w-full mt-1 p-2 border rounded-md outline-none"
              {...register("scheduleDateTime", { required: true })}
            />
          </label>

          <label className="text-xl py-1">
            Task Duration (mins)
            <input
              type="number"
              className="w-full mt-1 p-2 border rounded-md outline-none"
              {...register("taskDuration", { required: true })}
            />
          </label>

          <label className="text-xl py-1">
            Task Description
            <textarea
              className="w-full mt-1 p-2 border rounded-md outline-none h-24"
              {...register("taskDescription", { required: true })}
            ></textarea>
          </label>
          <button
            type="submit"
            className="mt-4 py-2 bg-[#9D60EC] text-[#151025] text-lg rounded-md hover:shadow-xl transform hover:scale-101 hover:bg-[#c095f8] duration-300 cursor-pointer"
          >
            Add
          </button>
        </form>
      </div>
    </div>
  );
};

export default TaskReminder;
