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
  const [isMilestoneModalOpen, setIsMilestoneModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [addBelowIndex, setAddBelowIndex] = useState(null);
  const [newTask, setNewTask] = useState({
    taskName: "",
    taskDescription: "",
    taskLink: "",
    schedule: "",
    srNo: 0,
    days: "0,",
  });
  const [newEmailTemplate, setNewEmailTemplate] = useState({
    subject: "",
    body: "",
  });

  const [newMilestone, setNewMilestone] = useState({
    milestoneName: "",
    startTask: "",
    endTask: "",
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
    insert: insertTask,
    remove: removeTask,
    update: updateTask,
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

  const {
    fields: milestoneFields,
    append: appendMilestone,
    remove: removeMilestone,
  } = useFieldArray({
    control,
    name: "milestones",
  });

  const createdBy = authUser.userType === "Custom" ? "Custom" : "Admin";

  const validateDays = (days) => {
    const trimmedDays = days.trim();

    // Ensure days start with "0,"
    if (!trimmedDays.startsWith("0,")) {
      toast.error("Days must start with '0,'");
      return false;
    }

    // Prevent consecutive commas
    if (/,,/.test(trimmedDays)) {
      toast.error("Days cannot have consecutive commas.");
      return false;
    }

    // Split and validate each day value
    const daysArray = trimmedDays.split(",").map((d) => d.trim());

    for (let day of daysArray) {
      if (day === "" || isNaN(day)) {
        toast.error("Invalid format: No empty or non-numeric values allowed.");
        return false;
      }
    }

    return true;
  };

  const renumberTasks = () => {
    taskFields.forEach((task, index) => {
      updateTask(index, { ...task, srNo: index });
    });
  };

  const handleAddTask = () => {
    if (!newTask.taskName || !newTask.days) {
      toast.error("Task Name and Days are required!");
      return;
    }

    if (!validateDays(newTask.days)) return;

    if (editingIndex !== null) {
      // Update existing task
      updateTask(editingIndex, { ...newTask });
      setEditingIndex(null);
    } else if (addBelowIndex !== null) {
      // Handle Add Task Below logic
      const newSrNo = addBelowIndex + 1;

      // Insert the new task with updated Sr No.
      insertTask(newSrNo, {
        ...newTask,
        srNo: newSrNo,
      });

      // Increment Sr No. of all subsequent tasks
      for (let i = newSrNo + 1; i < taskFields.length + 1; i++) {
        updateTask(i, { ...taskFields[i - 1], srNo: i });
      }

      setAddBelowIndex(null);
    } else {
      // Add a new task at the end
      appendTask({
        ...newTask,
        srNo: taskFields.length,
      });
    }

    renumberTasks();
    setIsTaskModalOpen(false);

    // ✅ Reset newTask state
    setNewTask({
      taskName: "",
      taskDescription: "",
      taskLink: "",
      srNo: taskFields.length,
      days: "0,", // Ensure days start with 0,
    });
  };

  const handleAddTaskBelow = (index) => {
    setNewTask({
      taskName: "",
      taskDescription: "",
      taskLink: "",
      srNo: index + 1,
      days: "0,",
    });

    setAddBelowIndex(index);
    setIsTaskModalOpen(true);
  };

  const handleEditTask = (index) => {
    const task = taskFields[index];
    setNewTask(task);
    setEditingIndex(index);
    setIsTaskModalOpen(true);
  };

  const handleAddEmailTemplate = () => {
    if (!newEmailTemplate.subject || !newEmailTemplate.body) {
      toast.error("Subject and Body are required for email templates");
      return;
    }

    if (editingIndex !== null) {
      updateEmail(editingIndex, newEmailTemplate);
      setEditingIndex(null);
    } else {
      appendEmail(newEmailTemplate);
    }

    setNewEmailTemplate({ subject: "", body: "" });
    setIsEmailModalOpen(false);
  };

  const handleEditEmailTemplate = (index) => {
    const email = emailFields[index];
    setNewEmailTemplate(email);
    setEditingIndex(index);
    setIsEmailModalOpen(true);
  };

  const handleAddMilestone = () => {
    if (
      !newMilestone.milestoneName ||
      !newMilestone.startTask ||
      !newMilestone.endTask
    ) {
      toast.error("Milestone name, start, and end tasks are required!");
      return;
    }

    if (editingIndex !== null) {
      updateMilestone(editingIndex, newMilestone);
      setEditingIndex(null);
    } else {
      appendMilestone(newMilestone);
    }

    setNewMilestone({ milestoneName: "", startTask: "", endTask: "" });
    setIsMilestoneModalOpen(false);
  };

  const handleEditMilestone = (index) => {
    const milestone = milestoneFields[index];
    setNewMilestone(milestone);
    setEditingIndex(index);
    setIsMilestoneModalOpen(true);
  };

  const onSubmit = async (data) => {
    if (emailFields.length === 0) {
      toast.error(
        "Please add at least one email template before saving the plan."
      );
      return;
    }

    const formattedTasks = taskFields.map((task, index) => ({
      ...task,
      srNo: index,
    }));

    try {
      await axios.post("https://task-reminder-4sqz.onrender.com/plan/add-plan", {
        userId: authUser._id,
        userRole: authUser.role,
        planName: data.planName,
        tasks: formattedTasks,
        emailTemplates: data.emailTemplates,
        milestones: data.milestones,
      });

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

      toast.success(
        "Plan, Email Templates, and Milestones saved successfully!"
      );
      setTimeout(() => {
        navigate("/plan-list");
      }, 1000);
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className="flex flex-col h-full items-start pt-10 mx-auto md:pt-0 lg:ml-[10%] my-8">
      <h2 className="text-2xl lg:text-3xl">Add Plan</h2>
      <div className="flex flex-col bg-[#FFFFFF2B] items-center w-screen justify-center p-8 rounded-lg lg:w-[700px] lg:mx-auto mt-4 shadow-lg">
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
          {taskFields.map((task, index) => (
            <div
              key={task.id}
              className="bg-gray-800 text-white p-4 rounded-md mb-4"
            >
              <p>
                <strong>{task.taskName}</strong>
              </p>
              <p>
                Sr No.: {task.srNo} | Days: {task.days}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => handleEditTask(index)}
                  className="text-blue-400"
                >
                  Edit
                </button>
                <button
                  onClick={() => removeTask(index)}
                  className="text-red-400"
                >
                  Remove
                </button>
                <button
                  onClick={() => handleAddTaskBelow(index)}
                  className="text-green-400"
                >
                  + Add Task Below
                </button>
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={() => {
              setNewTask({
                taskName: "",
                taskDescription: "",
                taskLink: "",
                srNo: taskFields.length,
                days: "0,",
              });
              setIsTaskModalOpen(true);
            }}
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
              <div className="flex gap-3">
                <button
                  onClick={() => handleEditEmailTemplate(index)}
                  className="text-blue-400"
                >
                  Edit
                </button>
                <button
                  onClick={() => removeEmail(index)}
                  className="text-red-400"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={() => setIsEmailModalOpen(true)}
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:shadow-xl transform hover:scale-102 hover:bg-green-600 duration-300 cursor-pointer"
          >
            Add Email Template
          </button>

          <h3 className="text-lg font-medium mt-6">Milestones:</h3>
          {milestoneFields.map((milestone, index) => (
            <div
              key={milestone.id}
              className="bg-gray-800 p-4 rounded-md mb-2 text-white"
            >
              <div className="flex justify-between items-center">
                <div>
                  <p>
                    <strong>{milestone.milestoneName}</strong>
                  </p>
                  <p>
                    Task {milestone.startTask} → Task {milestone.endTask}
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => handleEditMilestone(index)}
                    className="text-blue-400"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => removeMilestone(index)}
                    className="text-red-400"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={() => setIsMilestoneModalOpen(true)}
            className="mt-4 cursor-pointer px-4 py-2 bg-blue-500 text-white rounded-md"
          >
            Add Milestone
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
              placeholder="Task Name"
              value={newTask.taskName}
              onChange={(e) =>
                setNewTask({ ...newTask, taskName: e.target.value })
              }
              className="w-full p-2 border rounded-md my-2"
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
              value={newTask.days}
              onChange={(e) => setNewTask({ ...newTask, days: e.target.value })}
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

      {isMilestoneModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-[#FFFFFF2B] bg-opacity-50 backdrop-blur-lg z-50">
          <div className="p-6 rounded-2xl shadow-xl w-96 bg-gray-800 text-white relative animate-fadeInUp border border-gray-700">
            <h2 className="text-2xl font-bold mb-4 text-center">
              Add Milestone
            </h2>

            <label>Milestone Name:</label>
            <input
              type="text"
              className="w-full p-2 border rounded-md my-2"
              value={newMilestone.milestoneName}
              onChange={(e) =>
                setNewMilestone({
                  ...newMilestone,
                  milestoneName: e.target.value,
                })
              }
            />

            <label>Start Task (Task No.):</label>
            <input
              type="number"
              className="w-full p-2 border rounded-md my-2"
              value={newMilestone.startTask}
              onChange={(e) =>
                setNewMilestone({ ...newMilestone, startTask: e.target.value })
              }
            />

            <label>End Task (Task No.):</label>
            <input
              type="number"
              className="w-full p-2 border rounded-md my-2"
              value={newMilestone.endTask}
              onChange={(e) =>
                setNewMilestone({ ...newMilestone, endTask: e.target.value })
              }
            />

            <div className="mt-4 flex justify-between">
              <button
                onClick={handleAddMilestone}
                className="bg-green-500 text-white cursor-pointer px-4 py-2 rounded-md"
              >
                Save Milestone
              </button>

              <button
                onClick={() => setIsMilestoneModalOpen(false)}
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
