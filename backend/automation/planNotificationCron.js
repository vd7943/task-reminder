import cron from "node-cron";
import Plan from "../model/plan.model.js";
import User from "../model/user.model.js";
import EmailTemplate from "../model/emailTemplate.model.js";
import { sendEmail } from "../utils/sendEmail.js";
import { config } from "dotenv";
import path from "path";
import fs from "fs";

config();

const mappingPath = path.resolve("config/userTypeMappings.json");

let userTypes = [];

try {
  const data = JSON.parse(fs.readFileSync(mappingPath));
  userTypes = data.userTypes || [];
} catch {
  userTypes = [];
}

function isSentToday(date) {
  if (!date) return false;
  const now = new Date();
  return (
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear()
  );
}

export const planNotificationCron = () => {
  cron.schedule("* * * * *", async () => {
    try {
      const users = await User.find({ isDeactivated: false });
      const now = new Date();

      for (const user of users) {
        if (!user.emailTime) continue;

        if (isSentToday(user.lastEmailSentAt)) continue;

        const [emailHour, emailMinute] = user.emailTime.split(":").map(Number);
        const emailDate = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate(),
          emailHour,
          emailMinute,
          0
        );

        const timeDiffMin = (emailDate - now) / 60000;

        if (timeDiffMin < 5 || timeDiffMin > 10) continue;

        const plans = await Plan.find({ userId: user._id, status: "Active" });
        if (!plans.length) continue;

        const todayDate = now.toISOString().split("T")[0];

        let allTodayTasks = [];
        let applicablePlanNames = new Set();

        for (const plan of plans) {
          const todayTasks = plan.tasks
            .map((task) => {
              const scheduleIndex = task.schedule.findIndex(
                (s) => s.date === todayDate
              );
              if (scheduleIndex !== -1) {
                return { ...task.toObject(), todayDayIndex: scheduleIndex };
              }
              return null;
            })
            .filter(Boolean);

          if (todayTasks.length) {
            allTodayTasks.push(...todayTasks);
            applicablePlanNames.add(plan.planName);
          }
        }

        if (!allTodayTasks.length) continue;

        const createdByTypes = [];
        if (user.userType === userTypes[1]) createdByTypes.push(userTypes[1]);
        if (plans.some((p) => p.adminPlanId)) createdByTypes.push("Admin");

        const templates = await EmailTemplate.find({
          planName: { $in: Array.from(applicablePlanNames) },
          createdBy: { $in: createdByTypes },
        });

        if (!templates.length) continue;

        const randomTemplate =
          templates[Math.floor(Math.random() * templates.length)];

        let taskTable = `
          <br/><br/>
          <table border="1" cellspacing="0" cellpadding="5" style="border-collapse: collapse; width: 100%;">
            <tr style="background-color: #f2f2f2;">
              <th style="padding: 10px; border: 1px solid #ddd;">Task Name</th>
              <th style="padding: 10px; border: 1px solid #ddd;">Task Link</th>
              <th style="padding: 10px; border: 1px solid #ddd;">Task Day</th>
              <th style="padding: 10px; border: 1px solid #ddd;">Action</th>
            </tr>`;

        allTodayTasks.forEach((task) => {
          taskTable += `
    <tr>
      <td style="padding: 10px; border: 1px solid #ddd; text-align: center;">${task.taskName}</td>
      <td style="padding: 10px; border: 1px solid #ddd; text-align: center;">
        <a href="${task.taskLink}" style="color: #007bff; text-decoration: none;">View Task</a>
      </td>
      <td style="padding: 10px; border: 1px solid #ddd; text-align: center;">${task.todayDayIndex}</td>
      <td style="padding: 10px; border: 1px solid #ddd; text-align: center;">
        <a href="${process.env.FRONTEND_URL}/task-calendar" style="color: green; text-decoration: none;">Mark as Completed</a>
      </td>
    </tr>`;
        });

        taskTable += `</table>`;

        const finalSubject = randomTemplate.subject.replace(
          "${userName}",
          user.fullname
        );
        const finalBody =
          randomTemplate.body.replace("${userName}", user.fullname) + taskTable;

        await sendEmail({
          userEmail: user.email,
          subject: finalSubject,
          body: finalBody,
        });

        user.lastEmailSentAt = new Date();
        await user.save();
      }
    } catch (error) {
      console.error("Email notification error:", error);
    }
  });
};
