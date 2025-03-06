import axios from "axios";
import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthProvider";
import { FaStar } from "react-icons/fa";

const RemarkList = () => {
  const [remarks, setRemarks] = useState([]);
  const [authUser] = useAuth();

  useEffect(() => {
    axios
      .get(`https://task-reminder-4sqz.onrender.com/remark/${authUser._id}`, {
        withCredentials: true,
      })
      .then((response) => {
        setRemarks(response.data.remarks);
        console.log(response.data.remarks);
      })
      .catch((error) => console.error(error));
  }, []);
  return (
    <div className="p-6 w-screen lg:w-[960px] pt-16 lg:pt-6 lg:pl-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl">Remarks</h2>
      </div>
      <div className="bg-[#FFFFFF2B] shadow-xl rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="bg-[#151025] text-white">
              <tr>
                <th className="p-4 text-left text-lg font-semibold">
                  Task Name
                </th>
                <th className="p-4 text-left text-lg font-semibold">Review</th>
                <th className="p-4 text-left text-lg font-semibold">
                  Duration
                </th>
                <th className="p-4 text-left text-lg font-semibold">Summary</th>
                <th className="p-4 text-left text-lg font-semibold">
                  Task Date
                </th>
                <th className="p-4 text-left text-lg font-semibold">
                  Remark Added On
                </th>
              </tr>
            </thead>

            <tbody className="text-start">
              {remarks.length > 0 ? (
                remarks.map((remark) => (
                  <tr
                    key={remark._id}
                    className="border-b border-gray-200 hover:bg-gray-800 transition-all duration-200"
                  >
                    <td className="p-4">{remark.taskName}</td>
                     <td className="p-4 flex flex-row items-center gap-1">
                      {remark.taskReview}
                      <FaStar color="yellow" size={12} />
                    </td>
                    <td className="p-4">{remark.taskDuration}</td>
                    <td className="p-4">{remark.taskSummary}</td>
                    <td className="p-4">{remark.taskDate}</td>
                    <td className="p-4">
                      {new Date(remark.createdAt).toISOString().split("T")[0]}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="p-4 text-center">
                    No remarks found.
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

export default RemarkList;
