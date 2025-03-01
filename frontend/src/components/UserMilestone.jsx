import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthProvider";
import { FaCheckCircle } from "react-icons/fa";
import { MdOutlineCancel } from "react-icons/md";
import axios from "axios";
import "react-vertical-timeline-component/style.min.css";

const UserMilestone = () => {
  const [authUser] = useAuth();
  const [milestones, setMilestones] = useState([]);
  const [remarks, setRemarks] = useState([]);

  useEffect(() => {
    const fetchMilestones = async () => {
      try {
        const milestoneRes = await axios.get(
          `http://localhost:3000/plan/milestones/${authUser._id}`,
          { withCredentials: true }
        );
        setMilestones(milestoneRes.data.milestones || []);
      } catch (error) {
        console.error("Error fetching milestones:", error);
      }
    };

    const fetchRemarks = async () => {
      try {
        const remarkRes = await axios.get(
          `http://localhost:3000/remark/${authUser._id}`,
          { withCredentials: true }
        );
        setRemarks(remarkRes.data.remarks || []);
      } catch (error) {
        console.error("Error fetching remarks:", error);
      }
    };

    fetchMilestones();
    fetchRemarks();
  }, []);

  const isMilestoneAchieved = (planName) => {
    return remarks.some((remark) => remark.taskName === planName);
  };

  return (
    <div className="relative bg-[#FFFFFF2B] p-6 sm:p-10 rounded-2xl shadow-2xl w-full max-w-5xl mx-auto overflow-hidden border border-gray-700">
      <div className="flex flex-col items-center mb-8">
        <img
          src={authUser.profileImage?.url || "/imageHolder.jpg"}
          alt={authUser.fullname}
          className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-[#9D60EC] object-cover shadow-lg"
        />
        <h3 className="text-xl sm:text-2xl font-bold mt-3 text-gray-200">
          {authUser.fullname}
        </h3>
        <h3 className="text-3xl sm:text-4xl font-semibold text-[#a56cef] mt-2">
          The Journey 🚀
        </h3>
      </div>

      <div className="relative w-full mx-auto overflow-hidden">
        <div className="absolute left-1/2 transform -translate-x-1/2 w-[2px] sm:w-1 bg-gradient-to-b from-[#a56cef] to-[#6a1b9a] rounded-full h-full"></div>

        {milestones.map((milestone, index) => {
          const achieved = isMilestoneAchieved(milestone.planName);
          const isLeft = index % 2 === 0;

          return (
            <div
              key={index}
              className={`relative flex w-full my-6 sm:my-8 items-center ${
                isLeft
                  ? "justify-start md:justify-end"
                  : "justify-end md:justify-start"
              } flex-col md:flex-row`}
            >
              <div className="absolute left-1/2 transform -translate-x-1/2 bg-[#a56cef] w-4 h-4 sm:w-5 sm:h-5 rounded-full border-4 border-white"></div>

              <div
                className={`relative w-[80%] sm:w-[70%] md:w-[45%] p-5 sm:p-6 rounded-lg shadow-md transition-transform transform hover:scale-105 ${
                  achieved
                    ? "bg-gradient-to-r from-green-500 to-green-700 text-white border-2 border-green-400 shadow-green-500/50"
                    : "bg-gradient-to-r from-gray-800 to-gray-900 text-gray-200 border-2 border-gray-700"
                } ${isLeft ? "md:ml-8" : "md:mr-8"}`}
              >
                <div className="flex items-center gap-3">
                  {achieved ? (
                    <FaCheckCircle size={22} className="text-white" />
                  ) : (
                    <MdOutlineCancel size={22} className="text-red-500" />
                  )}
                  <h3 className="text-lg sm:text-xl font-bold">
                    {milestone.planName}
                  </h3>
                </div>
                <p className="mt-2 text-sm">
                  {achieved ? "✔️ Completed" : "❌ Not Completed"}
                </p>
                <span className="text-xs text-gray-100">
                  {remarks.find(
                    (remark) => remark.taskName === milestone.planName
                  )
                    ? new Date(
                        remarks.find(
                          (remark) => remark.taskName === milestone.planName
                        ).createdAt
                      ).toLocaleDateString()
                    : "N/A"}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-md sm:text-lg text-[#ab7beb] font-medium text-center mt-6 sm:mt-10">
        ✅{" "}
        <span className="text-green-400 text-xl sm:text-2xl font-bold">
          {milestones.filter((m) => isMilestoneAchieved(m.planName)).length}
        </span>{" "}
        Milestones Completed!
      </p>
    </div>
  );
};

export default UserMilestone;
