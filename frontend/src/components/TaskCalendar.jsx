import React, { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import { useAuth } from "../context/AuthProvider";
import axios from "axios";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { LuMessageSquareDiff } from "react-icons/lu";
import { FaStar } from "react-icons/fa";

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
  const [selectedTasks, setSelectedTasks] = useState([]);
  const [tasksForDay, setTasksForDay] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedPlanId, setSelectedPlanId] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const planResponse = await axios.get(
          `https://task-reminder-4sqz.onrender.com/plan/get-user-plan/${authUser._id}`,
          { withCredentials: true }
        );

        const activePlans = planResponse?.data?.plans?.filter(
          (plan) => plan.status === "Active"
        );

        const planEvents = activePlans?.flatMap((plan) =>
          plan.tasks.flatMap((task) =>
            task.schedule.map((scheduleItem) => {
              const startTime = new Date(
                `${scheduleItem.date}T${scheduleItem.time}:00`
              );
              const endTime = new Date(
                startTime.getTime() + 23.98 * 60 * 60 * 1000
              );

              return {
                id: task._id,
                title: `${task.taskName}`,
                start: startTime,
                end: endTime,
                color: getRandomColor(),
                type: "plan",
                planId: plan._id,
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
    console.log(task);
    setSelectedRemarkTask(task);
    setSelectedDate(task.start);
    setSelectedPlanId(task.extendedProps?.planId);

    setTasksForDay(
      events.filter(
        (e) =>
          new Date(e.start).toDateString() ===
          new Date(task.start).toDateString()
      )
    );
    setIsRemarkModalOpen(true);
  };

  const {
    register: remarkRegister,
    handleSubmit: handleRemarkSubmit,
    setValue,
    reset: resetRemarkForm,
  } = useForm();

  useEffect(() => {
    if (tasksForDay.length === 1) {
      setSelectedTasks([tasksForDay[0].title]);
    }
  }, [tasksForDay]);

  const handleTaskSelection = (taskTitle) => {
    setSelectedTasks((prevTasks) =>
      prevTasks.includes(taskTitle)
        ? prevTasks.filter((task) => task !== taskTitle)
        : [...prevTasks, taskTitle]
    );
  };

  const handleStarClick = (star) => {
    setRating(star);
    setValue("taskReview", star);
  };

  const onRemarkSubmit = async (data) => {
    if (selectedTasks.length === 0) {
      toast.error("Please select at least one task to give a remark.");
      return;
    }

    if (!selectedRemarkTask) {
      toast.error("Invalid task selection.");
      return;
    }

    try {
      const { data: todayPlans } = await axios.get(
        `https://task-reminder-4sqz.onrender.com/plan/get-today-plan/${authUser._id}`
      );

      const totalTasksToday = todayPlans.reduce(
        (acc, plan) => acc + plan.tasks.length,
        0
      );

      const remarkPromises = selectedTasks.map(async (taskTitle) => {
        const remarkData = {
          taskName: taskTitle,
          taskDate: selectedRemarkTask.start.toLocaleDateString("en-CA"),
          taskDuration: data.taskDuration,
          taskReview: data.taskReview,
          taskSummary: data.taskSummary,
          userId: authUser._id,
          planId: selectedPlanId,
        };

        return await axios.post(
          "https://task-reminder-4sqz.onrender.com/remark/set-remark",
          remarkData,
          { headers: { "Content-Type": "application/json" } }
        );
      });

      const responses = await Promise.all(remarkPromises);

      if (selectedTasks.length === totalTasksToday) {
        const totalCoinsEarned = responses.reduce((acc, res) => {
          return acc + (res.data.coinsEarned || 0);
        }, 0);
        toast.success(
          `🎉 Congratulations! You've completed all tasks for today and earned ${totalCoinsEarned} coins!`
        );
      } else {
        toast.success("Remark added successfully");
      }

      setIsRemarkModalOpen(false);
      resetRemarkForm();
    } catch (error) {
      console.error("Error:", error);
      toast.error(error.response?.data?.message);
    }
  };

  const eventStyleGetter = (event, viewType) => {
    return {
      style: {
        backgroundColor: event.color || "#3B82F6",
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

  const CustomEvent = ({ event, handleRemarkClick, viewType }) => {
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
              <div className="flex gap-2">
                {(authUser.userType === "Custom" ||
                  authUser.userType === "Manage") && (
                  <button
                    onClick={() => handleRemarkClick(event)}
                    className="flex cursor-pointer items-center gap-1 text-sm font-medium text-white bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 px-2 py-1 rounded-md transition-all duration-300 shadow-md hover:shadow-lg"
                  >
                    <LuMessageSquareDiff size={16} />
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
                  className="flex cursor-pointer items-center gap-1 text-sm font-medium text-white bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 px-2 py-1 rounded-md transition-all duration-300 shadow-md hover:shadow-lg"
                >
                  <LuMessageSquareDiff size={16} />
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
          initialView="listWeek"
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,listWeek",
          }}
          events={events}
          eventContent={(eventInfo) => (
            <CustomEvent
              event={eventInfo.event}
              handleRemarkClick={handleRemarkClick}
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
          visibleRange={() => ({
            start: new Date(2000, 0, 1),
          })}
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
                <label className="block text-lg mb-1 text-gray-300">
                  Select Tasks
                </label>
                {tasksForDay.map((task) => (
                  <div key={task.title} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedTasks.includes(task.title)}
                      onChange={() => handleTaskSelection(task.title)}
                      className="cursor-pointer"
                    />
                    <span>{task.title}</span>
                  </div>
                ))}
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
    </div>
  );
};

export default TaskCalendar;
