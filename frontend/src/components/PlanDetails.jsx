import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import { FaEdit } from "react-icons/fa";
import { useAuth } from "../context/AuthProvider";

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

  useEffect(() => {
    fetchPlanDetails();
    fetchCoinsEarned();
  }, [id]);

  const fetchPlanDetails = async () => {
    try {
      const response = await axios.get(`http://localhost:3000/plan/${id}`);
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
        `http://localhost:3000/email/templates/${
          authUser.userType === "Custom" ? "Custom" : "Admin"
        }`
      );
      const templatesForPlan = response.data.templates[planName] || [];
      setTemplates(templatesForPlan);
    } catch (error) {
      console.error("Error fetching templates:", error);
      toast.error("Failed to load email templates.");
    }
  };

  const fetchCoinsEarned = async () => {
    try {
      const response = await axios.get(
        `http://localhost:3000/plan/coins-earned/${id}?userId=${authUser._id}`
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
      await axios.put(`http://localhost:3000/plan/update-plan-status/${id}`, {
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
        `http://localhost:3000/plan/update-plan-start/${id}`,
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
        `http://localhost:3000/plan/update-task/${id}/${selectedTask._id}`,
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

            {templates.map((template, index) => (
              <div
                key={index}
                className="p-4 my-2 bg-white/5 rounded-lg shadow-md"
              >
                <h4 className="text-xl font-semibold text-white">
                  {template.subject}
                </h4>
                <p className="text-gray-300">{template.body}</p>
              </div>
            ))}
          </div>

          <div className="bg-white/10 p-6 rounded-lg shadow-lg border border-white/10 mb-6">
            <h3 className="text-2xl font-bold text-purple-400 mb-4">
              Task Calendar
            </h3>
            <FullCalendar
              plugins={[dayGridPlugin]}
              initialView="dayGridMonth"
              events={events}
            />
          </div>

          <div className="bg-white/10 p-6 rounded-lg shadow-lg border border-white/10">
            <h3 className="text-2xl font-bold text-yellow-400 mb-4">
              Coins Earned
            </h3>
            <p className="text-gray-300 text-lg">{coinsEarned} Coins</p>
          </div>
        </>
      ) : (
        <div className="flex justify-center items-center h-screen">
          <div className="w-20 h-20 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
};

export default PlanDetail;
