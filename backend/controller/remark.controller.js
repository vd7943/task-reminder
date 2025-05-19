import User from "../model/user.model.js";
import Remark from "../model/remark.model.js";
import CoinRule from "../model/coinRule.model.js";
import Plan from "../model/plan.model.js";
import path from "path";
import fs from "fs";

const mappingPath = path.resolve("config/userTypeMappings.json");

let userTypes = [];

try {
  const data = JSON.parse(fs.readFileSync(mappingPath));
  userTypes = data.userTypes || [];
} catch {
  userTypes = [];
}

export const addRemark = async (req, res) => {
  const {
    taskId,
    taskName,
    taskDate,
    taskReview,
    taskSummary,
    userId,
    planId,
    isPaidForPastRemark,
  } = req.body;

  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  try {
    const todayDate = new Date().toLocaleDateString("en-CA");
    const userPlan = await Plan.findOne({
      _id: planId,
      userId,
      "tasks._id": taskId,
    });

    if (!userPlan) {
      return res.status(404).json({
        success: false,
        message: "Task not found in user's plan.",
      });
    }

    if (userPlan.status !== "Active") {
      return res.status(403).json({
        success: false,
        message: "The plan is not active .",
      });
    }

    const task = userPlan.tasks.find((t) => t._id.toString() === taskId);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found in the plan.",
      });
    }

    const scheduledTask = task.schedule.find((s) => s.date === taskDate);
    if (!scheduledTask) {
      return res.status(400).json({
        success: false,
        message: `No scheduled task found for date: ${taskDate}`,
      });
    }

    if (todayDate < scheduledTask.date) {
      return res.status(400).json({
        success: false,
        message: `You can only add remarks on or after the scheduled date (${scheduledTask.date}).`,
      });
    }

    const existingRemark = await Remark.findOne({ taskName, taskDate, userId });
    if (existingRemark) {
      return res.status(400).json({
        success: false,
        message: "Remark already added for this task and date",
      });
    }

    const coinRule = await CoinRule.findOne({});

    const coinsToAdd = task.coinsEarned;

    const remark = new Remark({
      userId: user._id,
      taskId,
      taskName,
      taskDate,
      taskReview,
      taskSummary,
      coinsEarned: coinsToAdd,
      planId,
    });
    await remark.save();

    let notifications = [];

    await User.findByIdAndUpdate(userId, { $inc: { coins: coinsToAdd } });
    notifications.push({
      message: `🎉 You have earned ${coinsToAdd} coins for adding a remark for the task "${taskName}".`,
    });

    const allTasksOnDate = userPlan.tasks
      .map((t) => ({
        taskId: t._id.toString(),
        schedule: t.schedule.find((s) => s.date === taskDate),
        taskName: t.taskName,
      }))
      .filter((s) => s.schedule);

    const addedRemarks = await Remark.find({ userId, taskDate, planId });
    const allRemarked = allTasksOnDate.every((t) =>
      addedRemarks.some((r) => r.taskId === t.taskId)
    );

    const summaryIncluded = addedRemarks.some((r) => r.taskSummary?.trim());

    if (allRemarked && summaryIncluded) {
      const extraCoins = coinRule?.extraCoins || 0;
      await User.findByIdAndUpdate(userId, { $inc: { coins: extraCoins } });
      notifications.push({
        message: `🔥 Bonus! You earned ${extraCoins} extra coins for completing all task remarks and summary for ${taskDate}.`,
      });
    }

    if (isPaidForPastRemark) {
      const deductionCoins = coinRule?.addPastRemarkCoins || 0;
      await User.findByIdAndUpdate(userId, {
        $inc: { coins: -deductionCoins },
      });
      notifications.push({
        message: `⚠️ You used ${deductionCoins} coins to add a remark for the task ${taskName} on ${taskDate}.`,
      });
    }

    await User.findByIdAndUpdate(userId, {
      $push: { notifications: { $each: notifications } },
    });

    const updatedUser = await User.findById(userId);
    const freeSubsCoins = coinRule?.freeSubsCoins;

    let subscriptionMessage = null;
    if (updatedUser.coins >= freeSubsCoins && freeSubsCoins > 0) {
      const monthsEarned = Math.floor(updatedUser.coins / freeSubsCoins);
      const remainingCoins = updatedUser.coins % freeSubsCoins;

      updatedUser.coins = remainingCoins;
      updatedUser.userType = userTypes[1];

      const currentEndDate = updatedUser.subscriptionEndDate
        ? new Date(updatedUser.subscriptionEndDate)
        : new Date();
      updatedUser.subscriptionEndDate = new Date(
        new Date(currentEndDate).setMonth(
          currentEndDate.getMonth() + monthsEarned
        )
      );

      subscriptionMessage = `🎉 Congratulations! You've earned ${monthsEarned} month of free subscription for collecting ${freeSubsCoins} coins. You now have ${remainingCoins} coins left.`;

      updatedUser.notifications.push({ message: subscriptionMessage });
      await updatedUser.save();
    }

    res.status(201).json({
      success: true,
      message: "Remark added successfully",
      coinsEarned: coinsToAdd,
      subscriptionMessage,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

export const getPlanRemarks = async (req, res) => {
  try {
    const { planId } = req.params;
    const remarks = await Remark.find({ planId });

    res.status(200).json({ success: true, remarks });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

export const getRemark = async (req, res) => {
  const userId = req.params.id;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const remarks = await Remark.find({ userId });
    res.status(200).json({ success: true, remarks });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};
