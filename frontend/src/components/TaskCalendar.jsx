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
import dayjs from "dayjs";

const TaskCalendar = () => {
  const [events, setEvents] = useState([]);
  const [authUser] = useAuth();
  const [isRemarkModalOpen, setIsRemarkModalOpen] = useState(false);
  const [selectedRemarkTask, setSelectedRemarkTask] = useState(null);
  const [selectedTasks, setSelectedTasks] = useState([]);
  const [tasksForDay, setTasksForDay] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const [remarks, setRemarks] = useState([]);
  const [coinRules, setCoinRules] = useState({});
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [selectedPayTask, setSelectedPayTask] = useState(null);
  const [calendarKey, setCalendarKey] = useState(0);
  const [paidTasks, setPaidTasks] = useState([]);
  const [existingRemarksForTasks, setExistingRemarksForTasks] = useState({});
  const [userTypes, setUserTypes] = useState([]);

  const fetchUserTypes = async () => {
    try {
      const response = await axios.get(
        "https://task-reminder-4sqz.onrender.com/config/get-user-type"
      );
      setUserTypes(response.data.userTypes || []);
    } catch (error) {
      console.error("Failed to fetch user types.");
    }
  };

  useEffect(() => {
    fetchUserTypes();
  }, []);

  const RegularType = userTypes[0];
  const CustomType = userTypes[1];
  const ManageType = userTypes[2];

  const fetchData = async () => {
    try {
      const [planRes, remarkRes, coinRuleRes] = await Promise.all([
        axios.get(`https://task-reminder-4sqz.onrender.com/plan/get-user-plan/${authUser._id}`, {
          withCredentials: true,
        }),
        axios.get(`https://task-reminder-4sqz.onrender.com/remark/${authUser._id}`, {
          withCredentials: true,
        }),
        axios.get(`https://task-reminder-4sqz.onrender.com/coins/coin-rules`),
      ]);

      const remarks = remarkRes.data?.remarks || [];
      setRemarks(remarks);

      const fetchedRules = coinRuleRes.data.rules;
      if (fetchedRules.length > 0) {
        const rule = fetchedRules[0];
        setCoinRules(rule.addPastRemarkCoins || "");
      }

      const activePlans = planRes.data?.plans?.filter(
        (plan) => plan.status === "Active"
      );

      const planEvents = activePlans.flatMap((plan) =>
        plan.tasks.flatMap((task) =>
          task.schedule.map((scheduleItem) => {
            const startTime = new Date(
              `${scheduleItem.date}T${scheduleItem.time}:00`
            );
            const endTime = new Date(
              startTime.getTime() + 23.98 * 60 * 60 * 1000
            );
            const remarkExists = remarks.some(
              (r) =>
                r.taskId?.toString() === task._id?.toString() &&
                dayjs(r.taskDate).format("YYYY-MM-DD") ===
                  dayjs(scheduleItem.date).format("YYYY-MM-DD")
            );

            const isToday = dayjs(scheduleItem.date).isSame(dayjs(), "day");
            const isPast = dayjs(scheduleItem.date).isBefore(dayjs(), "day");

            let backgroundColor = "blue";

            if (remarkExists) {
              backgroundColor = "green";
            } else if (isPast) {
              backgroundColor = "red";
            }

            return {
              id: task._id,
              taskId: task._id,
              title: task.taskName,
              start: startTime,
              end: endTime,
              date: scheduleItem.date,
              backgroundColor,
              type: "plan",
              planId: plan._id,
            };
          })
        )
      );

      setEvents(planEvents);
      setCalendarKey((prev) => prev + 1);
    } catch (err) {
      console.error("Error fetching data", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRemarkClick = (task) => {
    const taskDate = dayjs(task.date).startOf("day");
    const today = dayjs().startOf("day");

    setSelectedRemarkTask(task);
    setSelectedDate(task.start);
    setSelectedPlanId(task.extendedProps.planId);

    const dayTasks = events.filter(
      (e) =>
        dayjs(e.start).format("YYYY-MM-DD") ===
        dayjs(task.start).format("YYYY-MM-DD")
    );

    const sameNameTasks = dayTasks.filter((e) => e.title === task.title);

    setTasksForDay(dayTasks);

    const dayRemarks = remarks.filter(
      (r) =>
        dayjs(r.taskDate).format("YYYY-MM-DD") ===
        dayjs(task.date).format("YYYY-MM-DD")
    );

    const isPast = taskDate.isBefore(today);
    const remarkedTaskIds = dayRemarks.map((r) => r.taskId?.toString());
    const unremarkedTasks = sameNameTasks.filter(
      (t) => !remarkedTaskIds.includes(t.id?.toString())
    );

    if (isPast) {
      if (unremarkedTasks.length === 0) {
        setIsReadOnly(true);

        const mappedTasks = sameNameTasks.map((e) => {
          const existingRemark = dayRemarks.find(
            (r) => String(r.taskId) === String(e.id)
          );
          return {
            id: e.id,
            title: e.title,
            rating: existingRemark?.taskReview || 0,
            planId: e.extendedProps.planId,
          };
        });
        setSelectedTasks(mappedTasks);

        const remarksMap = {};
        dayRemarks.forEach((r) => {
          remarksMap[r.taskId] = r;
        });
        setExistingRemarksForTasks(remarksMap);

        const summary =
          dayRemarks.find((r) => r.taskName === task.title)?.taskSummary || "";
        setValue("taskSummary", summary);
        setIsRemarkModalOpen(true);
      } else {
        setSelectedPayTask(task);
        setShowPayPopup(true);
      }
    } else {
      setIsReadOnly(false);
      const mappedTasks = sameNameTasks.map((e) => ({
        id: e.id,
        title: e.title,
        rating: 0,
        planId: e.planId,
      }));
      setSelectedTasks(mappedTasks);
      setExistingRemarksForTasks({});
      setValue("taskSummary", "");
      setIsRemarkModalOpen(true);
    }
  };

  const {
    register: remarkRegister,
    handleSubmit: handleRemarkSubmit,
    setValue,
    reset: resetRemarkForm,
  } = useForm();

  const handleTaskSelection = (task) => {
    const exists = selectedTasks.find((t) => t.id === task.id);
    if (exists) {
      setSelectedTasks(selectedTasks.filter((t) => t.id !== task.id));
    } else {
      setSelectedTasks([
        ...selectedTasks,
        {
          id: task.id,
          title: task.title,
          rating: 0,
          planId: task.planId,
        },
      ]);
    }
  };

  const handleStarClick = (id, rating) => {
    setSelectedTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, rating } : t))
    );
  };

  const onRemarkSubmit = async (data) => {
    if (!selectedRemarkTask || selectedTasks.length === 0) {
      toast.error("Please select task(s) and fill the summary.");
      return;
    }

    const taskDate = new Date(selectedRemarkTask.start);
    taskDate.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const isPast = taskDate < today;

    for (const task of selectedTasks) {
      try {
        const remarkData = {
          taskId: task.id,
          taskName: task.title,
          taskDate: selectedRemarkTask.start.toLocaleDateString("en-CA"),
          taskReview: task.rating,
          taskSummary: data.taskSummary,
          userId: authUser._id,
          planId: task.planId,
          isPaidForPastRemark: isPast,
        };

        const res = await axios.post(
          "https://task-reminder-4sqz.onrender.com/remark/set-remark",
          remarkData,
          { headers: { "Content-Type": "application/json" } }
        );

        toast.success(res?.data?.message);
        fetchData();
      } catch (error) {
        toast.error(error?.response?.data?.message);
      }
    }

    setIsRemarkModalOpen(false);
    resetRemarkForm();
    setSelectedTasks([]);
    setSelectedRemarkTask(null);
    setSelectedDate(null);
    setSelectedPlanId(null);
  };

  const eventStyleGetter = (event, viewType) => {
    return {
      style: {
        borderRadius: "6px",
        padding: viewType === "dayGridMonth" ? "2px 6px" : "4px",
        border: "none",
        fontSize: viewType === "dayGridMonth" ? "9px" : "11px",
        fontWeight: "600",
        minHeight: "18px",
        whiteSpace: "nowrap",
        backgroundColor,
        eventBackgroundColor: backgroundColor,
        eventBorderColor: backgroundColor,
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
    const bgColor = event.backgroundColor;

    return (
      <div
        className={`p-1 rounded-md w-full bg-opacity-90 ${
          viewType === "dayGridMonth"
            ? "shadow-md overflow-hidden truncate px-2 flex flex-col justify-between" // Month view styling
            : "shadow-lg p-2 flex items-center justify-between" // List view styling
        }`}
        style={{
          backgroundColor: bgColor,
          color: "white",
        }}
      >
        {viewType === "dayGridMonth" ? (
          <>
            <span className="font-semibold text-[10px] lg:text-sm text-white truncate">
              {event.title}
            </span>

            <div className="flex justify-between items-center w-full">
              <div className="flex gap-2">
                {(authUser.userType === CustomType ||
                  authUser.userType === ManageType) && (
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
              {(authUser.userType === CustomType ||
                authUser.userType === ManageType) && (
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
          key={calendarKey}
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
          eventClick={(info) => handleRemarkClick(info.event)}
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
        <div className="fixed inset-0 z-50 bg-[#FFFFFF2B] bg-opacity-50 backdrop-blur-lg flex items-center justify-center overflow-y-auto">
          <div className="bg-gray-800 p-6 my-auto rounded-xl w-full max-w-2xl relative text-white">
            <h2 className="text-2xl mb-4 text-center">Add Remark</h2>
            <form onSubmit={handleRemarkSubmit(onRemarkSubmit)}>
              <div className="flex flex-wrap gap-4">
                {tasksForDay.map((task) => {
                  const selected =
                    selectedTasks.find((t) => t.id === task.id) || {};
                  const isChecked = !!selectedTasks.find(
                    (t) => t.id === task.id
                  );
                  const existingRemark = remarks.find(
                    (r) =>
                      r.taskId === task.id &&
                      r.taskDate === dayjs(task.start).format("YYYY-MM-DD")
                  );

                  return (
                    <div
                      key={task.id}
                      className="w-full md:w-[48%] bg-gray-900 p-3 rounded-lg border border-gray-700 relative"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {!isReadOnly &&
                            (dayjs(task.start).isSame(dayjs(), "day") ||
                              paidTasks.includes(task.id)) && (
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => handleTaskSelection(task)}
                              />
                            )}
                          <span>{task.title}</span>
                        </div>
                      </div>

                      {(isChecked || existingRemark) && (
                        <>
                          <div className="mt-2">
                            <label className="text-sm font-semibold">
                              Rating
                            </label>
                            <div className="flex gap-1 mt-1">
                              {[1, 2, 3, 4, 5].map((star) => {
                                const ratingToShow = isReadOnly
                                  ? existingRemark?.rating
                                  : selected.rating;
                                return (
                                  <FaStar
                                    key={star}
                                    size={20}
                                    className={`${
                                      ratingToShow >= star
                                        ? "text-yellow-400"
                                        : "text-gray-600"
                                    } ${!isReadOnly ? "cursor-pointer" : ""}`}
                                    onClick={() =>
                                      !isReadOnly &&
                                      handleStarClick(task.id, star)
                                    }
                                  />
                                );
                              })}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="mt-4">
                <label className="text-sm font-semibold">Day Summary</label>
                <textarea
                  rows={4}
                  {...remarkRegister("taskSummary", { required: true })}
                  readOnly={isReadOnly}
                  defaultValue={
                    isReadOnly
                      ? remarks.find(
                          (r) =>
                            new Date(r.taskDate).toDateString() ===
                            new Date(selectedRemarkTask.start).toDateString()
                        )?.taskSummary || ""
                      : ""
                  }
                  className="w-full p-2 mt-2 bg-gray-700 border border-gray-600 rounded"
                />
              </div>

              {!isReadOnly && (
                <div className="flex justify-end mt-6 gap-4">
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-500 cursor-pointer px-6 py-2 rounded text-white"
                  >
                    Submit
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsRemarkModalOpen(false)}
                    className="bg-red-600 hover:bg-red-500 cursor-pointer px-6 py-2 rounded text-white"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </form>
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-white"
              onClick={() => setIsRemarkModalOpen(false)}
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
