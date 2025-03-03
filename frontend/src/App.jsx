import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import Home from "./components/Home";
import Sidebar from "./components/Sidebar";
import { Toaster } from "react-hot-toast";
import { useAuth } from "./context/AuthProvider";
import Login from "./Auth/Login";
import SignUp from "./Auth/SignUp";
import AuthSuccess from "./Auth/AuthSuccess";
import SubscriptionPlan from "./components/SubscriptionPlan";
import TaskReminder from "./components/TaskReminder";
import Dashboard from "./components/Dashboard";
import UserList from "./components/UserList";
import { useEffect } from "react";
import Remark from "./components/Remark";
import TaskList from "./components/TaskList";
import TaskCalendar from "./components/TaskCalendar";
import AddPlan from "./components/AddPlan";
import Setting from "./components/Setting";
import AddUser from "./components/AddUser";
import PreBuiltPlanList from "./components/PreBuiltPlanList";
import EmailTemplate from "./components/EmailTemplate";
import CustomUserList from "./components/CustomUserList";
import ManageUserList from "./components/ManageUserList";
import CoinSetting from "./components/CoinSetting";
import UserNotification from "./components/UserNotification";

function App() {
  const [authUser, setAuthUser] = useAuth();

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

        {/* <Route
          path="/task-reminder"
          element={
            authUser?.userType === "Manage" ||
            authUser?.userType === "Custom" ? (
              <TaskReminder />
            ) : (
              <Navigate to="/subscription-plan" />
            )
          }
        /> */}
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
            authUser?.userType === "Manage" ||
            authUser?.userType === "Custom" ? (
              <UserNotification />
            ) : (
              <Navigate to="/" />
            )
          }
        />

        {/* <Route
          path="/task-list"
          element={
            authUser?.userType === "Manage" ||
            authUser?.userType === "Custom" ? (
              <TaskList />
            ) : (
              <Navigate to="/" />
            )
          }
        /> */}
        <Route path="*" element={<Home />} />
        <Route
          path="/remark"
          element={
            authUser?.userType === "Manage" ||
            authUser?.userType === "Custom" ? (
              <Remark />
            ) : (
              <Navigate to="/" />
            )
          }
        />

        <Route
          path="/task-calendar"
          element={
            authUser?.userType === "Manage" ||
            authUser?.userType === "Custom" ||
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
            authUser?.userType === "Custom" || authUser?.role === "Admin" ? (
              <AddPlan />
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
          path="/email-template"
          element={
            (authUser?.role === "Admin" || authUser?.userType === "Custom") && (
              <EmailTemplate />
            )
          }
        />
        <Route
          path="/pre-built-plans"
          element={
            authUser?.userType === "Custom" ||
            authUser?.userType === "Manage" ||
            authUser?.role === "Admin" ? (
              <PreBuiltPlanList />
            ) : (
              <Navigate to="/subscription-plan" />
            )
          }
        />
      </Routes>

      <Toaster />
    </div>
  );
}

export default App;
