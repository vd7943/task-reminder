import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";
import axios from "axios";
import toast from "react-hot-toast";

const PreBuiltPlanList = () => {
  const [plans, setPlans] = useState([]);
  const [filteredPlans, setFilteredPlans] = useState([]);
  const [optedPlanNames, setOptedPlanNames] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [authUser] = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const role = authUser.userType === "Manage" ? "Admin" : authUser.role;
        const url = `https://task-reminder-4sqz.onrender.com/plan/get-plan/${role}/${authUser.userType}`;

        // Fetch all plans
        const planResponse = await axios.get(url, { withCredentials: true });
        const allPlans = planResponse.data.plans;
        setPlans(allPlans);
        setFilteredPlans(allPlans);

        if (authUser.userType === "Manage") {
          // Fetch user's opted plans
          const userPlanResponse = await axios.get(
            `https://task-reminder-4sqz.onrender.com/plan/get-user-plan/${authUser._id}`,
            { withCredentials: true }
          );

          const optedNames = new Set(
            userPlanResponse.data.plans.map((plan) => plan.planName)
          );

          setOptedPlanNames(optedNames);
        }
      } catch (error) {
        console.error("❌ Error fetching plans:", error);
      }
    };

    fetchPlans();
  }, [authUser]);

  useEffect(() => {
    const filtered = plans.filter((plan) =>
      plan.planName.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredPlans(filtered);
  }, [searchQuery, plans]);

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
      setOptedPlanNames((prev) => new Set(prev).add(planId));
      window.location.reload();
      setTimeout(() => {
        navigate("/plan-list");
      }, 1500);
    } catch (error) {
      toast.error(error.response.data.message);
    }
  };

  return (
    <div className="p-6 lg:mx-auto h-full pt-16 md:pt-4 w-full xl:w-[960px]">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-semibold text-gray-200 pt-4 md:pt-0">
          Pre Built Plans
        </h2>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by Plan Name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full p-3 rounded-lg bg-[FFFFFF2B] text-white border border-gray-500 focus:outline-none focus:ring-2 focus:ring-[#9D60EC]"
        />
      </div>

      <div className="bg-[#FFFFFF2B] shadow-xl rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="bg-[#151025] text-white">
              <tr>
                <th className="p-4 text-left text-lg font-semibold">
                  Plan Name
                </th>
                <th className="p-4 text-left text-lg font-semibold">
                  Task Count
                </th>
                <th className="p-4 text-left text-lg font-semibold">
                  Plan Start
                </th>
                <th className="p-4 text-left text-lg font-semibold">Status</th>

                {authUser.userType === "Manage" && (
                  <th className="p-4 text-center text-lg font-semibold">
                    Opt Plan
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="text-start">
              {filteredPlans.length > 0 ? (
                filteredPlans.map((plan) => (
                  <tr
                    key={plan._id}
                    className="border-b border-gray-200 hover:bg-gray-800 transition-all duration-200"
                  >
                    <td className="p-4 cursor-pointer">
                      <Link to={`/plan-detail/${plan._id}`}>
                        {plan.planName}
                      </Link>
                    </td>
                    <td className="p-4">{plan.tasks.length}</td>
                    <td className="p-4">{plan.planStart}</td>
                    <td className="p-4">{plan.status}</td>

                    {authUser.userType === "Manage" && (
                      <td className="p-4 text-center">
                        <button
                          onClick={() => handleOptPlan(plan._id)}
                          className={`px-4 py-2 rounded-lg text-white cursor-pointer ${
                            optedPlanNames.has(plan.planName)
                              ? "bg-blue-600"
                              : "bg-green-500"
                          }`}
                        >
                          {optedPlanNames.has(plan.planName)
                            ? "Opted"
                            : "Opt Plan"}
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center p-4">
                    No Plan found.
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

export default PreBuiltPlanList;
