import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";
import axios from "axios";
import toast from "react-hot-toast";

const PlanList = () => {
  const [plans, setPlans] = useState([]);
  const [filteredPlans, setFilteredPlans] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [authUser] = useAuth();

  useEffect(() => {
    axios
      .get(`http://localhost:3000/plan/get-user-plan/${authUser._id}`, {
        withCredentials: true,
      })
      .then((response) => {
        setPlans(response?.data?.plans);
        setFilteredPlans(response?.data?.plans);
      })

      .catch((error) => console.error(error));
  }, []);

  useEffect(() => {
    const filtered = plans.filter((plan) =>
      plan.planName.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredPlans(filtered);
  }, [searchQuery, plans]);

  const handleTogglePlanStatus = async (planId, status) => {
    try {
      const newStatus = status === "Active" ? "Paused" : "Active";
      await axios.put(
        `http://localhost:3000/plan/update-plan-status/${planId}/${authUser._id}`,
        {
          status: newStatus,
        }
      );
      setPlans((prevPlans) =>
        prevPlans.map((plan) =>
          plan._id === planId ? { ...plan, status: newStatus } : plan
        )
      );
      toast.success(`Plan ${newStatus}`);
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const handleRestartPlan = async (planId) => {
    try {
      const response = await axios.post(
        "http://localhost:3000/plan/restart-plan",
        {
          userId: authUser._id,
          planId,
        }
      );

      toast.success(response.data.message);
      setPlans((prevPlans) =>
        prevPlans.map((plan) =>
          plan._id === planId ? { ...plan, status: "Active" } : plan
        )
      );
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to restart plan");
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

                <th className="p-4 text-left text-lg font-semibold">Status</th>
                <th className="p-4 text-center text-lg font-semibold">
                  Actions
                </th>

                {filteredPlans.some((plan) => plan.status === "Paused") &&
                  authUser.role === "User" && (
                    <th className="p-4 text-center text-lg font-semibold">
                      Restart Plan
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
                    <td className="p-4">{plan.status}</td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() =>
                          handleTogglePlanStatus(plan._id, plan.status)
                        }
                        className={`px-4 py-2 cursor-pointer rounded-lg ${
                          plan.status === "Active"
                            ? "bg-red-500"
                            : "bg-green-500"
                        } text-white`}
                      >
                        {plan.status === "Active" ? "Pause" : "Activate"}
                      </button>
                    </td>

                    {plan.status === "Paused" && authUser.role === "User" && (
                      <td className="p-4 text-center">
                        <button
                          onClick={() => handleRestartPlan(plan._id)}
                          className="bg-yellow-600 px-4 py-2 rounded-lg text-white cursor-pointer"
                        >
                          Restart Plan
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

export default PlanList;
