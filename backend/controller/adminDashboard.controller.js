import User from "../model/user.model.js";
import AddReminder from "../model/addReminder.model.js";

export const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.find({ role: "User" });

    const totalCustomUsers = await User.find({ userType: "Custom" });

    const totalManageUsers = await User.find({ userType: "Manage" });

    res.status(200).json({
      totalUsers,
      totalCustomUsers,
      totalManageUsers,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};
