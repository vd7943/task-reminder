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
    const url = `https://task-reminder-4sqz.onrender.com/plan/get-plan/${role}/${authUser.userType}`;

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
        "https://task-reminder-4sqz.onrender.com/plan/opt-plan",
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
              className="relative bg-white/10 backdrop-blur-md text-white p-6 rounded-lg shadow-lg border border-white/10 hover:shadow-2xl transition-all duration-300"
            >
              <h3 className="text-3xl font-bold text-white mb-4 drop-shadow-md">
                {plan.planName}
              </h3>

              {plan.tasks.length > 0 ? (
                <div className="overflow-x-auto flex space-x-6 p-2">
                  {plan.tasks.map((task) => (
                    <div
                      key={task._id}
                      className="bg-white/10 p-4 rounded-lg shadow-md"
                    >
                      <h4 className="text-xl font-semibold text-purple-400 mb-2">
                        📝 {task.taskName}
                      </h4>
                      <div className="border border-white/20 rounded-lg p-2 shadow-lg bg-white/5">
                        <DatePicker
                          inline
                          highlightDates={task.schedule.map(
                            (sched) => new Date(sched.date)
                          )}
                          calendarClassName="custom-calendar"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-300">No tasks available</p>
              )}

              <div
                className={`flex ${
                  authUser.userType === "Manage"
                    ? "justify-evenly"
                    : "justify-center"
                } items-center mt-6`}
              >
                <Link to="/task-calendar">
                  <button className="text-blue-300 cursor-pointer font-semibold transition-all hover:text-blue-400">
                    📅 View Full Calendar
                  </button>
                </Link>

                {authUser.userType === "Manage" && (
                  <button
                    onClick={() => handleOptPlan(plan._id)}
                    className="bg-green-500 text-white py-3 px-6 rounded-lg font-semibold shadow-lg hover:bg-green-600 transition-all duration-300 cursor-pointer"
                  >
                    ✅ Opt-in Plan
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-6 lg:mx-auto h-screen md:pt-4 w-full">
          <div className="bg-white/10 text-white p-6 rounded-lg shadow-lg border border-white/10">
            <p className="text-center text-gray-300">No Plans found.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PreBuiltPlanList;
