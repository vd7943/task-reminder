import AddReminder from "../model/addReminder.model.js";
import User from "../model/user.model.js";
import dayjs from "dayjs";

export const addNewReminder = async (req, res) => {
  const {
    taskName,
    category,
    reminderDateTime,
    scheduleDateTime,
    taskDuration,
    taskDescription,
    userId,
  } = req.body;

  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  try {
    const existingTask = await AddReminder.findOne({
      userId,
      taskName,
    });

    if (existingTask) {
      return res
        .status(400)
        .json({ success: false, message: "Task already exists" });
    }

    const newPlan = new AddReminder({
      userId: user._id,
      taskName,
      category,
      reminderDateTime,
      scheduleDateTime,
      taskDuration,
      taskDescription,
    });
    await newPlan.save();
    res
      .status(201)
      .json({ message: "Reminder added successfully", plan: newPlan });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

export const getAllTasks = async (req, res) => {
  const userId = req.params.id;

  try {
    const tasks = await AddReminder.find({
      userId: userId,
    });
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error", error });
  }
};

export const editTask = async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  try {
    const task = await AddReminder.findById(id);
    if (!task) {
      return res
        .status(404)
        .json({ success: false, message: "Task not found" });
    }

    Object.keys(updates).forEach((key) => {
      if (key === "scheduleDateTime" || key === "reminderDateTime") {
        task[key] = new Date(updates[key]);
      } else {
        task[key] = updates[key];
      }
    });

    await task.save();
    res
      .status(200)
      .json({ success: true, message: "Task updated successfully", task });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error", error });
  }
};

export const getTodayReminders = async (req, res) => {
  const userId = req.params.id;
  const todayStart = dayjs().startOf("day").toDate();
  const todayEnd = dayjs().endOf("day").toDate();

  try {
    const todayReminders = await AddReminder.find({
      userId: userId,
      scheduleDateTime: { $gte: todayStart, $lte: todayEnd },
    });

    res.status(200).json(todayReminders);
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error", error });
  }
};
