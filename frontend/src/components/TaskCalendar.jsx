import React, { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import moment from "moment";
import { useAuth } from "../context/AuthProvider";
import axios from "axios";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { BiCommentDetail } from "react-icons/bi";
import { FaStar } from "react-icons/fa";
import { IoMdStar, IoMdStarOutline } from "react-icons/io";
import { useNavigate } from "react-router-dom";

const getRandomColor = () => {
  const colors = [
    "#4A90E2", // Blue
    "#B388FF", // Purple
    "#FF8A80", // Red
    "#66BB6A", // Green
    "#9575CD", // Soft Violet
    "#E57373", // Soft Red
    "#81C784", // Light Green
    "#F48FB1", // Pink
    "#A1887F", // Warm Brown
    "#FFB74D", // Orange
    "#BA68C8", // Lavender
    "#C2185B", // Dark Pink
    "#7E57C2", // Deep Purple
    "#009688", // Teal
    "#F06292", // Bright Pink
    "#8D6E63", // Brown
    "#D32F2F", // Dark Red
    "#388E3C", // Dark Green
    "#1976D2", // Royal Blue
    "#5C6BC0", // Indigo
  ];

  return colors[Math.floor(Math.random() * colors.length)];
};

const TaskCalendar = () => {
  const [events, setEvents] = useState([]);
  const [authUser, setAuthUser] = useAuth();
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [isRemarkModalOpen, setIsRemarkModalOpen] = useState(false);
  const [selectedRemarkTask, setSelectedRemarkTask] = useState(null);
  const [milestones, setMilestones] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const planResponse = await axios.get(
          `https://task-reminder-4sqz.onrender.com/plan/get-user-plan/${authUser._id}`,
          { withCredentials: true }
        );

        const planEvents = planResponse.data.flatMap((plan) =>
          plan.tasks.flatMap((task) =>
            task.schedule.map((scheduleItem) => {
              const startTime = new Date(
                `${scheduleItem.date}T${scheduleItem.time}:00`
              );
              const endTime = new Date(
                startTime.getTime() + 23.9 * 60 * 60 * 1000
              );

              return {
                id: task._id,
                title: `${plan.planName}`, // Distinguish plan activities
                start: startTime,
                end: endTime,
                color: getRandomColor(),
                type: "plan",
              };
            })
          )
        );

        setEvents([...planEvents]);
      } catch (error) {
        console.error("❌ Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const handleRemarkClick = (task) => {
    setSelectedRemarkTask(task);
    setIsRemarkModalOpen(true);
  };

  useEffect(() => {
    const fetchMilestones = async () => {
      try {
        const milestoneRes = await axios.get(
          `https://task-reminder-4sqz.onrender.com/plan/milestones/${authUser._id}`,
          { withCredentials: true }
        );

        const fetchedMilestones = milestoneRes.data.milestones.map(
          (milestone) => milestone.planName
        );

        setMilestones(fetchedMilestones);
        localStorage.setItem("milestones", JSON.stringify(fetchedMilestones));
      } catch (error) {
        console.error("Error fetching milestones:", error);
      }
    };

    fetchMilestones();
  }, [authUser._id]);

  const handleMilestoneClick = async (event) => {
    try {
      console.log(planName);
      const response = await axios.post(
        `https://task-reminder-4sqz.onrender.com/plan/milestones`,
        { userId: authUser._id, planName: event.title },
        { withCredentials: true }
      );

      if (response.data) {
        toast.success(response.data.message);
        const updatedMilestones = [...milestones, event.title];
        setMilestones(updatedMilestones);
        localStorage.setItem("milestones", JSON.stringify(updatedMilestones));
      }
    } catch (error) {
      console.error("Error adding milestone:", error.response?.data?.message);
      toast.error(error.response?.data?.message);
    }
  };

  const {
    register: remarkRegister,
    handleSubmit: handleRemarkSubmit,
    setValue,
    reset: resetRemarkForm,
  } = useForm();

  const handleStarClick = (star) => {
    setRating(star);
    setValue("taskReview", star);
  };

  const onRemarkSubmit = async (data) => {
    try {
      const remarkData = {
        taskName: selectedRemarkTask.title,
        taskDuration: data.taskDuration,
        taskReview: data.taskReview,
        taskSummary: data.taskSummary,
        userId: authUser._id,
      };

      const response = await axios.post(
        "https://task-reminder-4sqz.onrender.com/remark/set-remark",
        remarkData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      if (response.data.success) {
        toast.success(response.data.message);
        const updatedUserRes = await axios.get(
          `http://localhost:3000/user/${authUser._id}`,
          { withCredentials: true }
        );
        if (updatedUserRes.data.user) {
          setAuthUser(updatedUserRes.data.user);
          localStorage.setItem(
            "User",
            JSON.stringify(updatedUserRes.data.user)
          );
        }
        setIsRemarkModalOpen(false);
        resetRemarkForm();
        setTimeout(() => {
          navigate("/");
          window.location.reload();
        }, 1000);
      } else {
        toast.error("Error");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  };

  const eventStyleGetter = (event, viewType) => {
    return {
      style: {
        backgroundColor: event.color || "#3B82F6", // Default to blue if no color is provided
        borderRadius: "6px",
        padding: viewType === "dayGridMonth" ? "2px 6px" : "4px",
        border: "none",
        fontSize: viewType === "dayGridMonth" ? "9px" : "11px",
        fontWeight: "600",
        minHeight: "18px",
        whiteSpace: "nowrap",
        textOverflow: "ellipsis",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        textAlign: "left",
        color: "white",
        boxShadow: "0px 1px 3px rgba(0, 0, 0, 0.2)",
        cursor: "pointer",
      },
    };
  };

  const CustomEvent = ({
    event,
    handleRemarkClick,
    handleMilestoneClick,
    viewType,
  }) => {
    const eventBgColor = getRandomColor();

    return (
      <div
        className={`p-1 rounded-md w-full bg-opacity-90 ${
          viewType === "dayGridMonth"
            ? "shadow-md overflow-hidden truncate px-2 flex flex-col justify-between" // Month view styling
            : "shadow-lg p-2 flex items-center justify-between" // List view styling
        }`}
        style={{ backgroundColor: eventBgColor }}
      >
        {viewType === "dayGridMonth" ? (
          <>
            <span className="font-semibold text-[10px] lg:text-sm text-white truncate">
              {event.title}
            </span>

            <div className="flex justify-between items-center w-full">
              <div className="flex gap-1">
                {(authUser.userType === "Custom" ||
                authUser.userType === "Manage") && (
                  <button
                    onClick={() => handleRemarkClick(event)}
                    className="text-white bg-gray-500 hover:bg-gray-600 p-1 rounded-md transition duration-200 cursor-pointer shadow-sm"
                  >
                    <BiCommentDetail size={14} />
                  </button>
                )}
                {(authUser.userType === "Custom" ||
                  authUser.userType === "Manage") && (
                  <button
                    onClick={() => handleMilestoneClick(event)}
                    className={`p-1 rounded-md transition duration-200 cursor-pointer shadow-sm 
                ${
                  milestones.includes(event.title)
                    ? "bg-yellow-500 text-white"
                    : "border border-white text-white bg-transparent"
                }`}
                  >
                    {milestones.includes(event.title) ? (
                      <IoMdStar size={16} />
                    ) : (
                      <IoMdStarOutline size={16} />
                    )}
                  </button>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-between w-full">
            <div className="flex flex-col">
              <span className="font-semibold text-[11px] lg:text-sm text-white truncate">
                {event.title}
              </span>
            </div>

            <div className="flex gap-2">
               {(authUser.userType === "Custom" ||
                authUser.userType === "Manage") && (
                <button
                  onClick={() => handleRemarkClick(event)}
                  className="text-white bg-gray-500 hover:bg-gray-600 p-1 rounded-md transition duration-200 cursor-pointer shadow-sm"
                >
                  <BiCommentDetail size={14} />
                </button>
              )}
              {(authUser.userType === "Custom" ||
                authUser.userType === "Manage") && (
                <button
                  onClick={() => handleMilestoneClick(event)}
                  className={`p-1 rounded-md transition duration-200 cursor-pointer shadow-sm 
                ${
                  milestones.includes(event.title)
                    ? "bg-yellow-500 text-white"
                    : "border border-white text-white bg-transparent"
                }`}
                >
                  {milestones.includes(event.title) ? (
                    <IoMdStar size={16} />
                  ) : (
                    <IoMdStarOutline size={16} />
                  )}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
     <div className="flex flex-col m-auto items-center justify-center w-full min-h-screen h-full lg:w-[960px] p-1 lg:p-4">
      <div className="w-full lg:w-[950px] max-w-6xl shadow-2xl rounded-2xl bg-[#FFFFFF2B] p-2 lg:p-6">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, listPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,listWeek",
          }}
          events={events.filter((event) => {
            const eventDate = new Date(event.start).setHours(0, 0, 0, 0);
            const today = new Date().setHours(0, 0, 0, 0);
            return eventDate >= today;
          })}
          eventContent={(eventInfo) => (
            <CustomEvent
              event={eventInfo.event}
              handleRemarkClick={handleRemarkClick}
              handleMilestoneClick={handleMilestoneClick}
              viewType={eventInfo.view.type}
            />
          )}
          eventStyleGetter={eventStyleGetter}
          displayEventEnd={true}
          editable={true}
          selectable={true}
          height="85vh"
          contentHeight="auto"
          dayMaxEventRows={3}
          dayMaxEvents={true}
        />
      </div>

      {isRemarkModalOpen && selectedRemarkTask && (
        <div className="fixed inset-0 flex items-center justify-center bg-[#FFFFFF2B] bg-opacity-50 backdrop-blur-lg z-50">
          <div className="p-6 rounded-2xl shadow-xl w-96 bg-gray-800 text-white relative animate-fadeInUp border border-gray-700">
            <h2 className="text-2xl font-bold mb-4 text-center">Add Remark</h2>

            <form
              onSubmit={handleRemarkSubmit(onRemarkSubmit)}
              className="space-y-4"
            >
              <div>
                <label className="block mb-1 text-gray-300">Task Name</label>
                <input
                  type="text"
                  className="border border-gray-600 bg-gray-700 p-2 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={selectedRemarkTask?.title}
                  readOnly
                />
              </div>

              <div>
                <label className="block mb-1 text-gray-300">
                  Task Duration (in minutes)
                </label>
                <input
                  type="number"
                  className="border border-gray-600 bg-gray-700 p-2 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  {...remarkRegister("taskDuration", { required: true })}
                />
              </div>

              <div>
                <label className="block mb-1 text-gray-300">Task Review</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <FaStar
                      key={star}
                      size={26}
                      className={`cursor-pointer ${
                        (hover || rating) >= star
                          ? "text-yellow-500"
                          : "text-gray-300"
                      }`}
                      onMouseEnter={() => setHover(star)}
                      onMouseLeave={() => setHover(0)}
                      onClick={() => handleStarClick(star)}
                    />
                  ))}
                </div>
                <input
                  type="hidden"
                  value={rating}
                  {...remarkRegister("taskReview", { required: true })}
                />
              </div>

              <div>
                <label className="block mb-1 text-gray-300">Task Summary</label>
                <textarea
                  className="border border-gray-600 bg-gray-700 p-2 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  {...remarkRegister("taskSummary", { required: true })}
                ></textarea>
              </div>

              <div className="flex justify-between mt-6">
                <button
                  type="submit"
                  className="px-4 py-2 w-1/2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-semibold cursor-pointer transition-all duration-300 shadow-lg"
                >
                  Submit
                </button>

                <button
                  type="button"
                  onClick={() => setIsRemarkModalOpen(false)}
                  className="px-4 py-2 w-1/2 bg-red-600 hover:bg-red-700 rounded-lg text-white font-semibold cursor-pointer transition-all duration-300 shadow-lg ml-2"
                >
                  Cancel
                </button>
              </div>
            </form>

            <button
              onClick={() => setIsRemarkModalOpen(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-white transition-all cursor-pointer duration-300 text-lg"
            >
              ✖
            </button>
          </div>
        </div>
      )}

      {/* {isModalOpen && selectedTask && (
        <div className="fixed inset-0 flex items-center justify-center bg-[#FFFFFF2B] bg-opacity-50 backdrop-blur-lg z-50">
          <div className="p-6 rounded-2xl shadow-xl w-96 bg-gray-800 text-white relative animate-fadeInUp border border-gray-700">
            <h2 className="text-2xl font-bold mb-4 text-center">Edit Task</h2>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block mb-1 text-gray-300">Task Name</label>
                <input
                  type="text"
                  className="border border-gray-600 bg-gray-700 p-2 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  {...register("taskName", { required: true })}
                  defaultValue={selectedTask?.title}
                />
              </div>

              <div>
                <label className="block mb-1 text-gray-300">Category</label>
                <select
                  className="border border-gray-600 bg-gray-700 p-2 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  {...register("category", { required: true })}
                  defaultValue={selectedTask?.category}
                >
                  <option value="Meeting">Meeting</option>
                  <option value="Gym">Gym</option>
                  <option value="Diet">Diet</option>
                  <option value="Medical">Medical</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block mb-1 text-gray-300">
                  Schedule Date & Time
                </label>
                <input
                  type="datetime-local"
                  className="border border-gray-600 bg-gray-700 p-2 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  {...register("scheduleDateTime", { required: true })}
                  defaultValue={moment(selectedTask?.start).format(
                    "YYYY-MM-DDTHH:mm"
                  )}
                />
              </div>

              <div>
                <label className="block mb-1 text-gray-300">
                  Reminder Date & Time
                </label>
                <input
                  type="datetime-local"
                  className="border border-gray-600 bg-gray-700 p-2 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  {...register("reminderDateTime")}
                  defaultValue={
                    selectedTask?.reminder
                      ? moment(selectedTask.reminder).format("YYYY-MM-DDTHH:mm")
                      : ""
                  }
                />
              </div>

              <div className="flex justify-between mt-6">
                <button
                  type="submit"
                  className="px-4 py-2 w-1/2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-semibold cursor-pointer transition-all duration-300 shadow-lg"
                >
                  Save
                </button>

                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 w-1/2 bg-red-600 hover:bg-red-700 rounded-lg text-white font-semibold cursor-pointer transition-all duration-300 shadow-lg ml-2"
                >
                  Cancel
                </button>
              </div>
            </form>

            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-white transition-all cursor-pointer duration-300 text-lg"
            >
              ✖
            </button>
          </div>
        </div>
      )} */}
    </div>
  );
};

export default TaskCalendar;
