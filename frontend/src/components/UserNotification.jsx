import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthProvider";
import { IoInformationCircleOutline } from "react-icons/io5";
import axios from "axios";

const UserNotification = () => {
  const [authUser] = useAuth();
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    axios
      .get(`https://task-reminder-4sqz.onrender.com/user/notifications/${authUser._id}`, {
        withCredentials: true,
      })
      .then((response) => {
        const unreadNotifications = response.data.notifications.filter(
          (notif) => notif.read === false
        );
        setNotifications(unreadNotifications);

        axios
          .put(
            `https://task-reminder-4sqz.onrender.com/user/notifications/read/${authUser._id}`,
            {},
            {
              withCredentials: true,
            }
          )
          .then(() => {})
          .catch((error) =>
            console.error("Error marking notifications as read:", error)
          );
      })
      .catch((error) => console.error(error));
  }, [authUser._id]);

  return (
    <div className="p-4 bg-white rounded-lg shadow-lg max-w-md mx-auto my-2 h-full">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Notifications</h2>
      {notifications.length > 0 ? (
        <ul className="space-y-4 max-h-72 lg:max-h-96 overflow-y-auto">
          {notifications.map((notif, index) => (
            <li
              key={index}
              className="bg-gray-100 hover:bg-gray-200 transition duration-300 p-4 rounded-lg flex items-start shadow-sm"
            >
              <div className="mr-3 mt-1">
                <IoInformationCircleOutline size={22} color="blue" />
              </div>
              <div>
                <p className="text-gray-800 font-semibold">{notif.message}</p>
                <span className="text-gray-500 text-sm">
                  {new Date(notif.date).toLocaleString()}
                </span>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500">No notifications yet.</p>
      )}
    </div>
  );
};

export default UserNotification;
