import cron from "node-cron";
import Plan from "../model/plan.model.js";
import User from "../model/user.model.js";
import EmailTemplate from "../model/emailTemplate.model.js";
import { sendEmail } from "../utils/sendEmail.js";

export const planNotificationCron = () => {
  cron.schedule("* * * * *", async () => {
    try {
      const users = await User.find({ isDeactivated: false });

      for (const user of users) {
        const now = new Date();
        const currentHourMinute = `${now
          .getHours()
          .toString()
          .padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;

        if (currentHourMinute !== user.emailTime) continue;

        const plan = await Plan.findOne({ userId: user._id, status: "Active" });
        if (!plan) continue;

        const todayDate = new Date().toISOString().split("T")[0];

        const todayTasks = plan.tasks.filter((task) =>
          task.schedule.some((s) => s.date === todayDate)
        );

        if (!todayTasks.length) continue;

        const templates = await EmailTemplate.find({
          planName: plan.planName,
          createdBy: user.userType === "Custom" ? "Custom" : "Admin",
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

        todayTasks.forEach((task) => {
          taskTable += `
            <tr>
              <td style="padding: 10px; border: 1px solid #ddd;">${task.taskName}</td>
              <td style="padding: 10px; border: 1px solid #ddd;">
                <a href="${task.taskLink}" style="color: #007bff; text-decoration: none;">View Task</a>
              </td>
              <td style="padding: 10px; border: 1px solid #ddd;">${task.days}</td>
              <td style="padding: 10px; border: 1px solid #ddd;">
                <a href="${task.completeLink}" style="color: green; text-decoration: none;">Mark as Completed</a>
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
      }
    } catch (error) {
      console.error("Email notification error:", error);
    }
  });
};
