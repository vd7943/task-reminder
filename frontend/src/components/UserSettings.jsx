import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useAuth } from "../context/AuthProvider";

const UserSettings = () => {
  const [userTypes, setUserTypes] = useState({
    Custom: "Custom",
    Manage: "Manage",
  });
  const [loading, setLoading] = useState(false);
  const [authUser] = useAuth();
  const fetchUserTypes = async () => {
    try {
      const response = await axios.get(
        `https://task-reminder-4sqz.onrender.com/config/get-user-type?role=${authUser?.role}`
      );
      setUserTypes(response.data.userTypes);
      console.log(response.data.userTypes);
    } catch (error) {
      console.error("Failed to fetch user types:", error);
      toast.error("Failed to fetch user types.");
    }
  };

  useEffect(() => {
    fetchUserTypes();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserTypes((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    setLoading(true);

    try {
      await axios.post(
        "https://task-reminder-4sqz.onrender.com/config/update-user-type",
        userTypes,
        { withCredentials: true }
      );

      toast.success("User types updated successfully!");
      fetchUserTypes();
    } catch (error) {
      console.error("Failed to update user types:", error);
      toast.error("Failed to update user types.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen items-start pt-10 md:pt-0 mx-auto mt-10 xl:mt-20">
      <h2 className="text-2xl lg:text-3xl">User Type Settings</h2>

      <div className="flex flex-col bg-[#FFFFFF2B] items-center w-full justify-center p-8 rounded-lg lg:w-[700px] mx-auto mt-4 shadow-lg">
        <div className="flex flex-col gap-3 w-full">
          <label className="block font-medium text-lg">
            Custom Name Change
          </label>
          <input
            type="text"
            name="Custom"
            value={userTypes.Custom}
            onChange={handleChange}
            className="w-full p-2 border rounded-md outline-none"
          />
        </div>

        <div className="flex flex-col gap-3 w-full pt-4">
          <label className="block font-medium text-lg">
            Manage Name Change
          </label>
          <input
            type="text"
            name="Manage"
            value={userTypes.Manage}
            onChange={handleChange}
            className="w-full p-2 border rounded-md outline-none"
          />
        </div>

        <button
          onClick={handleSave}
          disabled={loading}
          className="mt-4 px-4 py-2 bg-[#9D60EC] text-[#151025] text-lg rounded-md hover:shadow-xl transform hover:scale-101 hover:bg-[#c095f8] duration-300 cursor-pointer"
        >
          {loading ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
};

export default UserSettings;
