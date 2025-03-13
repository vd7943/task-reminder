import User from "../model/user.model.js";
import Remark from "../model/remark.model.js";
import CoinRule from "../model/coinRule.model.js";
import Plan from "../model/plan.model.js";

const calculateCoins = async (taskDuration) => {
  const rules = await CoinRule.find({});
  rules.sort((a, b) => b.minDuration - a.minDuration);

  for (const rule of rules) {
    if (taskDuration >= rule.minDuration) {
      return Math.floor(taskDuration / rule.minDuration) * rule.coins;
    }
  }
  return 0;
};

export const addRemark = async (req, res) => {
  const { taskName, taskDate, taskDuration, taskReview, taskSummary, userId } =
    req.body;

  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  try {
    const todayDate = new Date().toISOString().split("T")[0];
    const userPlan = await Plan.findOne({ userId, "tasks.taskName": taskName });

    if (!userPlan) {
      return res.status(404).json({
        success: false,
        message: "Task not found in user's plan.",
      });
    }
    const task = userPlan.tasks.find((t) => t.taskName === taskName);
    const scheduledTask = task.schedule.find((s) => s.date === taskDate);

    // Ensure user is adding remark on or after the scheduled date
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
    const rules = await CoinRule.find({});
    const minDuration = rules[0]?.minDuration || 0;

    if (taskDuration < minDuration) {
      return res.status(400).json({
        success: false,
        message: `Please add a minimum duration of ${minDuration} minutes.`,
      });
    }

    const coinsToAdd = await calculateCoins(taskDuration);

    const remark = new Remark({
      userId: user._id,
      taskName,
      taskDate,
      taskDuration,
      taskReview,
      taskSummary,
      coinsEarned: coinsToAdd,
    });
    await remark.save();

    await User.findByIdAndUpdate(userId, { $inc: { coins: coinsToAdd } });

    const updatedUser = await User.findById(userId);
    const freeSubsCoins = rules[0]?.freeSubsCoins;

    let subscriptionMessage = null;
    if (updatedUser.coins >= freeSubsCoins && freeSubsCoins > 0) {
      const monthsEarned = Math.floor(updatedUser.coins / freeSubsCoins);
      const remainingCoins = updatedUser.coins % freeSubsCoins;

      updatedUser.coins = remainingCoins;
      updatedUser.userType = "Custom";

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

const checkUnremarkedTasks = async (userId) => {
  const userPlans = await Plan.find({ userId });

  for (const plan of userPlans) {
    for (const task of plan.tasks) {
      for (const schedule of task.schedule) {
        const scheduledDateObj = new Date(schedule.date); // Convert string to Date object
        const fiveDaysAgo = new Date();
        fiveDaysAgo.setDate(new Date().getDate() - 5);

        if (scheduledDateObj <= fiveDaysAgo) {
          const remarkExists = await Remark.findOne({
            userId,
            taskName: task.taskName,
            taskDate: schedule.date,
          });

          if (!remarkExists) return true;
        }
      }
    }
  }
  return false;
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
