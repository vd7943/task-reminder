import Config from "../model/config.model.js";

export const getUserTypes = async (req, res) => {
  try {
    const config = await Config.findOne();

    if (!config) {
      config = new Config({
        userTypes: { Custom: "Custom", Manage: "Manage" },
      });
      await config.save();
    }

    res.status(200).json({ userTypes: config.userTypes });
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const renameUserTypes = async (req, res) => {
  try {
    const { Custom, Manage } = req.body;
    const { role } = req.query;

    if (role !== "Admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    let config = await Config.findOne();

    if (!config) {
      config = new Config({
        userTypes: { Custom, Manage },
      });
    } else {
      config.userTypes.Custom = Custom;
      config.userTypes.Manage = Manage;
    }

    await config.save();

    res.status(200).json({
      message: "User types renamed successfully",
      userTypes: config.userTypes,
    });
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};
