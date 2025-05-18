import axios from "axios";
import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthProvider";
import { FaStar } from "react-icons/fa";

const RemarkList = () => {
  const [groupedRemarks, setGroupedRemarks] = useState({});
  const [authUser] = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(`https://task-reminder-4sqz.onrender.com/remark/${authUser._id}`, {
        withCredentials: true,
      })
      .then((response) => {
        const remarksData = response.data.remarks;

        const grouped = remarksData.reduce((acc, remark) => {
          const date = new Date(remark.createdAt)
            .toLocaleDateString("en-US", {
              weekday: "short",
              month: "long",
              day: "2-digit",
              year: "numeric",
              timeZone: "UTC",
            })
            .replace(/, /g, " ");

          if (!acc[date]) acc[date] = [];
          acc[date].push(remark);
          return acc;
        }, {});

        setGroupedRemarks(grouped);
      })
      .catch((error) => console.error(error))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-6 w-screen lg:w-[960px] pt-16 lg:pt-6 lg:pl-6">
      <h2 className="text-3xl mb-6">Remarks</h2>

      <div className="bg-[#FFFFFF2B] shadow-xl rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="bg-[#151025] text-white">
              <tr>
                <th className="p-4 text-left text-lg font-semibold w-1/6">
                  Remark Date
                </th>
                <th className="p-4 text-left text-lg font-semibold w-1/6">
                  Task Name
                </th>
                <th className="p-4 text-left text-lg font-semibold w-1/6">
                  Rating
                </th>
                <th className="p-4 text-left text-lg font-semibold w-1/6">
                  Summary
                </th>
                <th className="p-4 text-left text-lg font-semibold w-1/6">
                  Task Date
                </th>
              </tr>
            </thead>

            <tbody className="text-start">
              {loading ? (
                <tr>
                  <td colSpan="5" className="p-4 text-center">
                    Loading...
                  </td>
                </tr>
              ) : Object.keys(groupedRemarks).length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-4 text-center">
                    No remarks found.
                  </td>
                </tr>
              ) : (
                Object.entries(groupedRemarks).map(([date, remarks]) =>
                  remarks.map((remark, index) => (
                    <tr
                      key={remark._id}
                      className="border-b border-gray-200 hover:bg-gray-800 transition-all duration-200"
                    >
                      {index === 0 && (
                        <td
                          rowSpan={remarks.length}
                          className="p-4 font-semibold bg-[#151025] text-white"
                        >
                          {date}
                        </td>
                      )}
                      <td className="p-4">{remark.taskName}</td>
                      <td className="p-4 text-center align-middle">
                        <div className="flex items-center gap-1">
                          <span>{remark.taskReview}</span>
                          <FaStar color="yellow" size={14} />
                        </div>
                      </td>
                      <td className="p-4">{remark.taskSummary}</td>
                      <td className="p-4">
                        {new Date(remark.taskDate)
                          .toLocaleDateString("en-US", {
                            weekday: "short",
                            month: "long",
                            day: "2-digit",
                            year: "numeric",
                            timeZone: "UTC",
                          })
                          .replace(/, /g, " ")}
                      </td>
                    </tr>
                  ))
                )
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RemarkList;
