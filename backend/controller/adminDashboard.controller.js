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

export const toggleUserActivation = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.isDeactivated) {
      user.userType = user.previousUserType;
      user.isDeactivated = false;
    } else {
      user.previousUserType = user.userType;
      user.userType = "Regular";
      user.isDeactivated = true;
    }

    await user.save();
    res
      .status(200)
      .json({
        message: `User ${
          user.isDeactivated ? "deactivated" : "activated"
        } successfully`,
      });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};
