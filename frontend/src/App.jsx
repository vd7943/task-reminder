import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./components/Home";
import Sidebar from "./components/Sidebar";
import { Toaster } from "react-hot-toast";
import { useAuth } from "./context/AuthProvider";
import Login from "./Auth/Login";
import SignUp from "./Auth/SignUp";
import AuthSuccess from "./Auth/AuthSuccess";
import SubscriptionPlan from "./components/SubscriptionPlan";
import Dashboard from "./components/Dashboard";
import UserList from "./components/UserList";
import TaskCalendar from "./components/TaskCalendar";
import AddPlan from "./components/AddPlan";
import Setting from "./components/Setting";
import AddUser from "./components/AddUser";
import PreBuiltPlanList from "./components/PreBuiltPlanList";
import CustomUserList from "./components/CustomUserList";
import ManageUserList from "./components/ManageUserList";
import CoinSetting from "./components/CoinSetting";
import UserNotification from "./components/UserNotification";
import RemarkList from "./components/RemarkList";
import PlanDetails from "./components/PlanDetails";
import PlanList from "./components/PlanList";
import UserSettings from "./components/UserSettings";
import ContactForm from "./components/ContactForm";
import PlanSetting from "./components/PlanSetting";
import { useEffect, useState } from "react";
import axios from "axios";

function App() {
  const [authUser, setAuthUser] = useAuth();
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

  return (
    <div className="flex h-fit">
      {authUser && <Sidebar />}
      <Routes>
        <Route
          path="/"
          element={authUser ? <Home /> : <Navigate to="/login" />}
        />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/auth-success" element={<AuthSuccess />} />

        <Route
          path="/subscription-plan"
          element={
            authUser?.role === "User" ? (
              <SubscriptionPlan />
            ) : (
              <Navigate to="/signup" />
            )
          }
        />

        <Route
          path="/admin-dashboard"
          element={
            authUser && authUser?.role === "Admin" ? (
              <Dashboard />
            ) : (
              <Navigate to="/" />
            )
          }
        />

        <Route
          path="/coin-setting"
          element={
            authUser && authUser?.role === "Admin" ? (
              <CoinSetting />
            ) : (
              <Navigate to="/" />
            )
          }
        />
        <Route
          path="/user-setting"
          element={
            authUser && authUser?.role === "Admin" ? (
              <UserSettings />
            ) : (
              <Navigate to="/" />
            )
          }
        />
        <Route
          path="/plan-setting"
          element={
            authUser && authUser?.role === "Admin" ? (
              <PlanSetting />
            ) : (
              <Navigate to="/" />
            )
          }
        />
        <Route
          path="/user-list"
          element={
            authUser && authUser?.role === "Admin" ? (
              <UserList />
            ) : (
              <Navigate to="/" />
            )
          }
        />
        <Route
          path="/custom-user-list"
          element={
            authUser && authUser?.role === "Admin" ? (
              <CustomUserList />
            ) : (
              <Navigate to="/" />
            )
          }
        />
        <Route
          path="/manage-user-list"
          element={
            authUser && authUser?.role === "Admin" ? (
              <ManageUserList />
            ) : (
              <Navigate to="/" />
            )
          }
        />
        <Route
          path="/user-notifications"
          element={
            authUser?.userType === ManageType ||
            authUser?.userType === CustomType ? (
              <UserNotification />
            ) : (
              <Navigate to="/" />
            )
          }
        />

        <Route path="*" element={<Home />} />
        <Route
          path="/remark-list"
          element={
            authUser?.userType === ManageType ||
            authUser?.userType === CustomType ? (
              <RemarkList />
            ) : (
              <Navigate to="/" />
            )
          }
        />

        <Route
          path="/task-calendar"
          element={
            authUser?.userType === ManageType ||
            authUser?.userType === CustomType ||
            authUser?.role === "Admin" ? (
              <TaskCalendar />
            ) : (
              <Navigate to="/" />
            )
          }
        />
        <Route
          path="/add-plan"
          element={
            authUser?.userType === CustomType || authUser?.role === "Admin" ? (
              <AddPlan />
            ) : (
              <Navigate to="/" />
            )
          }
        />

        <Route
          path="/plan-list"
          element={
            authUser?.userType === ManageType ||
            authUser?.userType === CustomType ||
            authUser?.role === "Admin" ? (
              <PlanList />
            ) : (
              <Navigate to="/" />
            )
          }
        />

        <Route path="/setting" element={<Setting />} />
        <Route
          path="/add-user"
          element={authUser?.role === "Admin" && <AddUser />}
        />

        <Route
          path="/pre-built-plans"
          element={
            authUser?.userType === CustomType ||
            authUser?.userType === ManageType ? (
              <PreBuiltPlanList />
            ) : (
              <Navigate to="/subscription-plan" />
            )
          }
        />
        <Route
          path="/plan-detail/:id"
          element={
            authUser?.userType === ManageType ||
            authUser?.userType === CustomType ||
            authUser?.role === "Admin" ? (
              <PlanDetails />
            ) : (
              <Navigate to="/" />
            )
          }
        />
        <Route
          path="/contact-us"
          element={authUser ? <ContactForm /> : <Navigate to="/" />}
        />
      </Routes>

      <Toaster />
    </div>
  );
}

export default App;
