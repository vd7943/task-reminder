import nodeMailer from "nodemailer";
import EmailTemplate from "../model/emailTemplate.model.js";
import { config } from "dotenv";
import User from "../model/user.model.js";

config();

export const sendEmail = async ({
  email,
  planName,
  taskName,
  taskDescription,
  taskLink,
  userType,
  userId,
}) => {
  const user = await User.findById(userId);

  if (!user) {
    console.error(`User not found: ${userId}`);
    return;
  }

  const transporter = nodeMailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    service: process.env.SMTP_SERVICE,
    auth: {
      user: process.env.SMTP_MAIL,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  const createdBy = userType === "Manage" ? "Admin" : "Custom";
  const templates = await EmailTemplate.find({ planName, createdBy });

  if (!templates.length) {
    console.error(
      `No email templates found for plan: ${planName}, set by: ${createdBy}`
    );
    return;
  }
  const randomTemplate =
    templates[Math.floor(Math.random() * templates.length)];
  const frontendUrl = process.env.FRONTEND_URL;

  let emailBody = `
    <p>${randomTemplate.body}</p>  
    <p><strong>Task Name:</strong> ${taskName}</p>  
    <p><strong>Task Description:</strong> ${taskDescription}</p>
    <p><strong>Task Link:</strong> <a href="${taskLink}" target="_blank">${taskLink}</a></p>
  `;

  const completedButton = `<a href="${frontendUrl}/remark" 
    style="background-color:#28a745; color:white; padding:10px 15px; text-decoration:none; border-radius:5px;">
    Completed
  </a>`;

  const notCompletedButton = `<a href="https://mail.google.com/mail/u/0/#inbox" target="_blank" 
    style="background-color:#dc3545; color:white; padding:10px 15px; text-decoration:none; border-radius:5px;">
    Not Completed
  </a>`;

  emailBody += `<br><br>${completedButton} &nbsp; ${notCompletedButton}`;

  const emailSubject = `${randomTemplate.subject} - ${planName}`;

  const options = {
    from: process.env.SMTP_MAIL,
    to: email,
    subject: emailSubject,
    html: emailBody,
  };

  await transporter.sendMail(options);
};
