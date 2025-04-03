import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const PlanSetting = () => {
  const [planLimit, setPlanLimit] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    axios
      .get("https://task-reminder-4sqz.onrender.com/limit/get-plan-limit", {
        withCredentials: true,
      })
      .then((response) => {
        if (response.data?.planLimit) {
          setPlanLimit(response.data.planLimit);
        }
      })
      .catch((error) => console.error("Error fetching plan limit:", error));
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await axios.post(
        "https://task-reminder-4sqz.onrender.com/limit/set-plan-limit",
        { planLimit },
        { withCredentials: true }
      );

      toast.success("Plan limit updated successfully!");
    } catch (error) {
      toast.error("Failed to update plan limit.");
      console.error("Error updating plan limit:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen items-start pt-10 md:pt-0 mx-auto mt-10 xl:mt-20">
      <h2 className="text-2xl lg:text-3xl">Plan Setting</h2>
      <div className="flex flex-col bg-[#FFFFFF2B] items-center w-full justify-center p-8 rounded-lg lg:w-[700px] mx-auto mt-4 shadow-lg">
        <div className="flex flex-col gap-3 w-full">
          <label className="block font-medium text-lg">
            Set Active Plan Limit
          </label>
          <input
            type="number"
            min="1"
            value={planLimit}
            onChange={(e) => setPlanLimit(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
          />
          <button
            className="mt-4 px-4 py-2 bg-[#9D60EC] text-[#151025] text-lg rounded-md hover:shadow-xl transform hover:scale-101 hover:bg-[#c095f8] duration-300 cursor-pointer"
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? "Saving..." : "Save"}
          </button>
          <div className="mt-6 rounded-md shadow w-full">
            <h4 className="text-xl font-semibold mb-2">Existing Plan Limit</h4>
            <ul className="mt-2">
              <li className="border p-4 text-lg rounded-md bg-gray-800 text-white flex items-center justify-between">
                <span>Maximum Active Plans: {planLimit}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlanSetting;
