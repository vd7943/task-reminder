import User from "../model/user.model.js";
import bcryptjs from "bcryptjs";
import { v2 as cloudinary } from "cloudinary";
import "../config/passport.js";
import passport from "passport";

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
    const user = await User.findOne({ email });
    if (user) {
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
      payments: [],
      notifications: [],
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
    const isMatch = await bcryptjs.compare(password, user.password);
    if (!user || !isMatch) {
      res.status(400).json({ message: "Invalid email or password" });
    } else {
      res.status(200).json({
        message: "Login successfull",
        user: {
          _id: user._id,
          fullname: user.fullname,
          email: user.email,
          role: user.role,
          profileImage: user.profileImage,
          userType: user.userType,
          subscriptionEndDate: user.subscriptionEndDate,
          createdAt: user.createdAt,
          coins: user.coins,
        },
      });
    }
  } catch (error) {
    console.log("Error: ", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getUserData = async (req, res) => {
  try {
    const userId = req.params.id;

    // Fetch user data from database
    const user = await User.findById(userId).select("-password"); // Exclude password

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

export const googleCallback = (req, res) => {
  console.log("Authenticated User:", req.user);

  if (!req.user) {
    return res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_failed`);
  }

  res.redirect(
    `${process.env.FRONTEND_URL}/auth-success?user=${encodeURIComponent(
      JSON.stringify(req.user)
    )}`
  );
};

export const githubCallback = (req, res) => {
  console.log("Authenticated User:", req.user);

  if (!req.user) {
    return res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_failed`);
  }

  res.redirect(
    `${process.env.FRONTEND_URL}/auth-success?user=${encodeURIComponent(
      JSON.stringify(req.user)
    )}`
  );
};


export const authSuccess = (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  res.status(200).json({ user: req.user });
};
