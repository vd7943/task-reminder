import nodeMailer from "nodemailer";
import EmailTemplate from "../model/emailTemplate.model.js";
import { config } from "dotenv";

config();

export const sendEmail = async ({ email, userType, taskName }) => {
  const transporter = nodeMailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    service: process.env.SMTP_SERVICE,
    auth: {
      user: process.env.SMTP_MAIL,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  const template = await EmailTemplate.findOne({ userType });

  if (!template) {
    console.error(`No email template found for userType: ${userType}`);
    return;
  }

  const frontendUrl = process.env.FRONTEND_URL;
  const taskLink = template.taskLink;

  let emailBody = `
    <p>${template.body}</p>  
    <p><strong>Task Name:</strong> ${taskName}</p>  
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

  const emailSubject = `${template.subject} - ${taskName}`;

  const options = {
    from: process.env.SMTP_MAIL,
    to: email,
    subject: emailSubject,
    html: emailBody,
  };

  await transporter.sendMail(options);
};
