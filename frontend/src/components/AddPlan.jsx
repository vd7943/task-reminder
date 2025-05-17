import React, { useState } from "react";
import { useAuth } from "../context/AuthProvider";
import { useForm, useFieldArray } from "react-hook-form";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { IoArrowUpCircleOutline } from "react-icons/io5";

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
    coinsEarned: 1,
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
    setValue,
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
    update: updateEmail,
  } = useFieldArray({
    control,
    name: "emailTemplates",
  });

  const {
    fields: milestoneFields,
    append: appendMilestone,
    remove: removeMilestone,
    update: updateMilestone,
  } = useFieldArray({
    control,
    name: "milestones",
  });

  const createdBy = authUser.userType === "Custom" ? "Custom" : "Admin";

  const validateDays = (days) => {
    const trimmedDays = days.trim();

    if (!trimmedDays.startsWith("0")) {
      toast.error("Days must start with '0'");
      return false;
    }

    if (/,,/.test(trimmedDays)) {
      toast.error("Days cannot have consecutive commas.");
      return false;
    }

    const daysArray = trimmedDays.split(",").map((d) => d.trim());

    for (let day of daysArray) {
      if (day === "" || isNaN(day)) {
        toast.error("Invalid format: No empty or non-numeric values allowed.");
        return false;
      }
    }

    return true;
  };

  const handleAddTask = (e) => {
    e.preventDefault();

    if (!newTask.taskName || !newTask.days) {
      toast.error("Task Name and Days are required!");
      return;
    }

    if (newTask.taskLink) {
      try {
        new URL(newTask.taskLink);
      } catch {
        toast.error("Please enter a valid URL in Task Link.");
        return;
      }
    }

    if (!validateDays(newTask.days)) return;

    let daysArray = newTask.days.split(",").map(Number);
    let uniqueDays = [...new Set(daysArray)].sort((a, b) => a - b);

    if (daysArray.length !== uniqueDays.length) {
      toast.error("Duplicate days are not allowed in Reminding Days.");
      return;
    }

    const updatedTask = {
      ...newTask,
      days: uniqueDays.join(","),
    };

    if (editingIndex !== null) {
      updateTask(editingIndex, updatedTask);
      setEditingIndex(null);
    } else if (addBelowIndex !== null) {
      const newSrNo = taskFields[addBelowIndex].srNo + 1;
      const updatedTaskWithSrNo = { ...updatedTask, srNo: newSrNo };

      insertTask(addBelowIndex + 1, updatedTaskWithSrNo);

      for (let i = addBelowIndex + 1; i < taskFields.length; i++) {
        updateTask(i + 1, { ...taskFields[i], srNo: taskFields[i].srNo + 1 });
      }

      setAddBelowIndex(null);
    } else {
      appendTask({
        ...updatedTask,
        coinsEarned: updatedTask.coinsEarned ?? 1,
      });
    }

    setIsTaskModalOpen(false);
    setNewTask({
      taskName: "",
      taskDescription: "",
      taskLink: "",
      srNo: taskFields.length + 1,
      days: "0,",
      coinsEarned: 1,
    });
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.type !== "application/json" && !file.name.endsWith(".json")) {
      toast.error("Only JSON files are allowed!");
      event.target.value = null;
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const jsonData = JSON.parse(e.target.result);

        const { planName, tasks, emailTemplates, milestones } = jsonData;

        if (
          typeof planName !== "string" ||
          !Array.isArray(tasks) ||
          !Array.isArray(emailTemplates) ||
          !Array.isArray(milestones)
        ) {
          toast.error("JSON format is invalid or missing required fields.");
          return;
        }

        setValue("planName", planName);

        removeTask();
        removeEmail();
        removeMilestone();

        tasks.forEach((task) => {
          appendTask({
            ...task,
            coinsEarned: task.coinsEarned ?? 1,
          });
        });
        emailTemplates.forEach((email) => appendEmail(email));
        milestones.forEach((milestone) => appendMilestone(milestone));

        toast.success("Data successfully loaded from JSON file!");
      } catch (error) {
        toast.error("Invalid JSON format");
      }
    };

    reader.readAsText(file);
  };

  const handleAddTaskBelow = (index) => {
    setNewTask({
      taskName: "",
      taskDescription: "",
      taskLink: "",
      srNo: taskFields[index].srNo + 1,
      days: "0,",
      coinsEarned: 1,
    });

    setAddBelowIndex(index);
    setIsTaskModalOpen(true);
  };

  const handleEditTask = (index) => {
    let task = taskFields[index];

    let daysArray = task.days.split(",").map(Number);
    let uniqueDays = [...new Set(daysArray)].sort((a, b) => a - b);

    if (daysArray.length !== uniqueDays.length) {
      toast.error("Duplicate days are not allowed in Reminding Days.");
      return;
    }

    setNewTask({
      ...task,
      days: uniqueDays.join(","),
    });

    setEditingIndex(index);
    setIsTaskModalOpen(true);
  };

  const handleRemoveTask = (index) => {
    removeTask(index);

    for (let i = index; i < taskFields.length - 1; i++) {
      updateTask(i, { ...taskFields[i + 1], srNo: taskFields[i + 1].srNo - 1 });
    }
  };

  const handleAddEmailTemplate = () => {
    if (!newEmailTemplate.subject || !newEmailTemplate.body) {
      toast.error("Subject and Body are required!");
      return;
    }

    const formattedTemplate = {
      subject: newEmailTemplate.subject,
      body: newEmailTemplate.body,
    };

    if (editingIndex !== null) {
      updateEmail(editingIndex, formattedTemplate);
    } else {
      appendEmail(formattedTemplate);
    }

    setNewEmailTemplate({ subject: "", body: "" });
    setEditingIndex(null);
    setIsEmailModalOpen(false);
  };

  const handleEditEmailTemplate = (index) => {
    const email = emailFields[index];
    if (!email) {
      toast.error("Error: Email template not found!");
      return;
    }

    setNewEmailTemplate({ ...email });
    setEditingIndex(index);
    setIsEmailModalOpen(true);
  };

  const handleAddMilestone = () => {
    const { milestoneName, startTaskSrNo, endTaskSrNo } = newMilestone;

    if (!milestoneName || startTaskSrNo === "" || endTaskSrNo === "") {
      toast.error("Please fill in all fields");
      return;
    }

    if (Number(endTaskSrNo) < Number(startTaskSrNo)) {
      toast.error(
        "End Task Sr No. must be greater than or equal to Start Task Sr No."
      );
      return;
    }

    if (editingIndex !== null) {
      updateMilestone(editingIndex, { ...newMilestone });
      setEditingIndex(null);
    } else {
      appendMilestone({ ...newMilestone });
    }

    setNewMilestone({ milestoneName: "", startTaskSrNo: "", endTaskSrNo: "" });
    setIsMilestoneModalOpen(false);
  };

  const handleEditMilestone = (index) => {
    const milestone = milestoneFields[index];
    setNewMilestone({
      milestoneName: milestone.milestoneName,
      startTaskSrNo: milestone.startTaskSrNo,
      endTaskSrNo: milestone.endTaskSrNo,
    });
    setEditingIndex(index);
    setIsMilestoneModalOpen(true);
  };

  const onSubmit = async (data) => {
    if (!editingIndex && emailFields.length === 0) {
      toast.error(
        "Please add at least one email template before saving the plan."
      );
      return;
    }

    const formattedTasks = taskFields.map((task) => ({
      ...task,
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
        <div className="mb-4">
          <label className="block mb-2 text-center text-lg font-semibold">
            Upload JSON File
          </label>
          <div className="relative flex items-center justify-center border border-dashed border-gray-200 p-4 rounded-lg cursor-pointer hover:bg-gray-100 hover:text-gray-600 transition">
            <IoArrowUpCircleOutline className="text-gray-400 w-6 h-6 mr-2" />
            <input
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
            <span className="text-gray-400">Click or drag to upload</span>
          </div>
        </div>
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
                Sr No.: {task.srNo} | Days: {task.days} | Coins:{" "}
                {task.coinsEarned}
              </p>
              <div className="flex justify-between">
                <div>
                  <button
                    type="button"
                    onClick={() => handleEditTask(index)}
                    className="text-blue-400 cursor-pointer"
                  >
                    Edit
                  </button>
                </div>
                <div>
                  <button
                    type="button"
                    onClick={() => handleAddTaskBelow(index)}
                    className="text-green-400 cursor-pointer"
                  >
                    + Add Task Below
                  </button>
                </div>
                <div>
                  <button
                    type="button"
                    onClick={() => handleRemoveTask(index)}
                    className="text-red-400 cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
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

          <h3 className="text-lg font-medium mt-6">Add Email Templates:</h3>
          {emailFields.map((field, index) => (
            <div
              key={field.id}
              className="bg-gray-900 p-6 rounded-lg text-white shadow-md border border-gray-700 mb-4 w-full mx-auto"
            >
              <p className="text-lg font-semibold text-blue-300 mb-2">
                {field.subject}
              </p>

              <p className="text-sm text-gray-200 whitespace-pre-wrap">
                {field.body}
              </p>

              <div className="flex justify-end gap-4 mt-4">
                <button
                  type="button"
                  onClick={() => handleEditEmailTemplate(index)}
                  className="px-4 py-1 cursor-pointer text-sm bg-blue-600 hover:bg-blue-500 text-white rounded-md"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => removeEmail(index)}
                  className="px-4 py-1 cursor-pointer text-sm bg-red-600 hover:bg-red-500 text-white rounded-md"
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
                    Sr No. {milestone.startTaskSrNo} → Sr No.{" "}
                    {milestone.endTaskSrNo}
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => handleEditMilestone(index)}
                    className="text-blue-400 cursor-pointer"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => removeMilestone(index)}
                    className="text-red-400 cursor-pointer"
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
              value={newTask.srNo === "" ? "" : newTask.srNo}
              onChange={(e) => {
                let value = e.target.value;

                if (value === "") {
                  setNewTask({ ...newTask, srNo: "" });
                  return;
                }

                let numValue = Number(value);

                if (numValue < 0) {
                  toast.error("Sr No. must be 0 or greater.");
                  return;
                }

                setNewTask({ ...newTask, srNo: numValue });
              }}
              onBlur={() => {
                let finalValue = newTask.srNo === "" ? 0 : newTask.srNo;

                let isSrNoDuplicate = taskFields.some(
                  (t, i) => t.srNo === finalValue && i !== editingIndex
                );

                if (isSrNoDuplicate) {
                  toast.error(
                    `Sr No. ${finalValue} already exists! Choose a different one.`
                  );
                  finalValue = taskFields[editingIndex].srNo;
                }

                setNewTask({ ...newTask, srNo: finalValue });
              }}
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
              type="url"
              className="w-full p-2 border rounded-md my-2"
              value={newTask.taskLink}
              onChange={(e) =>
                setNewTask({ ...newTask, taskLink: e.target.value })
              }
            />

            <label>Reminding Days (e.g., 1,3,5):</label>
            <input
              type="text"
              className="w-full p-2 border rounded-md my-2"
              value={newTask.days}
              onChange={(e) => {
                let value = e.target.value;

                value = value.replace(/[^0-9,]/g, "");

                value = value.replace(/,,+/g, ",");

                let daysArray = value
                  .split(",")
                  .filter((day) => day !== "" && !isNaN(day));

                value = daysArray.join(",");

                if (e.target.value.endsWith(",")) {
                  value += ",";
                }

                if (value === "") {
                  value = "0";
                }

                setNewTask({ ...newTask, days: value });
              }}
            />
            <label className="block mt-2 font-medium">
              Coins Earned for Completing the Task of a Day
            </label>
            <input
              type="number"
              min={1}
              value={newTask.coinsEarned}
              onChange={(e) =>
                setNewTask({ ...newTask, coinsEarned: Number(e.target.value) })
              }
              className="w-full p-2 border rounded-md"
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
          <div className="p-6 rounded-2xl shadow-xl w-fit bg-gray-800 text-white">
            <h2 className="text-2xl font-bold mb-4 text-center">
              {editingIndex !== null
                ? "Edit Email Template"
                : "Add Email Template"}
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
              rows={8}
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
                {editingIndex !== null
                  ? "Update Email Template"
                  : "Save Email Template"}
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

            <label>Start Task Sr No.:</label>
            <input
              type="number"
              className="w-full p-2 border rounded-md my-2"
              value={newMilestone.startTaskSrNo}
              onChange={(e) => {
                const value = e.target.value;
                setNewMilestone({
                  ...newMilestone,
                  startTaskSrNo: value === "" ? "" : Number(value),
                });
              }}
            />

            <label>End Task Sr No.:</label>
            <input
              type="number"
              className="w-full p-2 border rounded-md my-2"
              value={newMilestone.endTaskSrNo}
              onChange={(e) => {
                const value = e.target.value;
                setNewMilestone({
                  ...newMilestone,
                  endTaskSrNo: value === "" ? "" : Number(value),
                });
              }}
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
