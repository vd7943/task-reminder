import React, { useState } from "react";
import { useAuth } from "../context/AuthProvider";
import { useForm, useFieldArray } from "react-hook-form";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const AddPlan = () => {
  const [authUser, setAuthUser] = useAuth();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTask, setNewTask] = useState({
    taskName: "",
    taskDescription: "",
    taskLink: "",
    schedule: "",
  });

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
      taskDescription: task.taskDescription,
      taskLink: task.taskLink,
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

  const handleAddTask = () => {
    if (!newTask.taskName || !newTask.schedule) {
      toast.error("Task Name and Reminder Days are required");
      return;
    }
    append(newTask);
    setNewTask({
      taskName: "",
      taskDescription: "",
      taskLink: "",
      schedule: "",
    });
    setIsModalOpen(false);
  };

  return (
    <div className="flex flex-col h-full items-start pt-10 ml-[1%] md:pt-0 lg:ml-[10%] my-8">
      <h2 className="text-2xl lg:text-3xl">Add Plan</h2>
      <div className="flex flex-col bg-[#FFFFFF2B] items-center w-full justify-center p-8 rounded-lg lg:w-[700px] mx-auto mt-4 shadow-lg">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-3 w-full"
        >
          <label className="block font-medium text-lg">Plan Name:</label>
          <input
            type="text"
            className="w-full p-2 border rounded-md"
            placeholder="Enter plan name"
            {...register("planName", { required: true })}
          />
          <h3 className="text-lg font-medium">Tasks:</h3>
          {fields.map((field, index) => (
            <div
              key={field.id}
              className="p-2 bg-gray-800 rounded-md mb-2 text-white"
            >
              <span>{field.taskName}</span>
              <button
                type="button"
                onClick={() => remove(index)}
                className="ml-4 text-red-500 cursor-pointer"
              >
                Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="mt-4 px-4 py-2 cursor-pointer bg-blue-500 text-white rounded-md hover:shadow-xl transform hover:scale-102 hover:bg-blue-600 duration-300"
          >
            Add Task
          </button>
          <button
            type="submit"
            className="mt-4 px-4 py-2 bg-[#9D60EC] text-[#151025] cursor-pointer text-lg rounded-md hover:shadow-xl transform hover:scale-102 hover:bg-[#c095f8] duration-300"
          >
            Save Plan
          </button>
        </form>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-[#FFFFFF2B] bg-opacity-50 backdrop-blur-lg z-50">
          <div className="p-6 rounded-2xl shadow-xl w-96 bg-gray-800 text-white relative animate-fadeInUp border border-gray-700">
            <h2 className="text-2xl font-bold mb-4 text-center">Add Task</h2>
            <label>Task Name:</label>
            <input
              type="text"
              className="w-full p-2 border rounded-md my-2"
              value={newTask.taskName}
              onChange={(e) =>
                setNewTask({ ...newTask, taskName: e.target.value })
              }
            />
            <label>Task Description:</label>
            <input
              type="text"
              className="w-full p-2 border rounded-md my-2"
              value={newTask.taskDescription}
              onChange={(e) =>
                setNewTask({ ...newTask, taskDescription: e.target.value })
              }
            />
            <label>Task Link:</label>
            <input
              type="text"
              className="w-full p-2 border rounded-md my-2"
              value={newTask.taskLink}
              onChange={(e) =>
                setNewTask({ ...newTask, taskLink: e.target.value })
              }
            />
            <label>Task Days (e.g., 1,3,5):</label>
            <input
              type="text"
              className="w-full p-2 border rounded-md my-2"
              value={newTask.schedule}
              onChange={(e) =>
                setNewTask({ ...newTask, schedule: e.target.value })
              }
            />
            <div className="mt-4 flex justify-between">
              <button
                onClick={handleAddTask}
                className="bg-green-500 text-white cursor-pointer px-4 py-2 rounded-md"
              >
                Save Task
              </button>
              <button
                onClick={() => setIsModalOpen(false)}
                className="bg-red-500 text-white cursor-pointer px-4 py-2 rounded-md"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddPlan;
