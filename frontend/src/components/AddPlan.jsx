import React, { useState } from "react";
import { useAuth } from "../context/AuthProvider";
import { useForm, useFieldArray } from "react-hook-form";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const AddPlan = () => {
  const [authUser, setAuthUser] = useAuth();
  const navigate = useNavigate();
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [planStart, setPlanStart] = useState("today");
  const [newTask, setNewTask] = useState({
    taskName: "",
    taskDescription: "",
    taskLink: "",
    schedule: "",
    srNo: "",
  });
  const [newEmailTemplate, setNewEmailTemplate] = useState({
    subject: "",
    body: "",
  });

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm();

  const {
    fields: taskFields,
    append: appendTask,
    remove: removeTask,
  } = useFieldArray({
    control,
    name: "tasks",
  });

  const {
    fields: emailFields,
    append: appendEmail,
    remove: removeEmail,
  } = useFieldArray({
    control,
    name: "emailTemplates",
  });

  const createdBy = authUser.userType === "Custom" ? "Custom" : "Admin";

  const onSubmit = async (data) => {
    const formattedTasks = data.tasks.map((task) => ({
      taskName: task.taskName,
      taskDescription: task.taskDescription,
      taskLink: task.taskLink,
      srNo: parseInt(task.srNo, 10),
      schedule: task.schedule.split(",").map((day) => ({
        day: parseInt(day.trim(), 10),
        time: "00:01",
      })),
    }));

    try {
      await axios.post(
        "https://task-reminder-4sqz.onrender.com/plan/add-plan",
        {
          userId: authUser._id,
          userRole: authUser.role,
          planName: data.planName,
          planStart,
          tasks: formattedTasks,
        },
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      await Promise.all(
        data.emailTemplates.map((template) =>
          axios.post("https://task-reminder-4sqz.onrender.com/email/template/set-template", {
            planName: data.planName,
            createdBy,
            subject: template.subject,
            body: template.body,
          })
        )
      );

      toast.success("Plan and Email Templates saved successfully!");
      setTimeout(() => {
        navigate("/pre-built-plans");
      }, 1000);
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  };

  const handleAddTask = () => {
    if (!newTask.taskName || !newTask.schedule || !newTask.srNo) {
      toast.error("Task Name, Sr No., and Reminder Days are required");
      return;
    }
    appendTask(newTask);
    setNewTask({
      taskName: "",
      taskDescription: "",
      taskLink: "",
      schedule: "",
      srNo: "",
    });
    setIsTaskModalOpen(false);
  };

  const handleAddEmailTemplate = () => {
    if (!newEmailTemplate.subject || !newEmailTemplate.body) {
      toast.error("Subject and Body are required for email templates");
      return;
    }

    appendEmail(newEmailTemplate);
    setNewEmailTemplate({ subject: "", body: "" });
    setIsEmailModalOpen(false);
  };

  return (
    <div className="flex flex-col h-full items-start pt-10 mx-auto md:pt-0 lg:ml-[10%] my-8">
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

          <label className="block font-medium text-lg">Start Plan From:</label>
          <select
            className="w-full p-2 border rounded-md"
            value={planStart}
            onChange={(e) => setPlanStart(e.target.value)}
          >
            <option value="today" className="text-black">
              Today
            </option>
            <option value="tomorrow" className="text-black">
              Tomorrow
            </option>
          </select>

          <h3 className="text-lg font-medium">Tasks:</h3>
          {taskFields.map((field, index) => (
            <div
              key={field.id}
              className="p-2 bg-gray-800 rounded-md mb-2 text-white"
            >
              <span>{field.taskName}</span>
              <button
                type="button"
                onClick={() => removeTask(index)}
                className="ml-4 text-red-500 cursor-pointer"
              >
                Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => setIsTaskModalOpen(true)}
            className="mt-4 px-4 py-2 cursor-pointer bg-blue-500 text-white rounded-md hover:shadow-xl transform hover:scale-102 hover:bg-blue-600 duration-300"
          >
            Add Task
          </button>

          {/* add email template */}
          <h3 className="text-lg font-medium mt-6">Add Email Templates:</h3>
          {emailFields.map((field, index) => (
            <div
              key={field.id}
              className="bg-gray-800 p-4 rounded-md text-white mb-2"
            >
              <span>{field.subject}</span>
              <button
                type="button"
                onClick={() => removeEmail(index)}
                className="ml-4 text-red-500 cursor-pointer"
              >
                Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => setIsEmailModalOpen(true)}
            className="mt-2 px-4 py-2 bg-green-500 text-white rounded-md hover:shadow-xl transform hover:scale-102 hover:bg-green-600 duration-300 cursor-pointer"
          >
            Add Email Template
          </button>
          <button
            type="submit"
            className="mt-4 px-4 py-2 bg-[#9D60EC] text-[#151025] cursor-pointer text-lg rounded-md hover:shadow-xl transform hover:scale-102 hover:bg-[#c095f8] duration-300"
          >
            Save Plan
          </button>
        </form>
      </div>

      {isTaskModalOpen && (
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
            <label>Sr No.:</label>
            <input
              type="number"
              className="w-full p-2 border rounded-md my-2"
              value={newTask.srNo}
              onChange={(e) => setNewTask({ ...newTask, srNo: e.target.value })}
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
                onClick={() => setIsTaskModalOpen(false)}
                className="bg-red-500 text-white cursor-pointer px-4 py-2 rounded-md"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {isEmailModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-opacity-50 backdrop-blur-lg z-50">
          <div className="p-6 rounded-2xl shadow-xl w-96 bg-gray-800 text-white">
            <h2 className="text-2xl font-bold mb-4 text-center">
              Add Email Template
            </h2>
            <label className="text-lg">Subject</label>
            <input
              type="text"
              placeholder="Enter the subject"
              className="w-full p-2 border rounded-md my-4"
              value={newEmailTemplate.subject}
              onChange={(e) =>
                setNewEmailTemplate({
                  ...newEmailTemplate,
                  subject: e.target.value,
                })
              }
            />
            <label className="text-lg">Body</label>
            <textarea
              placeholder="Enter the body"
              className="w-full p-2 border rounded-md my-2"
              value={newEmailTemplate.body}
              onChange={(e) =>
                setNewEmailTemplate({
                  ...newEmailTemplate,
                  body: e.target.value,
                })
              }
            />
            <div className="mt-2 flex justify-between">
              <button
                onClick={handleAddEmailTemplate}
                className="bg-green-500 text-white px-4 py-2 rounded-md mt-2 cursor-pointer"
              >
                Save Email Template
              </button>
              <button
                onClick={() => setIsEmailModalOpen(false)}
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
