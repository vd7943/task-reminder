import React, { useEffect, useState } from "react";
import axios from "axios";
import AppreciationList from "./AppreciationList";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const [usersData, setUsersData] = useState({
    totalUsers: 0,
    totalCustomUsers: 0,
    totalManageUsers: 0,
  });
  const [appreciation, setAppreciation] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:3000/admin/get-user-data", {
        withCredentials: true,
      })
      .then((response) => {
        setUsersData({
          totalUsers: response.data.totalUsers.length,
          totalCustomUsers: response.data.totalCustomUsers.length,
          totalManageUsers: response.data.totalManageUsers.length,
        });
        setAppreciation(response.data.totalUsers);
      })

      .catch((error) => console.error(error));
  }, []);

  return (
    <div className="flex flex-col justify-center items-center min-h-screen p-6 xl:pb-12 lg:w-[960px] lg:my-auto lg:mx-auto">
      <h2 className="text-4xl mb-6 text-center lg:text-left">Dashboard</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-[#FFFFFF2B] p-4 rounded-md text-center shadow-lg cursor-pointer">
          <Link to="/custom-user-list">
            <h4 className="font-medium">TOTAL CUSTOM USER</h4>
            <p className="text-2xl font-bold mt-4">
              {usersData.totalCustomUsers}
            </p>
          </Link>
        </div>
        <div className="bg-[#FFFFFF2B] p-4 rounded-md text-center shadow-lg cursor-pointer">
          <Link to="/manage-user-list">
            <h4 className="font-medium">TOTAL MANAGE USER</h4>
            <p className="text-2xl font-bold mt-2">
              {usersData.totalManageUsers}
            </p>
          </Link>
        </div>

        <div className="bg-[#FFFFFF2B] p-4 rounded-md text-center shadow-lg cursor-pointer">
          <Link to="/user-list">
            <h4 className="font-medium">TOTAL USERS</h4>
            <p className="text-2xl font-bold mt-2">{usersData.totalUsers}</p>
          </Link>
        </div>
      </div>
      <div className="flex flex-col lg:flex-row justify-center gap-6">
        <AppreciationList appreciation={appreciation} />
      </div>
    </div>
  );
};

export default Dashboard;
