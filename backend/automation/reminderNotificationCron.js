import cron from "node-cron";
import AddReminder from "../model/addReminder.model.js";
import User from "../model/user.model.js";
import { sendEmail } from "../utils/sendEmail.js";

export const reminderNotificationCron = () => {
  cron.schedule("*/1 * * * *", async () => {
    try {
      const now = new Date();

      const roundedNow = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        now.getHours(),
        now.getMinutes(),
        0,
        0
      );

      // Find tasks where reminderDateTime is exactly equal to current time AND email has not been sent
      const upcomingTasks = await AddReminder.find({
        reminderDateTime: roundedNow,
      });

      for (const task of upcomingTasks) {
        const user = await User.findById(task.userId);
        if (user && user.email) {
          await sendEmail({
            email: user.email,
            userType: user.userType,
            taskName: task.taskName,
          });
        }
      }
    } catch (error) {
      console.error("Error in reminder cron job:", error);
    }
  });
};
