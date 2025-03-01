import User from "../model/user.model.js";

export const getTopAppreciations = async (req, res) => {
  try {
    const topUsers = await User.find().sort({ coins: -1 }).limit(3);

    if (!topUsers || topUsers.length === 0) {
      console.log("❌ No users found in database.");
      return res
        .status(404)
        .json({ success: false, message: "No users found" });
    }

    res.status(200).json({ success: true, topUsers });
  } catch (error) {
    console.error("❌ Server error:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};
