import express from "express";
import passport from "passport";
import {
  editUser,
  getUserData,
  githubAuth,
  googleAuth,
  githubCallback,
  googleCallback,
  authSuccess,
  login,
  signup,
  getUserNotifications,
  markNotificationsAsRead,
} from "../controller/user.controller.js";
import { config } from "dotenv";

const router = express.Router();
config();
router.post("/signup", signup);
router.post("/login", login);
router.get("/:id", getUserData);
router.put("/edit/:id", editUser);
router.get("/notifications/:userId", getUserNotifications);
router.put("/notifications/read/:userId", markNotificationsAsRead);

router.get("/auth/github", githubAuth);

router.get(
  "/auth/github/callback",
  passport.authenticate("github", { failureRedirect: "/login" }),
  githubCallback
);

router.get("/auth/google", googleAuth);
router.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  googleCallback
);

// API endpoint to send authenticated user data
router.get("/auth/success", authSuccess);

export default router;
