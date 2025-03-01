import React, { useEffect, useState } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useAuth } from "../context/AuthProvider";
import axios from "axios";
import { FaEdit } from "react-icons/fa";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { BiCommentDetail } from "react-icons/bi";
import { FaStar } from "react-icons/fa";

const localizer = momentLocalizer(moment);

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
    "#FF7043", // Deep Orange
  ];

  return colors[Math.floor(Math.random() * colors.length)];
};

const Calendar = () => {
  const [events, setEvents] = useState([]);
  const [authUser, setAuthUser] = useAuth();
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isRemarkModalOpen, setIsRemarkModalOpen] = useState(false);
  const [selectedRemarkTask, setSelectedRemarkTask] = useState(null);

  const getNextOccurrence = (dayName, time) => {
    const daysOfWeek = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const targetDayIndex = daysOfWeek.indexOf(dayName);
    if (targetDayIndex === -1) return null;

    const now = new Date();
    const currentDayIndex = now.getDay();

    // Extract hours and minutes from the time string
    const [hours, minutes] = time.split(":").map(Number);

    // Check if the target day is today and time is still in the future
    if (currentDayIndex === targetDayIndex) {
      const todayEvent = new Date();
      todayEvent.setHours(hours, minutes, 0, 0);

      if (todayEvent > now) {
        return todayEvent; // Schedule for today if the time hasn't passed
      }
    }

    // Calculate days until next occurrence
    let daysUntilNext = (targetDayIndex - currentDayIndex + 7) % 7;
    if (daysUntilNext === 0) daysUntilNext = 7; // Ensure it's in the future

    const nextDate = new Date();
    nextDate.setDate(now.getDate() + daysUntilNext);
    nextDate.setHours(hours, minutes, 0, 0);

    return nextDate;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch tasks
        const taskResponse = await axios.get(
          `http://localhost:3000/task/${authUser._id}`,
          { withCredentials: true }
        );
        const taskEvents = taskResponse.data.map((task) => ({
          id: task._id,
          title: task.taskName,
          category: task.category,
          reminder: task.reminderDateTime,
          start: new Date(task.scheduleDateTime),
          end: new Date(
            new Date(task.scheduleDateTime).getTime() +
              task.taskDuration * 60000
          ),
          color: getRandomColor(),
          type: "task", // Differentiate tasks from plans
        }));

        // Fetch plans
        const planResponse = await axios.get(
          `http://localhost:3000/plan/get-user-plan/${authUser._id}`,
          { withCredentials: true }
        );

        const planEvents = planResponse.data.flatMap((plan) =>
          plan.reminders.flatMap((reminder) =>
            reminder.schedule.map((scheduleItem) => {
              const startTime = new Date(
                `${scheduleItem.date}T${scheduleItem.time}:00`
              );
              const endTime = new Date(startTime.getTime() + 60 * 60 * 1000); // Add 1 hour to start time

              return {
                id: reminder._id,
                title: `${plan.planName}`, // Distinguish plan activities
                start: startTime,
                end: endTime,
                color: getRandomColor(),
                type: "plan",
              };
            })
          )
        );

        setEvents([...taskEvents, ...planEvents]);
      } catch (error) {
        console.error("❌ Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const handleEditClick = (task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  const handleRemarkClick = (task) => {
    setSelectedRemarkTask(task);
    setIsRemarkModalOpen(true);
  };

  const { register, handleSubmit } = useForm();

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
        "http://localhost:3000/remark/set-remark",
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

  const onSubmit = async (data) => {
    try {
      const updatedTask = {
        taskName: data.taskName,
        category: data.category,
        scheduleDateTime: new Date(data.scheduleDateTime).toISOString(), // Convert to ISO format
        reminderDateTime: data.reminderDateTime
          ? new Date(data.reminderDateTime).toISOString()
          : null, // Handle null case
      };
      const response = await axios.put(
        `http://localhost:3000/task/edit-task/${selectedTask.id}`,
        updatedTask,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      toast.success(response.data.message);

      setEvents((prevEvents) =>
        prevEvents.map((event) =>
          event.id === selectedTask._id
            ? {
                ...event,
                title: updatedTask.taskName,
                category: updatedTask.category,
                start: new Date(updatedTask.scheduleDateTime),
                reminder: updatedTask.reminderDateTime
                  ? new Date(updatedTask.reminderDateTime)
                  : null,
              }
            : event
        )
      );
      setIsModalOpen(false);
      window.location.reload();
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  };

  const eventStyleGetter = (event) => {
    return {
      style: {
        backgroundColor: event.color,
        borderRadius: "8px",
        padding: "4px",
        border: "none",
        fontSize: "10px",
        fontWeight: "600",
        minHeight: "20px",
        whiteSpace: "normal",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        textAlign: "left",
        color: "white",
        overflow: "hidden",
      },
    };
  };

  const CustomEvent = ({ event }) => (
    <div className="flex justify-between items-center w-full">
      <div className="flex flex-col">
        <span className="font-bold f-1 text-[10px] lg:text-sm">
          {event.title}
        </span>
        <div className="flex flex-col lg:flex-row">
          <span className="text-[8.5px] lg:text-xs text-gray-100 opacity-90">
            {moment(event.start).format("hh:mm A")}
          </span>
          {authUser.userType === "Custom" && (
            <div className="flex flex-row justify-evenly items-center mx-auto my-auto">
              <div>
                <button
                  onClick={() => handleEditClick(event)}
                  className="text-black lg:text-[16px] px-2 py-1 rounded-lg shadow-md hover:text-gray-700 transition cursor-pointer"
                >
                  <FaEdit />
                </button>
              </div>
              <div>
                <button
                  onClick={() => handleRemarkClick(event)}
                  className="text-black lg:text-[16px] px-2 py-1 rounded-lg shadow-md hover:text-gray-700 transition cursor-pointer"
                >
                  <BiCommentDetail />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col mt-12 lg:mt-0 items-center justify-center w-full min-h-screen h-screen lg:w-[960px] p-1 lg:p-4 lg:ml-2">
      <div className="w-full lg:w-[950px] max-w-6xl shadow-2xl rounded-2xl bg-[#FFFFFF2B] p-2 lg:p-6">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{
            height: "85vh",
            width: "100%",
            maxWidth: "100%",
          }}
          views={["month", "agenda"]}
          defaultView="month"
          popup={true}
          step={15}
          timeslots={4}
          eventPropGetter={eventStyleGetter}
          components={{
            event: CustomEvent,
          }}
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

      {isModalOpen && selectedTask && (
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
      )}
    </div>
  );
};

export default Calendar;
