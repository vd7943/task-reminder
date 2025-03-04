import React from "react";
import { useAuth } from "../context/AuthProvider";
import { useForm, useFieldArray } from "react-hook-form";
import axios from "axios";
import toast from "react-hot-toast";
import "react-datepicker/dist/react-datepicker.css";
import { useNavigate } from "react-router-dom";

const AddPlan = () => {
  const [authUser, setAuthUser] = useAuth();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm();

  const { fields, append, remove } = useFieldArray({
    control,
    name: "tasks",
  });

  const onSubmit = async (data) => {
    const formattedTasks = data.tasks.map((task) => ({
      taskName: task.taskName,
      schedule: task.schedule.split(",").map((day) => ({
        day: parseInt(day.trim(), 10),
        time: "00:01",
      })),
    }));

    try {
      const response = await axios.post(
        "https://task-reminder-4sqz.onrender.com/plan/add-plan",
        {
          userId: authUser._id,
          userRole: authUser.role,
          planName: data.planName,
          tasks: formattedTasks,
        },
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      toast.success(response.data.message);
      setTimeout(() => {
        navigate("/pre-built-plans");
      }, 1000);
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className="flex flex-col h-full items-start pt-10 ml-[1%] md:pt-0 lg:ml-[9%] my-8">
      <h2 className="text-2xl lg:text-3xl">Add Plan</h2>
      <div className="flex flex-col bg-[#FFFFFF2B] items-center w-full justify-center p-8 rounded-lg lg:w-[700px] mx-auto mt-4 shadow-lg">
        <form
          action=""
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-3 w-full "
        >
          <label className="block font-medium text-lg">Plan Name:</label>
          <input
            type="text"
            className="w-full p-2 border rounded-md outline-none"
            placeholder="Enter plan name"
            {...register("planName", { required: true })}
          />
          <h3 className="text-lg font-medium">Tasks:</h3>
          {fields.map((field, index) => (
            <div key={field.id} className="p-4 bg-gray-800 rounded-md mb-3">
              <label className="block font-medium">Task Name:</label>
              <input
                type="text"
                className="w-full p-2 border rounded-md outline-none"
                placeholder="Enter task name"
                {...register(`tasks.${index}.taskName`, { required: true })}
              />
              <label className="block font-medium mt-2">
                Reminder Days (e.g., 1,3,5):
              </label>
              <input
                type="text"
                className="w-full p-2 border rounded-md outline-none"
                placeholder="Enter days"
                {...register(`tasks.${index}.schedule`, { required: true })}
              />

              <button
                type="button"
                onClick={() => remove(index)}
                className="mt-2 px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded-md"
              >
                Remove Task
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={() => append({ taskName: "", schedule: "" })}
            className="cursor-pointer mt-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md"
          >
            Add Task
          </button>

          <button
            type="submit"
            className="mt-4 px-4 py-2 bg-[#9D60EC] text-[#151025] text-lg rounded-md hover:shadow-xl transform hover:scale-101 hover:bg-[#c095f8] duration-300 cursor-pointer"
          >
            Save Plan
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddPlan;
