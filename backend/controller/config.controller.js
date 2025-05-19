import fs from "fs";
import path from "path";

const filePath = path.resolve("config/userTypes.json");

export const getUserTypes = (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(filePath));
    res.json({ userTypes: data.userTypes });
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

    fs.writeFileSync(filePath, JSON.stringify({ userTypes }, null, 2));
    res.json({ message: "User types updated successfully." });
  } catch (err) {
    res.status(500).json({ message: "Failed to update user types." });
  }
};
