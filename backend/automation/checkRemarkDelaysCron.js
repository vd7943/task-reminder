import cron from "node-cron";
import User from "../model/user.model.js";
import Plan from "../model/plan.model.js";
import Remark from "../model/remark.model.js";

export const checkRemarkDelaysCron = async () => {
  try {
    const users = await User.find({ isDeactivated: false });

    for (const user of users) {
      const userPlans = await Plan.find({ userId: user._id });

      const fiveDaysAgo = new Date();
      fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);
      const fiveDaysAgoStr = fiveDaysAgo.toISOString().split("T")[0]; // Convert to YYYY-MM-DD format

      let hasPendingUnremarkedTasks = false;

      for (const plan of userPlans) {
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
        if (hasPendingUnremarkedTasks) break;
      }

      if (hasPendingUnremarkedTasks && !user.emailBlocked) {
        user.emailBlocked = true;
        user.notifications.push({
          message:
            "You have not added a remark for a task in the last 5 days. Email notifications have been paused until you add a remark.",
        });
        await user.save();
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
