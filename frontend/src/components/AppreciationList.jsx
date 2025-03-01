import React, { useEffect, useState } from "react";
import { FaTrophy } from "react-icons/fa";
import axios from "axios";

const AppreciationList = () => {
  const [appreciation, setAppreciation] = useState([]);

  useEffect(() => {
    const fetchTopUsers = async () => {
      try {
        const response = await axios.get(
          "http://localhost:3000/api/user/appreciations"
        );
        setAppreciation(response.data.topUsers);
      } catch (error) {
        console.error("Error fetching appreciation data:", error);
      }
    };

    fetchTopUsers();
  }, []);

  return (
    <div className="bg-[#FFFFFF2B] w-full p-6 rounded-xl shadow-xl max-w-4xl mx-auto border border-gray-700 text-gray-200">
      <h3 className="text-3xl font-semibold mb-4 text-center">
        🎉 Appreciation Board 🎉
      </h3>
      <div className="flex flex-col items-center gap-4">
        {appreciation.map((user) => (
          <div
            key={user._id}
            className="flex items-center justify-between gap-2 p-4 w-full bg-[#151025] max-w-md rounded-lg shadow-md border border-gray-500"
          >
            <div className="flex lg:gap-52 justify-between">
              <p className="text-xl font-semibold">{user.fullname}</p>
            </div>
            <div className="flex lg:gap-52 justify-between">
              <p className="text-lg text-gray-300">Top Performer</p>
            </div>
            <FaTrophy className="text-yellow-400 text-2xl" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default AppreciationList;
