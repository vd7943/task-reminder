import { useEffect, useRef, useState } from "react";
import { Calendar } from "react-calendar";
import { useAuth } from "../context/AuthProvider";
import { FaBars, FaCalendarAlt, FaTimes } from "react-icons/fa";
import { MdDashboard, MdHome } from "react-icons/md";
import {
  FaList,
  FaUserCog,
  FaTasks,
  FaFileAlt,
  FaCog,
  FaClipboardList,
} from "react-icons/fa";
import Logout from "../Auth/Logout";
import { Link, useLocation } from "react-router-dom";
import { TiUserAdd } from "react-icons/ti";
import { SiBuiltbybit } from "react-icons/si";
import { MdEmail } from "react-icons/md";
import { MdNavigateNext } from "react-icons/md";
import { MdNavigateBefore } from "react-icons/md";
import { LuHandCoins } from "react-icons/lu";

const Sidebar = () => {
  const [date, setDate] = useState(new Date());
  const [authUser, setAuthUser] = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);
  const sidebarRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    if (authUser?.subscriptionEndDate) {
      calculateTimeLeft(authUser.subscriptionEndDate);
    }
  }, []);

  const calculateTimeLeft = (subscriptionEndDate) => {
    const expiryDate = new Date(subscriptionEndDate);

    expiryDate.setHours(expiryDate.getHours() - 5);
    expiryDate.setMinutes(expiryDate.getMinutes() - 30);

    const now = new Date();
    const timeLeftMs = expiryDate - now;

    if (timeLeftMs <= 0) {
      setTimeLeft("Plz subscribe !");
      return;
    }

    const days = Math.floor(timeLeftMs / (1000 * 60 * 60 * 24));
    setTimeLeft(`${days} Days !`);
  };

  const subscriptionEndDate = authUser.subscriptionEndDate
    ? new Date(authUser.subscriptionEndDate)
    : null;

  if (subscriptionEndDate) {
    subscriptionEndDate.setHours(subscriptionEndDate.getHours() - 5);
    subscriptionEndDate.setMinutes(subscriptionEndDate.getMinutes() - 30);
  }

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <button
        className="md:hidden fixed top-4 left-4 bg-[#151025] text-white p-2 rounded-lg shadow-md z-10"
        onClick={() => setIsOpen(true)}
      >
        <FaBars size={26} />
      </button>
      <div
        ref={sidebarRef}
        className={`fixed md:static top-0 left-0 h-full md:h-auto z-40 bg-[#151025] text-white p-4 flex flex-col shadow-lg transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        md:w-76 w-[100vw]`}
      >
        <button
          className="absolute top-4 right-1 text-white md:hidden"
          onClick={() => setIsOpen(false)}
        >
          <FaTimes size={26} />
        </button>
        <ul className="space-y-3">
          <Link to="/" className="pb-10" onClick={() => setIsOpen(false)}>
            <li
              className={`flex items-center space-x-3 p-2 rounded-lg cursor-pointer transition-all hover:bg-[#FFFFFF2B]
                ${isActive("/") ? "bg-[#FFFFFF2B]" : ""}`}
            >
              <div className="flex items-center justify-center gap-4">
                <div className="rounded-full text-yellow-400">
                  <MdHome size={18} />
                </div>
                <div className="text-xl font-medium flex items-center gap-2">
                  Home
                </div>
              </div>
            </li>
          </Link>

          {authUser?.role === "Admin" && (
            <Link
              to="/user-list"
              className="pb-10"
              onClick={() => setIsOpen(false)}
            >
              <li
                className={`flex items-center space-x-3 p-2 rounded-lg cursor-pointer transition-all hover:bg-[#FFFFFF2B]
                ${isActive("/user-list") ? "bg-[#FFFFFF2B]" : ""}`}
              >
                <div className="flex items-center justify-center gap-4">
                  <div className="rounded-full text-pink-400">
                    <FaClipboardList />
                  </div>
                  <div className="text-xl font-medium flex items-center gap-2">
                    User List
                  </div>
                </div>
              </li>
            </Link>
          )}
          {authUser?.role === "Admin" && (
            <Link
              to="/add-user"
              className="pb-10"
              onClick={() => setIsOpen(false)}
            >
              <li
                className={`flex items-center space-x-3 p-2 rounded-lg cursor-pointer transition-all hover:bg-[#FFFFFF2B]
                ${isActive("/add-user") ? "bg-[#FFFFFF2B]" : ""}`}
              >
                <div className="flex items-center justify-center gap-4">
                  <div className="rounded-full text-purple-400">
                    <TiUserAdd />
                  </div>
                  <div className="text-xl font-medium flex items-center gap-2">
                    Add User
                  </div>
                </div>
              </li>
            </Link>
          )}
          {/* {(authUser?.userType === "Custom" ||
            authUser?.userType === "Manage") && (
            <Link
              to="/task-reminder"
              className="pb-10"
              onClick={() => setIsOpen(false)}
            >
              <li
                className={`flex items-center space-x-3 p-2 rounded-lg cursor-pointer transition-all hover:bg-[#FFFFFF2B]
                ${isActive("/task-reminder") ? "bg-[#FFFFFF2B]" : ""}`}
              >
                <div className="flex items-center justify-center gap-4">
                  <div className="rounded-full text-pink-600">
                    <FaTasks />
                  </div>
                  <div className="text-xl font-medium flex items-center gap-2">
                    Add Task
                  </div>
                </div>
              </li>
            </Link>
          )} */}
          {/* {(authUser?.userType === "Custom" ||
            authUser?.userType === "Manage") && (
            <Link
              to="/task-list"
              className="pb-10"
              onClick={() => setIsOpen(false)}
            >
              <li
                className={`flex items-center space-x-3 p-2 rounded-lg cursor-pointer transition-all hover:bg-[#FFFFFF2B]
                ${isActive("/task-list") ? "bg-[#FFFFFF2B]" : ""}`}
              >
                <div className="flex items-center justify-center gap-4">
                  <div className="rounded-full text-blue-400">
                    <FaList />
                  </div>
                  <div className="text-xl font-medium flex items-center gap-2">
                    Task List
                  </div>
                </div>
              </li>
            </Link>
          )} */}
          {authUser?.role === "User" && (
            <Link
              to="/subscription-plan"
              className="pb-10"
              onClick={() => setIsOpen(false)}
            >
              <li
                className={`flex items-center space-x-3 p-2 rounded-lg cursor-pointer transition-all hover:bg-[#FFFFFF2B]
                ${isActive("/subscription-plan") ? "bg-[#FFFFFF2B]" : ""}`}
              >
                <div className="flex items-center justify-center gap-4">
                  <div className="rounded-full text-red-400">
                    <FaFileAlt />
                  </div>
                  <div className="text-xl font-medium flex items-center gap-2">
                    Subscription Plan
                  </div>
                </div>
              </li>
            </Link>
          )}

          {(authUser?.userType === "Custom" || authUser?.role === "Admin") && (
            <Link
              to="/add-plan"
              className="pb-10"
              onClick={() => setIsOpen(false)}
            >
              <li
                className={`flex items-center space-x-3 p-2 rounded-lg cursor-pointer transition-all hover:bg-[#FFFFFF2B]
                ${isActive("/add-plan") ? "bg-[#FFFFFF2B]" : ""}`}
              >
                <div className="flex items-center justify-center gap-4">
                  <div className="rounded-full text-orange-400">
                    <FaTasks />
                  </div>
                  <div className="text-xl font-medium flex items-center gap-2">
                    Add Plan
                  </div>
                </div>
              </li>
            </Link>
          )}
          {(authUser?.role === "Admin" || authUser?.userType === "Manage") && (
            <Link
              to="/pre-built-plans"
              className="pb-10"
              onClick={() => setIsOpen(false)}
            >
              <li
                className={`flex items-center space-x-3 p-2 rounded-lg cursor-pointer transition-all hover:bg-[#FFFFFF2B]
                ${isActive("/pre-built-plans") ? "bg-[#FFFFFF2B]" : ""}`}
              >
                <div className="flex items-center justify-center gap-4">
                  <div className="rounded-full text-amber-700">
                    <SiBuiltbybit />
                  </div>
                  <div className="text-xl font-medium flex items-center gap-2">
                    Pre Built Plans
                  </div>
                </div>
              </li>
            </Link>
          )}
          {authUser?.userType === "Custom" && (
            <Link
              to="/pre-built-plans"
              className="pb-10"
              onClick={() => setIsOpen(false)}
            >
              <li
                className={`flex items-center space-x-3 p-2 rounded-lg cursor-pointer transition-all hover:bg-[#FFFFFF2B]
                ${isActive("/pre-built-plans") ? "bg-[#FFFFFF2B]" : ""}`}
              >
                <div className="flex items-center justify-center gap-4">
                  <div className="rounded-full text-amber-700">
                    <SiBuiltbybit />
                  </div>
                  <div className="text-xl font-medium flex items-center gap-2">
                    Custom Plan List
                  </div>
                </div>
              </li>
            </Link>
          )}

          {(authUser?.userType === "Custom" ||
            authUser?.userType === "Manage") && (
            <Link
              to="/remark"
              className="pb-10"
              onClick={() => setIsOpen(false)}
            >
              <li
                className={`flex items-center space-x-3 p-2 rounded-lg cursor-pointer transition-all hover:bg-[#FFFFFF2B]
                ${isActive("/remark") ? "bg-[#FFFFFF2B]" : ""}`}
              >
                <div className="flex items-center justify-center gap-4">
                  <div className="rounded-full text-yellow-400">
                    <FaUserCog />
                  </div>
                  <div className="text-xl font-medium flex items-center gap-2">
                    Remark
                  </div>
                </div>
              </li>
            </Link>
          )}

          {(authUser?.userType === "Custom" ||
            authUser?.userType === "Manage" ||
            authUser?.role === "Admin") && (
            <Link
              to="/task-calendar"
              className="pb-10"
              onClick={() => setIsOpen(false)}
            >
              <li
                className={`flex items-center space-x-3 p-2 rounded-lg cursor-pointer transition-all hover:bg-[#FFFFFF2B]
                ${isActive("/task-calendar") ? "bg-[#FFFFFF2B]" : ""}`}
              >
                <div className="flex items-center justify-center gap-4">
                  <div className="rounded-full text-pink-400">
                    <FaCalendarAlt />
                  </div>
                  <div className="text-xl font-medium flex items-center gap-2">
                    Calendar
                  </div>
                </div>
              </li>
            </Link>
          )}
          {authUser?.role === "Admin" && (
            <Link
              to="/email-template"
              className="pb-10"
              onClick={() => setIsOpen(false)}
            >
              <li
                className={`flex items-center space-x-3 p-2 rounded-lg cursor-pointer transition-all hover:bg-[#FFFFFF2B]
                ${isActive("/email-template") ? "bg-[#FFFFFF2B]" : ""}`}
              >
                <div className="flex items-center justify-center gap-4">
                  <div className="rounded-full text-purple-400">
                    <MdEmail />
                  </div>
                  <div className="text-xl font-medium flex items-center gap-2">
                    Email Template
                  </div>
                </div>
              </li>
            </Link>
          )}
          {authUser?.role === "Admin" && (
            <Link
              to="/coin-setting"
              className="pb-10"
              onClick={() => setIsOpen(false)}
            >
              <li
                className={`flex items-center space-x-3 p-2 rounded-lg cursor-pointer transition-all hover:bg-[#FFFFFF2B]
                ${isActive("/coin-setting") ? "bg-[#FFFFFF2B]" : ""}`}
              >
                <div className="flex items-center justify-center gap-4">
                  <div className="rounded-full text-yellow-400">
                    <LuHandCoins />
                  </div>
                  <div className="text-xl font-medium flex items-center gap-2">
                    Coin settings
                  </div>
                </div>
              </li>
            </Link>
          )}
          <Link
            to="/setting"
            className="pb-10"
            onClick={() => setIsOpen(false)}
          >
            <li
              className={`flex items-center space-x-3 p-2 rounded-lg cursor-pointer transition-all hover:bg-[#FFFFFF2B]
                ${isActive("/setting") ? "bg-[#FFFFFF2B]" : ""}`}
            >
              <div className="flex items-center justify-center gap-4">
                <div className="rounded-full text-blue-400">
                  <FaCog />
                </div>
                <div className="text-xl font-medium flex items-center gap-2">
                  Setting
                </div>
              </div>
            </li>
          </Link>
          <div className="pt-2 pl-2">{authUser && <Logout />}</div>
        </ul>
        {authUser.role === "User" && (
          <div className="mt-8 lg:mt-4">
            <div className="flex flex-row space-x-[3px] pl-2 text-[13px] font-semibold">
              <h4>Subscription Ends in:</h4>
              <span className="text-red-500">
                {authUser.userType === "Regular" ? "Plz subscribe!" : timeLeft}
              </span>
            </div>
          </div>
        )}
        {authUser.role === "User" && (
          <div className="mt-8 lg:mt-4">
            <div className="flex flex-row space-x-[3px] pl-2 text-[13px] font-semibold">
              <h4>Subscription End Date:</h4>
              <span className="text-red-500">
                {subscriptionEndDate === null
                  ? ""
                  : new Date(subscriptionEndDate).toDateString()}
              </span>
            </div>
          </div>
        )}

        <div className="mt-8 lg:mt-4">
          <div className="flex items-center space-x-2 pl-2 text-lg font-semibold">
            <span className="text-white">
              {date.toLocaleString("default", { month: "long" })}
            </span>
            <span className="text-red-500">{date.getFullYear()}</span>
          </div>
          <Calendar
            onChange={setDate}
            value={date}
            className="mt-2 rounded-lg bg-gray-800 p-0.5 text-white text-center text-md border border-gray-700 shadow-lg"
            tileClassName={({ date: tileDate }) =>
              `text-center p-2 rounded-lg cursor-pointer transition-all duration-300 w-full
      ${
        tileDate.toDateString() === new Date().toDateString()
          ? "bg-[#9D60EC] text-[#151025] font-bold shadow-md animate-pulse"
          : "hover:bg-gray-600 text-gray-300"
      }`
            }
            next2Label={null}
            prev2Label={null}
            prevLabel={
              <span className="text-xl cursor-pointer">
                <MdNavigateBefore size={23} />
              </span>
            }
            nextLabel={
              <span className="text-xl cursor-pointer">
                <MdNavigateNext size={23} />
              </span>
            }
          />
        </div>
      </div>
    </>
  );
};

export default Sidebar;
