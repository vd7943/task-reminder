import User from "../model/user.model.js";
import bcryptjs from "bcryptjs";
import { v2 as cloudinary } from "cloudinary";
import "../config/passport.js";
import passport from "passport";
import jwt from "jsonwebtoken";
import { config } from "dotenv";
import Config from "../model/config.model.js";

config();

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRY || "7d",
  });
};

export const signup = async (req, res) => {
  try {
    const { profileImage } = req.files;
    const allowedFormats = [
      "image/png",
      "image/jpeg",
      "image/webp",
      "image/jpg",
    ];
    if (!allowedFormats.includes(profileImage.mimetype)) {
      res.status(400).json({ message: "File format is not supported" });
    }

    const { fullname, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }
    const cloudinaryResponse = await cloudinary.uploader.upload(
      profileImage.tempFilePath,
      {
        folder: "PLANNER_USERS",
      }
    );
    if (!cloudinaryResponse || cloudinaryResponse.error) {
      res
        .status(500)
        .json({ message: "Failed to upload profile image to cloudinary" });
    }

    const hashPassword = await bcryptjs.hash(password, 10);

    const createdUser = new User({
      profileImage: {
        public_id: cloudinaryResponse.public_id,
        url: cloudinaryResponse.secure_url,
      },
      fullname: fullname,
      email: email,
      password: hashPassword,
      role: "User",
      userType: "Regular",
      payments: [],
      notifications: [],
       emailTime: "08:00",
    });
    await createdUser.save();
    res.status(201).json({
      message: "User created successfully",
      user: {
        _id: createdUser._id,
        fullname: createdUser.fullname,
        email: createdUser.email,
        role: createdUser.role,
        profileImage: createdUser.profileImage,
        userType: createdUser.userType,
        payments: createdUser.payments,
        createdAt: createdUser.createdAt,
        coins: createdUser.coins,
        emailTime: createdUser.emailTime,
        notifications: createdUser.notifications,
      },
    });
  } catch (error) {
    console.log("Error:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcryptjs.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const configData = await Config.findOne();
    if (!configData) {
      return res.status(500).json({ message: "Config not found" });
    }

    const currentUserTypes = configData.userTypes;

    const userType = currentUserTypes[user.userType] || user.userType;

    res.status(200).json({
      message: "Login successful",
      user: {
        _id: user._id,
        fullname: user.fullname,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage,
        userType,
        subscriptionEndDate: user.subscriptionEndDate,
        createdAt: user.createdAt,
        coins: user.coins,
        emailTime: user.emailTime,
      },
    });
  } catch (error) {
    console.error("Error: ", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getUserData = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.status(200).json({ success: true, user });
  } catch (error) {
    console.error("Error fetching user data:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const editUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const { fullname, email, password } = req.body;
    let updatedData = { fullname, email };

    // Hash new password if provided
    if (password) {
      updatedData.password = await bcryptjs.hash(password, 10);
    }

    // Check if profile image is being updated
    if (req.files && req.files.profileImage) {
      const { profileImage } = req.files;
      const allowedFormats = [
        "image/png",
        "image/jpeg",
        "image/webp",
        "image/jpg",
      ];

      if (!allowedFormats.includes(profileImage.mimetype)) {
        return res
          .status(400)
          .json({ message: "File format is not supported" });
      }

      // Upload new image to Cloudinary
      const cloudinaryResponse = await cloudinary.uploader.upload(
        profileImage.tempFilePath,
        { folder: "PLANNER_USERS" }
      );

      if (!cloudinaryResponse || cloudinaryResponse.error) {
        return res
          .status(500)
          .json({ message: "Failed to upload profile image to cloudinary" });
      }

      updatedData.profileImage = {
        public_id: cloudinaryResponse.public_id,
        url: cloudinaryResponse.secure_url,
      };
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updatedData, {
      new: true,
    }).select("-password");
    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res
      .status(200)
      .json({ message: "Profile updated successfully", user: updatedUser });
  } catch (error) {
    console.error("Error updating user data:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getUserNotifications = async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.status(200).json({ success: true, notifications: user.notifications });
  } catch (error) {
    console.error("Error in getUserNotifications:", error);
    res.status(500).json({ success: false, message: "Server Error", error });
  }
};

export const markNotificationsAsRead = async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    user.notifications.forEach((notif) => {
      notif.read = true;
    });

    user.notifications = user.notifications.filter((notif) => !notif.read);

    await user.save();

    res.status(200).json({ success: true, notifications: user.notifications });
  } catch (error) {
    console.error("Error in markNotificationsAsRead:", error);
    res.status(500).json({ success: false, message: "Server Error", error });
  }
};

export const githubAuth = passport.authenticate("github", {
  scope: ["user:email"],
});

export const googleAuth = passport.authenticate("google", {
  scope: ["profile", "email"],
});

export const githubCallback = (req, res) => {
  if (!req.user) {
    return res.redirect(`${process.env.FRONTEND_URL}/login?error=Unauthorized`);
  }

  const token = generateToken(req.user._id);
  
  res.cookie("userToken", token, {
  httpOnly: true,
  secure: true,
  sameSite: "None", 
});


  res.redirect(`${process.env.FRONTEND_URL}/auth-success`);
};

export const googleCallback = githubCallback; // Same logic for Google

export const authSuccess = async (req, res) => {
  try {
    const token = req.cookies?.userToken;
    if (!token) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const decoded = await jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ user });
  } catch (error) {
    console.error("Auth Success Error:", error);
    res.status(401).json({ message: "Invalid or expired token" });
  }
};
