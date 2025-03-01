import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";
import axios from "axios";

const TaskList = () => {
  const [tasks, setTasks] = useState([]);
  const [authUser, setAuthUser] = useAuth();
  useEffect(() => {
    axios
      .get(`http://localhost:3000/task/${authUser._id}`, {
        withCredentials: true,
      })
      .then((response) => {
        setTasks(response.data);
      })
      .catch((error) => console.error(error));
  }, []);

  return (
    <div className="p-6 w-full h-screen xl:w-[960px] pt-16 lg:pt-6 xl:pl-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl">Task List</h2>
        <Link to="/task-reminder">
          <button
            className="bg-[#9D60EC] py-3 text-lg px-8 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 hover:bg-[#c095f8] duration-300 cursor-pointer"
            type="submit"
          >
            Add Task
          </button>
        </Link>
      </div>

      <div className="bg-[#FFFFFF2B] shadow-xl rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="bg-[#151025] text-white">
              <tr>
                <th className="p-4 text-left text-lg font-semibold">
                  Task Name
                </th>
                <th className="p-4 text-left text-lg font-semibold">
                  Category
                </th>
                <th className="p-4 text-left text-lg font-semibold">
                  Reminder Date
                </th>
                <th className="p-4 text-left text-lg font-semibold">
                  Reminder Time
                </th>
                <th className="p-4 text-left text-lg font-semibold">
                  Schedule Date
                </th>

                <th className="p-4 text-left text-lg font-semibold">
                  Task Duration
                </th>
                <th className="p-4 text-left text-lg font-semibold">
                  Task Description
                </th>
              </tr>
            </thead>

            <tbody>
              {tasks.length > 0 ? (
                tasks.map((task) => (
                  <tr
                    key={task._id}
                    className="border-b border-gray-200 hover:bg-gray-800 transition-all duration-200"
                  >
                    <td className="p-4">{task.taskName}</td>
                    <td className="p-4">{task.category}</td>
                    <td className="p-4">
                      {new Date(task.reminderDateTime).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      {new Date(task.reminderDateTime).toLocaleTimeString()}
                    </td>
                    <td className="p-4">
                      {new Date(task.scheduleDateTime).toLocaleDateString()}
                    </td>
                    <td className="p-4">{task.taskDuration}</td>
                    <td className="p-4">{task.taskDescription}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="p-4 text-center">
                    No tasks found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TaskList;
