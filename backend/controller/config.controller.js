import fs from "fs";
import path from "path";

const userTypesFilePath = path.resolve("config/userTypes.json");
const userTypeMappingsFilePath = path.resolve("config/userTypeMappings.json");

export const getUserTypes = (req, res) => {
  try {
    const userTypesData = JSON.parse(fs.readFileSync(userTypesFilePath));
    const userTypeMappingsData = JSON.parse(
      fs.readFileSync(userTypeMappingsFilePath)
    );

    res.json({
      userTypes: userTypesData.userTypes || [],
      userTypeMappings: userTypeMappingsData.userTypes || [],
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to read user types." });
  }
};

export const updateUserTypes = (req, res) => {
  try {
    const { userTypes } = req.body;

    if (!Array.isArray(userTypes)) {
      return res.status(400).json({ message: "Invalid userTypes format." });
    }

    fs.writeFileSync(userTypesFilePath, JSON.stringify({ userTypes }, null, 2));

    fs.writeFileSync(
      userTypeMappingsFilePath,
      JSON.stringify({ userTypes }, null, 2)
    );

    res.json({ message: "User types updated successfully in both files." });
  } catch (err) {
    res.status(500).json({ message: "Failed to update user types." });
  }
};
