import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import cron from "node-cron";
import dotenv from "dotenv";
import User from "./model/user.model.js";

dotenv.config();

const userTypesPath = path.resolve("config/userTypes.json");
const prevUserTypesPath = path.resolve("config/previousUserTypes.json");

let oldUserTypes = [];
let newUserTypes = [];

const connectDB = async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");
  }
};

const readUserTypesFromFile = (filePath) => {
  try {
    const content = fs.readFileSync(filePath, "utf-8");
    const parsed = JSON.parse(content);
    if (Array.isArray(parsed.userTypes)) return parsed.userTypes;
    console.warn(
      `⚠️ Invalid structure in ${filePath}, expecting { userTypes: [] }`
    );
    return [];
  } catch (e) {
    console.warn(`⚠️ Could not read or parse ${filePath}:`, e.message);
    return [];
  }
};

const saveOldUserTypes = (userTypes) => {
  try {
    fs.writeFileSync(
      prevUserTypesPath,
      JSON.stringify({ userTypes }, null, 2),
      "utf-8"
    );
  } catch (e) {
    console.error("❌ Failed to save previous userTypes:", e);
  }
};

const syncUserTypes = async () => {
  await connectDB();

  if (newUserTypes.length === 0) {
    console.warn("⚠️ No new userTypes loaded, aborting sync.");
    return;
  }

  if (oldUserTypes.length === 0) {
    saveOldUserTypes(newUserTypes);
    return;
  }

  if (
    oldUserTypes.length === newUserTypes.length &&
    oldUserTypes.every((type, idx) => type === newUserTypes[idx])
  ) {
    return;
  }

  const remap = {};
  for (let i = 0; i < oldUserTypes.length; i++) {
    remap[oldUserTypes[i]] = newUserTypes[i] || "Regular";
  }

  const usersToUpdate = await User.find({
    userType: { $in: oldUserTypes },
  });

  let updatedCount = 0;

  for (const user of usersToUpdate) {
    const newType = remap[user.userType] || "Regular";
    if (user.userType !== newType) {
      user.previousUserType = user.userType;
      user.userType = newType;
      await user.save();

      updatedCount++;
    }
  }

  saveOldUserTypes(newUserTypes);
};

const loadUserTypes = () => {
  oldUserTypes = readUserTypesFromFile(prevUserTypesPath);
  newUserTypes = readUserTypesFromFile(userTypesPath);
};

let debounceTimeout;
fs.watchFile(userTypesPath, { interval: 1000 }, () => {
  clearTimeout(debounceTimeout);
  debounceTimeout = setTimeout(async () => {
    loadUserTypes();
    await syncUserTypes();
  }, 1000);
});

cron.schedule("*/10 * * * *", async () => {
  loadUserTypes();
  await syncUserTypes();
});

(async () => {
  loadUserTypes();
  await syncUserTypes();
})();
