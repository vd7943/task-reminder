import cron from "node-cron";
import Plan from "../model/plan.model.js";
import User from "../model/user.model.js";
import { sendEmail } from "../utils/sendEmail.js";
import { config } from "dotenv";

config();

export const planNotificationCron = () => {
  cron.schedule("*/1 * * * *", async () => {
    try {
      const now = new Date();
      const currentDate = now.toISOString().slice(0, 10); // YYYY-MM-DD
      const currentTime = now.toTimeString().slice(0, 5); // HH:MM format

      const plans = await Plan.find();

      for (const plan of plans) {
        if (plan.userRole === "Admin") continue;

        const user = await User.findById(plan.userId);
         if (!user || !user.email || user.isDeactivated) continue;

        for (const task of plan.tasks) {
          const matchingSchedules = task.schedule.filter(
            (sched) => sched.date === currentDate && sched.time === currentTime
          );

          for (const schedule of matchingSchedules) {
            await sendEmail({
              email: user.email,
              planName: plan.planName,
              taskName: task.taskName,
              taskDescription: task.taskDescription,
              taskLink: task.taskLink,
              userType: user.userType,
            });
          }
        }
      }
    } catch (error) {
      console.error("Error in reminder cron job:", error);
    }
  });
};
