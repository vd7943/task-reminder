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

      // Fetch all plans
      const plans = await Plan.find();

      for (const plan of plans) {
        if (plan.userRole === "Admin") continue; // Skip admin users
        const user = await User.findById(plan.userId);
        if (!user || !user.email) continue;

        for (const reminder of plan.reminders) {
          // Check each schedule within the reminder
          const matchingSchedules = reminder.schedule.filter(
            (sched) => sched.date === currentDate && sched.time === currentTime
          );

          for (const schedule of matchingSchedules) {
            await sendEmail({
              email: user.email,
              userType: user.userType,
              taskName: plan.planName,
            });
          }
        }
      }
    } catch (error) {
      console.error("Error in reminder cron job:", error);
    }
  });
};
