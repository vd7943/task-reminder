import axios from "axios";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const UserList = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    axios
      .get("https://task-reminder-4sqz.onrender.com/admin/get-user-data", {
        withCredentials: true,
      })
      .then((response) => {
        setUsers(response.data.totalUsers);
      })
      .catch((error) => console.error(error));
  }, []);

  return (
    <div className="p-6 w-screen lg:w-[960px] pt-16 lg:pt-6 lg:pl-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl">Total User List</h2>
        <Link to="/add-user">
          <button
            className="bg-[#9D60EC] text-white py-3 text-lg px-8 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 hover:bg-[#c095f8] duration-300 cursor-pointer"
            type="submit"
          >
            Add User
          </button>
        </Link>
      </div>

      <div className="bg-[#FFFFFF2B] shadow-xl rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="bg-[#151025] text-white">
              <tr>
                <th className="p-4 text-left text-lg font-semibold">
                  Profile Image
                </th>
                <th className="p-4 text-left text-lg font-semibold">
                  User Name
                </th>
                <th className="p-4 text-left text-lg font-semibold">Email</th>
                <th className="p-4 text-left text-lg font-semibold">Plan</th>
                <th className="p-4 text-left text-lg font-semibold">
                  Date of Joining
                </th>
                <th className="p-4 text-left text-lg font-semibold">Coins</th>
              </tr>
            </thead>

            <tbody className="text-start">
              {users.length > 0 ? (
                users.map((user) => (
                  <tr
                    key={user._id}
                    className="border-b border-gray-200 hover:bg-gray-800 transition-all duration-200"
                  >
                    <td className="p-4">
                      <img
                        src={user.profileImage?.url || "./imageHolder.jpg"}
                        alt="Profile"
                        className="w-14 h-14 rounded-full object-cover"
                      />
                    </td>
                    <td className="p-4">{user.fullname}</td>
                    <td className="p-4">{user.email}</td>
                    <td className="p-4">{user.userType}</td>

                    <td className="p-4">
                      {new Date(user.createdAt).toISOString().split("T")[0]}
                    </td>
                    <td className="p-4">{user.coins}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="p-4 text-center">
                    No users found.
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

export default UserList;
