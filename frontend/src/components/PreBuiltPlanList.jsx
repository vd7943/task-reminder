import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";
import axios from "axios";
import toast from "react-hot-toast";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const PreBuiltPlanList = () => {
  const [plans, setPlans] = useState([]);
  const [authUser] = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const role = authUser.userType === "Manage" ? "Admin" : authUser.role;
    const url = `http://localhost:3000/plan/get-plan/${role}/${authUser.userType}`;

    axios
      .get(
        authUser.userType === "Custom" ? `${url}?userId=${authUser._id}` : url,
        {
          withCredentials: true,
        }
      )
      .then((response) => {
        setPlans(response.data.plans);
      })
      .catch((error) => console.error(error));
  }, []);

  const handleOptPlan = async (planId) => {
    try {
      const response = await axios.post(
        "http://localhost:3000/plan/opt-plan",
        {
          userId: authUser._id,
          planId,
        },
        { withCredentials: true }
      );

      toast.success(response.data.message);
      setTimeout(() => {
        navigate("/");
        window.location.reload();
      }, 1000);
    } catch (error) {
      toast.error(error.response.data.message);
    }
  };

  // const formatTime = (timeString) => {
  //   if (!timeString) return "N/A";
  //   const [hour, minute] = timeString.split(":").map(Number);
  //   const amPm = hour >= 12 ? "PM" : "AM";
  //   const formattedHour = hour % 12 === 0 ? 12 : hour % 12;
  //   return `${formattedHour}:${String(minute).padStart(2, "0")} ${amPm}`;
  // };

  return (
    <div className="p-6 lg:mx-auto h-full pt-16 md:pt-4 w-full xl:w-[960px]">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-semibold text-gray-200 pt-4 md:pt-0">
          Plan List
        </h2>
        {authUser.role === "Admin" && (
          <Link to="/add-plan">
            <button className="bg-[#9D60EC] text-white py-3 px-8 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 hover:bg-[#c095f8] duration-300 cursor-pointer">
              Add Plan
            </button>
          </Link>
        )}
      </div>

      {plans.length > 0 ? (
        <div className="grid grid-cols-1 gap-6">
          {plans.map((plan) => (
            <div
              key={plan._id}
              className="bg-[#FFFFFF2B] text-white p-6 rounded-lg shadow-lg"
            >
              <h3 className="text-2xl font-semibold mb-4">{plan.planName}</h3>
              <div className="flex flex-row justify-evenly items-center">
                <div className="flex justify-center gap-4">
                  <div className="border rounded-lg p-2">
                    <DatePicker
                      inline
                      highlightDates={plan.reminders.flatMap((reminder) =>
                        reminder.schedule.map((sched) => new Date(sched.date))
                      )}
                    />
                  </div>
                </div>

                <div className="text-center mt-4">
                  <Link to="/task-calendar">
                    <button className="text-blue-300 underline cursor-pointer pb-12">
                      Tap to see full calendar
                    </button>
                  </Link>
                </div>
                {authUser.userType === "Manage" && (
                  <div className="mt-4 text-center pb-12">
                    <button
                      onClick={() => handleOptPlan(plan._id)}
                      className="bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-all duration-300 cursor-pointer"
                    >
                      Opt this Plan
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-6 lg:mx-auto h-screen md:pt-4 w-full">
          <div className="bg-[#FFFFFF2B] h-18 text-white p-6 rounded-lg shadow-lg">
            {" "}
            <p className="text-center text-gray-300">No Plans found.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PreBuiltPlanList;
