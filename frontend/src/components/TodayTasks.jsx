import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthProvider";
import axios from "axios";
import dayjs from "dayjs";

const TodayTasks = () => {
  const [mergedTasks, setMergedTasks] = useState([]);
  const [authUser] = useAuth();

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const today = dayjs().format("YYYY-MM-DD");

        const plansResponse = await axios.get(
          `http://localhost:3000/plan/get-today-plan/${authUser._id}`,
          { withCredentials: true }
        );

        const todayPlans = plansResponse.data
          .map((plan) => ({
            ...plan,
            reminders: plan.reminders.map((reminder) => ({
              ...reminder,
              schedule: reminder.schedule.filter(
                (sched) => sched.date === today
              ),
            })),
          }))
          .filter((plan) =>
            plan.reminders.some((reminder) => reminder.schedule.length > 0)
          );

        const tasksResponse = await axios.get(
          `http://localhost:3000/task/${authUser._id}`,
          { withCredentials: true }
        );

        const todayTasks = tasksResponse.data.filter(
          (task) => dayjs(task.scheduleDateTime).format("YYYY-MM-DD") === today
        );

        const mergedTasksMap = {};

        todayPlans.forEach((plan) => {
          plan.reminders.forEach((reminder) => {
            reminder.schedule.forEach((sched) => {
              const key = `${sched.date} ${sched.time}`;
              if (!mergedTasksMap[key]) {
                mergedTasksMap[key] = {
                  time: sched.time,
                  date: sched.date,
                  tasks: [],
                };
              }
              mergedTasksMap[key].tasks.push(plan.planName);
            });
          });
        });

        todayTasks.forEach((task) => {
          const taskTime = dayjs(task.scheduleDateTime).format("HH:mm");
          const taskDate = dayjs(task.scheduleDateTime).format("YYYY-MM-DD");
          const key = `${taskDate} ${taskTime}`;

          if (!mergedTasksMap[key]) {
            mergedTasksMap[key] = {
              time: taskTime,
              date: taskDate,
              tasks: [],
            };
          }

          mergedTasksMap[key].tasks.push(task.taskName);
        });

        const mergedTasksArray = Object.values(mergedTasksMap).sort((a, b) =>
          a.time.localeCompare(b.time)
        );

        setMergedTasks(mergedTasksArray);
      } catch (error) {
        console.error(error);
      }
    };

    fetchTasks();
  }, []);

  return (
    <div className="flex flex-col items-center bg-[#FFFFFF2B] p-6 rounded-xl shadow-2xl w-full max-w-4xl mx-auto relative border border-gray-700 mb-6">
      <h2 className="text-3xl text-white mb-6">Today's Tasks</h2>

      {mergedTasks.length === 0 ? (
        <p className="text-gray-200 text-lg text-center">
          No tasks scheduled for today. 🎉
        </p>
      ) : (
        <div className="grid gap-6 w-full">
          {mergedTasks.map((task, index) => (
            <div
              key={index}
              className="p-6 border border-gray-500 bg-white/10 backdrop-blur-lg rounded-xl shadow-lg hover:scale-101 transition-transform"
            >
              <h3 className="text-xl font-semibold text-white mb-2">
                📅 {task.date}
              </h3>
              <ul>
                <li className="p-4 bg-gray-900/50 border border-gray-400 rounded-lg mt-3 flex justify-between items-center shadow-md">
                  <span className="text-xl font-semibold text-blue-400">
                    ⏰ {task.time}
                  </span>
                  <strong className="text-white text-lg">
                    {task.tasks.join(", ")}
                  </strong>
                </li>
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TodayTasks;
