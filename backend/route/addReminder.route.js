import express from "express";
import {
  addNewReminder,
  editTask,
  getAllTasks,
  getTodayReminders,
} from "../controller/addReminder.controller.js";

const router = express.Router();

router.post("/task-reminder", addNewReminder);
router.get("/:id", getAllTasks);
router.put("/edit-task/:id", editTask);
router.get("/today-task/:id", getTodayReminders);

export default router;
