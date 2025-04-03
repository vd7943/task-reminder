import { useEffect, useRef, useState } from "react";
import { Calendar } from "react-calendar";
import { useAuth } from "../context/AuthProvider";
import { FaBars, FaCalendarAlt, FaTimes } from "react-icons/fa";
import { MdHome } from "react-icons/md";
import { GrValidate } from "react-icons/gr";
import { FaListUl } from "react-icons/fa";
import {
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
import { MdNavigateNext } from "react-icons/md";
import { MdNavigateBefore } from "react-icons/md";
import { LuHandCoins } from "react-icons/lu";
import { RiUserSettingsFill } from "react-icons/ri";
import { MdOutlineSupportAgent } from "react-icons/md";
import { RiListSettingsLine } from "react-icons/ri";

const Sidebar = () => {
  const [date, setDate] = useState(new Date());
  const [authUser, setAuthUser] = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const sidebarRef = useRef(null);
  const location = useLocation();

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
          {(authUser?.userType === "Custom" ||
            authUser?.userType === "Manage") && (
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
          {(authUser?.userType === "Custom" ||
            authUser?.userType === "Manage" ||
            authUser?.role === "Admin") && (
            <Link
              to="/plan-list"
              className="pb-10"
              onClick={() => setIsOpen(false)}
            >
              <li
                className={`flex items-center space-x-3 p-2 rounded-lg cursor-pointer transition-all hover:bg-[#FFFFFF2B]
                ${isActive("/plan-list") ? "bg-[#FFFFFF2B]" : ""}`}
              >
                <div className="flex items-center justify-center gap-4">
                  <div className="rounded-full text-red-600">
                    <FaListUl />
                  </div>
                  <div className="text-xl font-medium flex items-center gap-2">
                    Plan List
                  </div>
                </div>
              </li>
            </Link>
          )}

          {(authUser?.userType === "Custom" ||
            authUser?.userType === "Manage") && (
            <Link
              to="/remark-list"
              className="pb-10"
              onClick={() => setIsOpen(false)}
            >
              <li
                className={`flex items-center space-x-3 p-2 rounded-lg cursor-pointer transition-all hover:bg-[#FFFFFF2B]
                ${isActive("/remark-list") ? "bg-[#FFFFFF2B]" : ""}`}
              >
                <div className="flex items-center justify-center gap-4">
                  <div className="rounded-full text-yellow-400">
                    <FaUserCog />
                  </div>
                  <div className="text-xl font-medium flex items-center gap-2">
                    Remarks
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

          {(authUser?.userType === "Custom" ||
            authUser?.userType === "Manage") && (
            <Link
              to="/validation"
              className="pb-10"
              onClick={() => setIsOpen(false)}
            >
              <li
                className={`flex items-center space-x-3 p-2 rounded-lg cursor-pointer transition-all hover:bg-[#FFFFFF2B]
                ${isActive("/validation") ? "bg-[#FFFFFF2B]" : ""}`}
              >
                <div className="flex items-center justify-center gap-4">
                  <div className="rounded-full text-green-400">
                    <GrValidate />
                  </div>
                  <div className="text-xl font-medium flex items-center gap-2">
                    Validation
                  </div>
                </div>
              </li>
            </Link>
          )}

          {authUser?.role === "Admin" && (
            <Link
              to="/user-setting"
              className="pb-10"
              onClick={() => setIsOpen(false)}
            >
              <li
                className={`flex items-center space-x-3 p-2 rounded-lg cursor-pointer transition-all hover:bg-[#FFFFFF2B]
                ${isActive("/user-setting") ? "bg-[#FFFFFF2B]" : ""}`}
              >
                <div className="flex items-center justify-center gap-4">
                  <div className="rounded-full text-gray-400">
                    <RiUserSettingsFill />
                  </div>
                  <div className="text-xl font-medium flex items-center gap-2">
                    User Settings
                  </div>
                </div>
              </li>
            </Link>
          )}

          {authUser?.role === "Admin" && (
            <Link
              to="/plan-setting"
              className="pb-10"
              onClick={() => setIsOpen(false)}
            >
              <li
                className={`flex items-center space-x-3 p-2 rounded-lg cursor-pointer transition-all hover:bg-[#FFFFFF2B]
                ${isActive("/plan-setting") ? "bg-[#FFFFFF2B]" : ""}`}
              >
                <div className="flex items-center justify-center gap-4">
                  <div className="rounded-full text-amber-800">
                    <RiListSettingsLine />
                  </div>
                  <div className="text-xl font-medium flex items-center gap-2">
                    Plan Setting
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
                    Coin Settings
                  </div>
                </div>
              </li>
            </Link>
          )}
          {authUser?.role === "User" && (
            <Link
              to="/contact-us"
              className="pb-10"
              onClick={() => setIsOpen(false)}
            >
              <li
                className={`flex items-center space-x-3 p-2 rounded-lg cursor-pointer transition-all hover:bg-[#FFFFFF2B]
                ${isActive("/contact-us") ? "bg-[#FFFFFF2B]" : ""}`}
              >
                <div className="flex items-center justify-center gap-4">
                  <div className="rounded-full text-red-400">
                    <MdOutlineSupportAgent />
                  </div>
                  <div className="text-xl font-medium flex items-center gap-2">
                    Contact us
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
                  Profile Setting
                </div>
              </div>
            </li>
          </Link>
          <div className="pt-2 pl-2">{authUser && <Logout />}</div>
        </ul>

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
