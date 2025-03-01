import React, { useEffect, useRef, useState } from "react";
import { PiCoinBold } from "react-icons/pi";
import { IoNotifications } from "react-icons/io5";
import { useAuth } from "../context/AuthProvider";
import UserMilestone from "./UserMilestone";
import Dashboard from "./Dashboard";
import AppreciationList from "./AppreciationList";
import TodayTasks from "./TodayTasks";
import UserNotification from "./UserNotification";
import axios from "axios";

const Home = () => {
  const [authUser, setAuthUser] = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef(null);
  const [unreadCount, setUnreadCount] = useState(0);

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };

  useEffect(() => {
    axios
      .get(`https://task-reminder-4sqz.onrender.com/user/notifications/${authUser._id}`, {
        withCredentials: true,
      })
      .then((response) => {
        const unread = response.data.notifications.filter(
          (notif) => notif.read === false
        ).length;
        setUnreadCount(unread);
      })
      .catch((error) => console.error(error));
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <>
      {authUser.role === "User" && (
        <div className="relative flex-1 p-6 mt-8 lg:mt-0 lg:p-8 h-auto">
          <div className="absolute top-0 lg:top-4 right-18 flex items-center bg-gradient-to-r from-yellow-400 to-yellow-600 text-white px-4 lg:px-6 py-2 rounded-full shadow-lg">
            <PiCoinBold className="text-lg font-semibold mr-2" />
            <span className="text-lg font-bold">{authUser.coins}</span>
          </div>
          <div
            className="absolute top-2 lg:top-6 right-6 flex items-center cursor-pointer"
            onClick={toggleNotifications}
            ref={notificationRef}
          >
            <IoNotifications size={24} className="font-semibold mr-2" />
            {unreadCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                {unreadCount}
              </span>
            )}
            {showNotifications && (
              <div className="absolute top-full mt-4 right-0 w-80 bg-white shadow-lg rounded-lg z-50">
                <UserNotification />
              </div>
            )}
          </div>
          <h2 className="text-2xl lg:text-3xl pb-4 mt-6 lg:mt-0 text-center lg:text-left">
            {authUser.userType} User
          </h2>
          <TodayTasks />

          <UserMilestone />

          <div className="flex flex-col lg:flex-row justify-center gap-6 mt-4">
            <AppreciationList />
          </div>
        </div>
      )}
      {authUser.role === "Admin" && <Dashboard />}
    </>
  );
};

export default Home;
