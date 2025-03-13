import cron from "node-cron";
import User from "../model/user.model.js";
import Plan from "../model/plan.model.js";
import Remark from "../model/remark.model.js";
import CoinRule from "../model/coinRule.model.js";

export const checkRemarkDelaysCron = async () => {
  try {
    const users = await User.find({ isDeactivated: false });

    const coinRule = await CoinRule.findOne();
    const planRestartCoins = coinRule?.planRestartCoins;

    for (const user of users) {
      const userPlans = await Plan.find({ userId: user._id, status: "Active" });

      const fiveDaysAgo = new Date();
      fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);
      const fiveDaysAgoStr = fiveDaysAgo.toISOString().split("T")[0]; // Convert to YYYY-MM-DD format

      for (const plan of userPlans) {
        let hasPendingUnremarkedTasks = false;

        for (const task of plan.tasks) {
          for (const schedule of task.schedule) {
            if (schedule.date <= fiveDaysAgoStr) {
              const remarkExists = await Remark.findOne({
                userId: user._id,
                taskName: task.taskName,
                taskDate: schedule.date,
              });

              if (!remarkExists) {
                hasPendingUnremarkedTasks = true;
                break;
              }
            }
          }
          if (hasPendingUnremarkedTasks) break;
        }

        if (hasPendingUnremarkedTasks) {
          plan.status = "Paused"; // Pause the plan
          await plan.save();

          user.notifications.push({
            message: `Your plan "${plan.planName}" has been paused due to missing remarks for 5 days. You need to pay ${planRestartCoins} coins to restart.`,
          });
          await user.save();
        }
      }
    }
  } catch (error) {
    console.error("Error in checkRemarkDelaysCron:", error);
  }
};

cron.schedule("0 0 * * *", async () => {
  console.log("Running checkRemarkDelaysCron...");
  await checkRemarkDelaysCron();
});
