import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import { FaEdit } from "react-icons/fa";
import { useAuth } from "../context/AuthProvider";
import { PiCoinBold } from "react-icons/pi";
import { MdEdit } from "react-icons/md";

const PlanDetail = () => {
  const { id } = useParams();
  const [authUser] = useAuth();
  const [plan, setPlan] = useState(null);
  const [status, setStatus] = useState("");
  const [tasks, setTasks] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [events, setEvents] = useState([]);
  const [coinsEarned, setCoinsEarned] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [updatedSubject, setUpdatedSubject] = useState("");
  const [updatedBody, setUpdatedBody] = useState("");

  useEffect(() => {
    fetchPlanDetails();
    fetchCoinsEarned();
  }, [id]);

  const fetchPlanDetails = async () => {
    try {
      const response = await axios.get(`https://task-reminder-4sqz.onrender.com/plan/${id}`);
      const { plan } = response.data;
      setPlan(plan);
      setStatus(plan.status);
      setTasks(plan.tasks);
      updateEvents(plan.tasks);

      fetchTemplates(plan.planName);
    } catch (error) {
      console.error("Error fetching plan details:", error);
      toast.error("Failed to load plan details.");
    }
  };

  const fetchTemplates = async (planName) => {
    try {
      let allTemplates = [];

      if (authUser.userType === "Custom") {
        const [customResponse, adminResponse] = await Promise.all([
          axios.get(`https://task-reminder-4sqz.onrender.com/email/templates/Custom`),
          axios.get(`https://task-reminder-4sqz.onrender.com/email/templates/Admin`),
        ]);

        const customTemplates = customResponse.data.templates[planName] || [];
        const adminTemplates = adminResponse.data.templates[planName] || [];

        allTemplates = [...customTemplates, ...adminTemplates];
      } else {
        const response = await axios.get(
          `https://task-reminder-4sqz.onrender.com/email/templates/Admin`
        );
        allTemplates = response.data.templates[planName] || [];
      }

      setTemplates(allTemplates);
    } catch (error) {
      console.error("Error fetching templates:", error);
      toast.error("Failed to load email templates.");
    }
  };

  const getTaskStartEndDates = (schedule) => {
    const dates = schedule
      .map((s) => new Date(s.date))
      .filter((date) => !isNaN(date));

    if (dates.length === 0) return { startDate: "N/A", endDate: "N/A" };

    const startDate = new Date(Math.min(...dates)).toDateString();
    const endDate = new Date(Math.max(...dates)).toDateString();

    return { startDate, endDate };
  };

  const getPlanStartDate = (tasks) => {
    if (!tasks || tasks.length === 0) return "N/A";

    const firstTaskDate = tasks
      .map((task) => new Date(task.schedule?.[0]?.date))
      .filter((date) => !isNaN(date))
      .sort((a, b) => a - b)[0];

    return firstTaskDate ? firstTaskDate.toDateString() : "N/A";
  };

  const getPlanEndDate = (tasks) => {
    if (!tasks || tasks.length === 0) return "N/A";

    const lastTaskDate = tasks
      .map((task) => new Date(task.schedule?.[task.schedule.length - 1]?.date))
      .filter((date) => !isNaN(date))
      .sort((a, b) => b - a)[0];

    return lastTaskDate ? lastTaskDate.toDateString() : "N/A";
  };

  const fetchCoinsEarned = async () => {
    try {
      const response = await axios.get(
        `https://task-reminder-4sqz.onrender.com/plan/coins-earned/${id}?userId=${authUser._id}`
      );
      setCoinsEarned(response.data.coinsEarned || 0);
    } catch (error) {
      console.error("Error fetching coins earned:", error);
      toast.error("Failed to load earned coins.");
    }
  };

  const updateEvents = (tasks) => {
    const newEvents = tasks.flatMap((task) =>
      task.schedule.map((sched) => ({
        title: task.taskName,
        start: sched.date,
        allDay: true,
      }))
    );
    setEvents(newEvents);
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await axios.put(
        `https://task-reminder-4sqz.onrender.com/plan/update-plan-status/${id}/${authUser._id}`,
        {
          status: newStatus,
        }
      );
      setStatus(newStatus);
      toast.success(`Plan status updated to ${newStatus}`);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update status.");
    }
  };

  const handleEditTask = (task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  const handleTaskChange = (e) => {
    const { name, value } = e.target;

    if (name === "days") {
      let input = value;

      input = input.replace(/[^0-9,]/g, "");

      input = input.replace(/,,+/g, ",");

      setSelectedTask((prevTask) => ({
        ...prevTask,
        [name]: input,
      }));
      return;
    }

    if (name === "coinsEarned") {
      const numericValue = Number(value);
      if (numericValue < 0) return;
    }

    setSelectedTask((prevTask) => ({
      ...prevTask,
      [name]: value,
    }));
  };

  const handleSaveTask = async () => {
    const isDuplicateSrNo = tasks.some(
      (task) =>
        task._id !== selectedTask._id && task.srNo === Number(selectedTask.srNo)
    );
    if (isDuplicateSrNo) {
      toast.error(`Sr No. ${selectedTask.srNo} already exists!`);
      return;
    }

    const daysInput = selectedTask.days;

    if (
      daysInput.startsWith(",") ||
      daysInput.endsWith(",") ||
      daysInput.includes(",,")
    ) {
      toast.error(
        "Days format is invalid: avoid leading/trailing or double commas."
      );
      return;
    }

    const daysArray = daysInput
      .split(",")
      .map((d) => d.trim())
      .filter((d) => d !== "");

    const hasDuplicateDays = new Set(daysArray).size !== daysArray.length;

    if (hasDuplicateDays) {
      toast.error("Duplicate days are not allowed.");
      return;
    }

    try {
      const response = await axios.put(
        `https://task-reminder-4sqz.onrender.com/plan/update-task/${id}/${selectedTask._id}`,
        selectedTask
      );
      toast.success("Task updated successfully!");
      setTimeout(() => {
        setTasks(response.data.updatedTask);
        updateEvents(response.data.updatedTask);
        setIsModalOpen(false);
      }, 1000);
      window.location.reload();
    } catch (error) {
      toast.error("Failed to update task.");
    }
  };

  const handleEmailEdit = (template) => {
    setEditingTemplate(template._id);
    setUpdatedSubject(template.subject);
    setUpdatedBody(template.body);
  };
  const handleEmailUpdate = async () => {
    try {
      await axios.put(
        `https://task-reminder-4sqz.onrender.com/email/update-template/${editingTemplate}`,
        {
          subject: updatedSubject,
          body: updatedBody,
        }
      );

      toast.success("Template updated successfully");

      setTemplates((prevTemplates) => {
        const updatedTemplates = { ...prevTemplates };

        Object.keys(updatedTemplates).forEach((planName) => {
          if (Array.isArray(updatedTemplates[planName])) {
            updatedTemplates[planName] = updatedTemplates[planName].map((t) =>
              t._id === editingTemplate
                ? { ...t, subject: updatedSubject, body: updatedBody }
                : t
            );
          }
        });

        return { ...updatedTemplates };
      });

      setEditingTemplate(null);
      setTimeout(() => {
        window.location.reload();
      }, 100);
    } catch (err) {
      toast.error("Failed to update template");
    }
  };

  const CustomEvent = ({ event, viewType }) => {
    return (
      <div
        className={`p-1 rounded-md w-full bg-opacity-90 ${
          viewType === "dayGridMonth"
            ? "shadow-md overflow-hidden truncate px-2 flex flex-col justify-between" // Month view styling
            : "shadow-lg p-2 flex items-center justify-between" // List view styling
        }`}
      >
        <span className="font-semibold text-[10px] lg:text-sm text-white truncate">
          {event.title}
        </span>
      </div>
    );
  };

  return (
    <div className="p-6 lg:mx-auto h-full pt-16 mt-5 lg:mt-0 md:pt-4 w-full xl:w-[960px]">
      {plan ? (
        <>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div>
              <h2 className="text-3xl font-semibold text-gray-200">
                {plan.planName}
              </h2>
              <div className="mt-3 text-sm text-gray-400 flex gap-4 flex-wrap">
                <p>
                  <span className="font-medium text-gray-300">
                    Plan Start Date:
                  </span>{" "}
                  {getPlanStartDate(plan.tasks)}
                </p>
                <p>
                  <span className="font-medium text-gray-300">
                    Plan End Date:
                  </span>{" "}
                  {getPlanEndDate(plan.tasks)}
                </p>
              </div>
            </div>

            {(authUser.userType === "Custom" ||
              authUser.userType === "Manage") && (
              <div className="flex items-center gap-4">
                <select
                  value={status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  className="bg-gray-700 text-white px-4 py-2 rounded-lg"
                >
                  <option value="Paused">Paused</option>
                  <option value="Active">Active</option>
                </select>
              </div>
            )}
          </div>

          <div className="bg-white/10 p-6 rounded-lg shadow-lg border border-white/10 mb-6">
            <FullCalendar
              plugins={[dayGridPlugin]}
              initialView="dayGridMonth"
              events={events}
              eventContent={(eventInfo) => (
                <CustomEvent
                  event={eventInfo.event}
                  viewType={eventInfo.view.type}
                />
              )}
            />
          </div>

          <div className="bg-white/10 p-6 rounded-lg shadow-lg border border-white/10 mb-6">
            <h3 className="text-2xl font-bold text-purple-400 mb-4">Tasks</h3>

            <div className="overflow-x-auto">
              <table className="min-w-full text-sm text-gray-300 border border-white/10">
                <thead className="bg-white/10 text-purple-200">
                  <tr>
                    <th className="p-3 text-left whitespace-nowrap">Sr No</th>
                    <th className="p-3 text-left whitespace-nowrap">
                      Task Name
                    </th>
                    <th className="p-3 text-left whitespace-nowrap">
                      Description
                    </th>
                    <th className="p-3 text-left whitespace-nowrap">
                      Task Link
                    </th>
                    <th className="p-3 text-left whitespace-nowrap">Days</th>
                    <th className="p-3 text-left whitespace-nowrap">Coins</th>
                    <th className="p-3 text-left whitespace-nowrap">
                      Start Date
                    </th>
                    <th className="p-3 text-left whitespace-nowrap">
                      End Date
                    </th>
                    {(authUser.userType === "Custom" ||
                      authUser.role === "Admin") &&
                      plan.adminPlanId === null && (
                        <th className="p-3 text-left whitespace-nowrap">
                          Action
                        </th>
                      )}
                  </tr>
                </thead>
                <tbody>
                  {tasks.map((task) => {
                    const { startDate, endDate } = getTaskStartEndDates(
                      task.schedule
                    );
                    return (
                      <tr
                        key={task._id}
                        className="border-t border-white/10 hover:bg-white/5 transition"
                      >
                        <td className="p-3">{task.srNo}</td>
                        <td className="p-3 font-semibold text-white">
                          {task.taskName}
                        </td>
                        <td className="p-3">{task.taskDescription}</td>
                        <td className="p-3 break-all">
                          <a
                            href={task.taskLink}
                            className="text-blue-400 underline"
                            target="_blank"
                            rel="noreferrer"
                          >
                            {task.taskLink}
                          </a>
                        </td>
                        <td className="p-3">{task.days}</td>
                        <td className="p-3">{task.coinsEarned}</td>
                        <td className="p-3">{startDate}</td>
                        <td className="p-3">{endDate}</td>
                        {(authUser.userType === "Custom" ||
                          authUser.role === "Admin") &&
                          plan.adminPlanId === null && (
                            <td className="p-3">
                              <FaEdit
                                className="text-white text-xl cursor-pointer hover:text-yellow-400"
                                onClick={() => handleEditTask(task)}
                              />
                            </td>
                          )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {isModalOpen && selectedTask && (
            <div className="fixed inset-0 flex items-center overflow-y-auto justify-center bg-[#FFFFFF2B] bg-opacity-50 backdrop-blur-lg z-50">
              <div className="p-6 rounded-2xl shadow-xl lg:mt-30 w-96 bg-gray-800 text-white relative animate-fadeInUp border border-gray-700">
                <h3 className="text-2xl font-bold text-white mb-4">
                  Edit Task
                </h3>
                <div className="mb-3">
                  <label className="block text-gray-400 mb-1">Task Name</label>
                  <input
                    type="text"
                    name="taskName"
                    value={selectedTask.taskName}
                    onChange={handleTaskChange}
                    className="w-full p-2 bg-gray-700 text-white rounded"
                  />
                </div>
                <div className="mb-3">
                  <label className="block text-gray-400 mb-1">Sr No.</label>
                  <input
                    type="number"
                    name="srNo"
                    value={selectedTask.srNo}
                    onChange={handleTaskChange}
                    className="w-full p-2 bg-gray-700 text-white rounded"
                  />
                </div>
                <div className="mb-3">
                  <label className="block text-gray-400 mb-1">
                    Description
                  </label>
                  <textarea
                    name="taskDescription"
                    value={selectedTask.taskDescription}
                    onChange={handleTaskChange}
                    rows={4}
                    className="w-full p-2 bg-gray-700 text-white rounded"
                  />
                </div>
                <div className="mb-3">
                  <label className="block text-gray-400 mb-1">Task Link</label>
                  <input
                    type="text"
                    name="taskLink"
                    value={selectedTask.taskLink}
                    onChange={handleTaskChange}
                    className="w-full p-2 bg-gray-700 text-white rounded"
                  />
                </div>
                <div className="mb-3">
                  <label className="block text-gray-400 mb-1">Days</label>
                  <input
                    type="text"
                    name="days"
                    value={selectedTask.days}
                    onChange={handleTaskChange}
                    className="w-full p-2 bg-gray-700 text-white rounded"
                  />
                </div>
                <div className="mb-3">
                  <label className="block text-gray-400 mb-1">
                    Coins Earned for Completing the Task of a Day
                  </label>
                  <input
                    type="text"
                    name="coinsEarned"
                    min={0}
                    value={selectedTask.coinsEarned}
                    onChange={handleTaskChange}
                    className="w-full p-2 bg-gray-700 text-white rounded"
                  />
                </div>
                <div className="mt-4 flex justify-between">
                  <button
                    className="bg-green-500 px-4 py-2 rounded text-white hover:scale-105 cursor-pointer"
                    onClick={handleSaveTask}
                  >
                    Save
                  </button>
                  <button
                    className="bg-red-500 px-4 py-2 rounded text-white hover:scale-105 mr-2 cursor-pointer"
                    onClick={() => setIsModalOpen(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white/10 p-6 rounded-lg shadow-lg border border-white/10 mb-6">
            <h3 className="text-2xl font-bold text-purple-400 mb-4">
              Email Templates
            </h3>

            {Object.keys(templates).length === 0 ? (
              <div className="bg-[#FFFFFF2B] p-6 rounded-lg shadow-lg border border-white/10">
                <p className="text-center text-gray-300">No templates found.</p>
              </div>
            ) : (
              <div className="mb-6">
                {Array.isArray(templates) &&
                  templates.map((template) => (
                    <div
                      key={template._id}
                      className="relative bg-[#FFFFFF2B] p-6 rounded-lg shadow-lg border border-white/10 hover:bg-gray-800 transition-all duration-200 mb-2"
                    >
                      {editingTemplate === template._id ? (
                        <>
                          <input
                            type="text"
                            value={updatedSubject}
                            onChange={(e) => setUpdatedSubject(e.target.value)}
                            className="border p-2 w-full bg-gray-800 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-purple-400"
                          />
                          <textarea
                            value={updatedBody}
                            onChange={(e) => setUpdatedBody(e.target.value)}
                            className="border p-2 w-full bg-gray-800 text-white rounded-md mt-2 h-24 focus:outline-none focus:ring-2 focus:ring-purple-400"
                          ></textarea>
                          <button
                            onClick={handleEmailUpdate}
                            className="bg-green-500 text-white py-3 px-6 rounded-lg font-semibold shadow-lg hover:bg-green-600 transition-all duration-300 cursor-pointer mt-4"
                          >
                            ✅ Save Changes
                          </button>
                        </>
                      ) : (
                        <>
                          <h4 className="text-xl font-bold text-white mb-2 drop-shadow-md">
                            {template.subject}
                          </h4>
                          <p className="text-gray-300">{template.body}</p>
                          {(authUser.userType === "Custom" ||
                            authUser.role === "Admin") &&
                            plan.adminPlanId === null && (
                              <button
                                onClick={() => handleEmailEdit(template)}
                                className="bg-[#9D60EC] text-white py-3 px-6 rounded-lg font-semibold shadow-lg hover:bg-[#c095f8] duration-300 cursor-pointer mt-4"
                              >
                                <MdEdit />
                              </button>
                            )}
                        </>
                      )}
                    </div>
                  ))}
              </div>
            )}
          </div>

          {authUser?.role === "User" && (
            <div className="bg-white/10 p-6 rounded-lg shadow-lg border border-white/10">
              <h3 className="text-2xl font-bold text-purple-400 mb-4">
                Coins Earned From This Plan:
              </h3>
              <p className="text-gray-300 text-[24px] flex items-center gap-2">
                {coinsEarned} <PiCoinBold color="yellow" />
              </p>
            </div>
          )}
        </>
      ) : (
        <div className="flex justify-center items-center h-screen">
          <div className="w-20 h-20 border-4 border-gray-300 border-t-[#FFFFFF2B] rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
};

export default PlanDetail;
