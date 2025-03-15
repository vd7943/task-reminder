import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import { FaEdit } from "react-icons/fa";
import { useAuth } from "../context/AuthProvider";
import { PiCoinBold } from "react-icons/pi";
import { IoMdStar, IoMdStarOutline } from "react-icons/io";
import { MdEdit } from "react-icons/md";

const PlanDetail = () => {
  const { id } = useParams();
  const [authUser] = useAuth();
  const [plan, setPlan] = useState(null);
  const [status, setStatus] = useState("");
  const [planStart, setPlanStart] = useState("");
  const [tasks, setTasks] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [events, setEvents] = useState([]);
  const [coinsEarned, setCoinsEarned] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [milestones, setMilestones] = useState([]);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [updatedSubject, setUpdatedSubject] = useState("");
  const [updatedBody, setUpdatedBody] = useState("");

  useEffect(() => {
    fetchPlanDetails();
    fetchCoinsEarned();
    fetchMilestones();
  }, [id]);

  const fetchPlanDetails = async () => {
    try {
      const response = await axios.get(`https://task-reminder-4sqz.onrender.com/plan/${id}`);
      const { plan } = response.data;
      setPlan(plan);
      setStatus(plan.status);
      setPlanStart(plan.planStart);
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
      const response = await axios.get(
        `https://task-reminder-4sqz.onrender.com/email/templates/${
          authUser.userType === "Custom" ? "Custom" : "Admin"
        }`
      );

      let templatesForPlan = response.data.templates[planName];

      if (!Array.isArray(templatesForPlan)) {
        templatesForPlan = [];
      }

      setTemplates(templatesForPlan);
    } catch (error) {
      console.error("Error fetching templates:", error);
      toast.error("Failed to load email templates.");
    }
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

  const fetchMilestones = async () => {
    try {
      const milestoneRes = await axios.get(
        `https://task-reminder-4sqz.onrender.com/plan/milestones/${authUser._id}`,
        { withCredentials: true }
      );

      const fetchedMilestones = milestoneRes.data.milestones.map(
        (milestone) => ({
          taskName: milestone.taskName,
          taskDate: milestone.taskDate
            ? new Date(milestone.taskDate).toLocaleDateString("en-CA")
            : "N/A",
        })
      );

      setMilestones(fetchedMilestones);
      localStorage.setItem("milestones", JSON.stringify(fetchedMilestones));
    } catch (error) {
      console.error("Error fetching milestones:", error);
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
      await axios.put(`https://task-reminder-4sqz.onrender.com/plan/update-plan-status/${id}`, {
        status: newStatus,
      });
      setStatus(newStatus);
      toast.success(`Plan status updated to ${newStatus}`);
    } catch (error) {
      toast.error("Failed to update status.");
    }
  };

  const handlePlanStartChange = async (newStart) => {
    try {
      const response = await axios.put(
        `https://task-reminder-4sqz.onrender.com/plan/update-plan-start/${id}`,
        { planStart: newStart }
      );
      setPlanStart(newStart);
      setTasks(response.data.updatedTasks);
      updateEvents(response.data.updatedTasks);
      toast.success("Plan start date updated and tasks rescheduled.");
    } catch (error) {
      toast.error("Failed to update plan start date.");
    }
  };

  const handleEditTask = (task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  const handleTaskChange = (e) => {
    const { name, value } = e.target;
    setSelectedTask((prevTask) => ({ ...prevTask, [name]: value }));
  };

  const handleSaveTask = async () => {
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

  const handleMilestoneClick = async (event) => {
    const formattedDate = event.start.toLocaleDateString("en-CA");

    try {
      const response = await axios.post(
        `https://task-reminder-4sqz.onrender.com/plan/milestones`,
        {
          userId: authUser._id,
          taskName: event.title,
          taskDate: formattedDate,
        },
        { withCredentials: true }
      );

      if (response.data) {
        toast.success(response.data.message);
        const updatedMilestones = [...milestones, event.title];
        setMilestones(updatedMilestones);
        setTimeout(() => {
          navigate("/");
        }, 1000);
      }
    } catch (error) {
      console.error("Error adding milestone:", error.response?.data?.message);
      toast.error(error.response?.data?.message);
    }
  };

  // calendar events and milestone

  const CustomEvent = ({ event, handleMilestoneClick, viewType }) => {
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

        <div className="flex justify-between items-center w-full">
          <div className="flex gap-2">
            {(authUser.userType === "Custom" ||
              authUser.userType === "Manage") && (
              <button
                onClick={() => handleMilestoneClick(event)}
                className={`p-1 rounded-md transition duration-200 cursor-pointer shadow-sm 
                      ${
                        milestones.some(
                          (milestone) =>
                            milestone.taskName === event.title &&
                            milestone.taskDate ===
                              event.start.toLocaleDateString("en-CA") // Matching title & date
                        )
                          ? "bg-yellow-500 text-white"
                          : "border border-white text-white bg-transparent"
                      }`}
              >
                {milestones.some(
                  (milestone) =>
                    milestone.taskName === event.title &&
                    milestone.taskDate ===
                      event.start.toISOString().split("T")[0]
                ) ? (
                  <IoMdStar size={16} />
                ) : (
                  <IoMdStarOutline size={16} />
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 lg:mx-auto h-full pt-16 md:pt-4 w-full xl:w-[960px]">
      {plan ? (
        <>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-semibold text-gray-200">
              {plan.planName}
            </h2>
            <div className="flex items-center gap-4">
              <select
                value={status}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="bg-gray-700 text-white px-4 py-2 rounded-lg"
              >
                <option value="Paused">Paused</option>
                <option value="Active">Active</option>
              </select>

              <select
                value={planStart}
                onChange={(e) => handlePlanStartChange(e.target.value)}
                className="bg-gray-700 text-white px-4 py-2 rounded-lg"
              >
                <option value="today">Today</option>
                <option value="tomorrow">Tomorrow</option>
              </select>
            </div>
          </div>

          <div className="bg-white/10 p-6 rounded-lg shadow-lg border border-white/10 mb-6">
            <h3 className="text-2xl font-bold text-purple-400 mb-4">Tasks</h3>
            <div className="grid grid-cols-2 gap-6">
              {tasks.map((task) => (
                <div
                  key={task._id}
                  className="p-4 bg-white/5 rounded-lg shadow-md flex justify-between items-start"
                >
                  <div>
                    <h4 className="text-xl font-semibold text-white">
                      {task.taskName}
                    </h4>
                    <p className="text-gray-300">Sr No: {task.srNo}</p>
                    <p className="text-gray-300">
                      Description: {task.taskDescription}
                    </p>
                    <p className="text-gray-300">Task Link: {task.taskLink}</p>
                    <p className="text-gray-300">Task Days: {task.days}</p>
                  </div>
                  <div>
                    <FaEdit
                      className="text-white text-xl cursor-pointer"
                      onClick={() => handleEditTask(task)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {isModalOpen && selectedTask && (
            <div className="fixed inset-0 flex items-center justify-center bg-[#FFFFFF2B] bg-opacity-50 backdrop-blur-lg z-50">
              <div className="p-6 rounded-2xl shadow-xl w-96 bg-gray-800 text-white relative animate-fadeInUp border border-gray-700">
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
                    name="description"
                    value={selectedTask.taskDescription}
                    onChange={handleTaskChange}
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
                    onChange={(e) => {
                      const value = e.target.value;
                      if (/^[\d,]*$/.test(value)) {
                        // Allows only numbers (0-infinity) and commas
                        handleTaskChange(e);
                      }
                    }}
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
                          <button
                            onClick={() => handleEmailEdit(template)}
                            className="bg-[#9D60EC] text-white py-3 px-6 rounded-lg font-semibold shadow-lg hover:bg-[#c095f8] duration-300 cursor-pointer mt-4"
                          >
                            <MdEdit />
                          </button>
                        </>
                      )}
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* calendar */}

          <div className="bg-white/10 p-6 rounded-lg shadow-lg border border-white/10 mb-6">
            <h3 className="text-2xl font-bold text-purple-400 mb-4">
              Task Calendar
            </h3>
            <FullCalendar
              plugins={[dayGridPlugin]}
              initialView="dayGridMonth"
              events={events}
              eventContent={(eventInfo) => (
                <CustomEvent
                  event={eventInfo.event}
                  handleMilestoneClick={handleMilestoneClick}
                  viewType={eventInfo.view.type}
                />
              )}
            />
          </div>

          <div className="bg-white/10 p-6 rounded-lg shadow-lg border border-white/10">
            <h3 className="text-2xl font-bold text-purple-400 mb-4">
              Coins Earned From This Plan:
            </h3>
            <p className="text-gray-300 text-[24px] flex items-center gap-2">
              {coinsEarned} <PiCoinBold color="yellow" />
            </p>
          </div>
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
