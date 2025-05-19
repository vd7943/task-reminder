import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useAuth } from "../context/AuthProvider";

const UserSettings = () => {
  const [userTypes, setUserTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [authUser] = useAuth();

  const fetchUserTypes = async () => {
    try {
      const response = await axios.get(
        "https://task-reminder-4sqz.onrender.com/config/get-user-type"
      );
      setUserTypes(response.data.userTypes || []);
    } catch (error) {
      toast.error("Failed to fetch user types.");
    }
  };

  useEffect(() => {
    fetchUserTypes();
  }, []);

  const handleChange = (index, value) => {
    if (userTypes[index] === "Regular") return;

    setUserTypes((prev) => {
      const updated = [...prev];
      updated[index] = value;
      return updated;
    });
  };

  const handleSave = async () => {
    setLoading(true);

    try {
      await axios.post(
        "https://task-reminder-4sqz.onrender.com/config/update-user-type",
        { userTypes },
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
        <div className="flex flex-col gap-4 w-full">
          <label className="block font-medium text-lg mb-2">
            Edit User Types
          </label>

          {userTypes.map((type, index) => {
            if (type === "Regular") return null;

            return (
              <div key={index} className="flex items-center gap-3 mb-2">
                <input
                  type="text"
                  value={type}
                  onChange={(e) => handleChange(index, e.target.value)}
                  className="w-full p-2 border rounded-md outline-none"
                />
              </div>
            );
          })}
        </div>

        <button
          onClick={handleSave}
          disabled={loading}
          className="mt-6 px-4 py-2 bg-[#9D60EC] text-[#151025] text-lg rounded-md hover:shadow-xl transform hover:scale-101 hover:bg-[#c095f8] duration-300 cursor-pointer"
        >
          {loading ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
};

export default UserSettings;
