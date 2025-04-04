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
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePlanId, setDeletePlanId] = useState(null);
  const [deletePlanName, setDeletePlanName] = useState("");
  const [confirmPlanName, setConfirmPlanName] = useState("");

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    axios
      .get(`https://task-reminder-4sqz.onrender.com/plan/get-user-plan/${authUser._id}`, {
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
      const response = await axios.put(
        `https://task-reminder-4sqz.onrender.com/plan/update-plan-status/${planId}/${authUser._id}`,
        { status: newStatus }
      );

      if (!response.data.success) {
        throw new Error(response.data.message);
      }
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
      toast.error(error.response?.data?.message || "Failed to update status");
    }
  };

  const handleDeleteClick = (planId, planName, optedCount) => {
    if (optedCount > 0) {
      setShowDeleteModal(true);
      setDeletePlanId(planId);
      setDeletePlanName(planName);
      setConfirmPlanName("");
    } else {
      handleDeletePlan(planId);
    }
  };

  const handleDeletePlan = async (planId) => {
    try {
      await axios.delete(
        `https://task-reminder-4sqz.onrender.com/plan/delete/${authUser?._id}/${planId}`
      );
      setPlans((prevPlans) => prevPlans.filter((plan) => plan._id !== planId));
      toast.success("Plan deleted successfully");
      setShowDeleteModal(false);
    } catch (error) {
      toast.error("Failed to delete plan");
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
                {authUser.role === "Admin" && (
                  <th className="p-4 text-left text-lg font-semibold">
                    Opted Users
                  </th>
                )}

                {(authUser.userType === "Custom" ||
                  authUser.userType === "Manage") && (
                  <>
                    <th className="p-4 text-left text-lg font-semibold">
                      Status
                    </th>
                    <th className="p-4 text-center text-lg font-semibold">
                      Actions
                    </th>
                  </>
                )}
                {(authUser.userType === "Custom" ||
                  authUser.role === "Admin") && (
                  <th className="p-4 text-center text-lg font-semibold">
                    Delete Plan
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
                      <Link to={`/plan-detail/${plan._id}`}
                         className="inline-block bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 shadow-sm border border-gray-600"
                        >
                        {plan.planName}
                      </Link>
                    </td>
                    <td className="p-4">{plan.tasks.length}</td>
                    {authUser.role === "Admin" && (
                      <td className="p-4">{plan.optedCount}</td>
                    )}
                    {(authUser.userType === "Custom" ||
                      authUser.userType === "Manage") && (
                      <>
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
                      </>
                    )}
                    {(authUser.userType === "Custom" ||
                      authUser.role === "Admin") && (
                      <td className="p-4 text-center">
                        <button
                          onClick={() =>
                            handleDeleteClick(
                              plan._id,
                              plan.planName,
                              plan.optedCount
                            )
                          }
                          className="px-4 py-2 cursor-pointer rounded-lg bg-red-500 text-white"
                        >
                          Delete
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center p-4">
                    No Plan found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      {showDeleteModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-[#FFFFFF2B] bg-opacity-50 backdrop-blur-lg z-50">
          <div className="bg-[#1E1E2F] p-6 rounded-2xl shadow-lg w-[400px] relative border border-gray-700">
            <h3 className="text-xl font-semibold mb-3 text-red-400 flex items-center space-x-2">
              <span className="bg-red-500 text-white p-1.5 rounded-full">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m0-4h.01M12 2a10 10 0 1 1-7.071 2.929A10 10 0 0 1 12 2z"
                  />
                </svg>
              </span>
              <span className="text-red-300">
                Warning: This plan is opted by{" "}
                <b className="text-white">
                  {
                    filteredPlans.find((p) => p._id === deletePlanId)
                      ?.optedCount
                  }
                </b>{" "}
                users.
              </span>
            </h3>

            <p className="text-gray-300 mb-3 text-sm">
              To confirm deletion, type{" "}
              <b className="text-white">{deletePlanName}</b> below:
            </p>
            <input
              type="text"
              value={confirmPlanName}
              onChange={(e) => setConfirmPlanName(e.target.value)}
              className="w-full p-2 border bg-[#2A2A3C] text-white rounded-md focus:ring-2 focus:ring-red-400 outline-none mb-4"
              placeholder="Type plan name..."
            />
            <div className="flex justify-center space-x-3">
              <button
                onClick={() => handleDeletePlan(deletePlanId)}
                className={`px-4 py-2 cursor-pointer rounded-lg text-white transition-all duration-200 ${
                  confirmPlanName === deletePlanName
                    ? "bg-red-500 hover:bg-red-600"
                    : "bg-red-900 opacity-50 cursor-not-allowed"
                }`}
                disabled={confirmPlanName !== deletePlanName}
              >
                Delete
              </button>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 cursor-pointer bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-all duration-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlanList;
