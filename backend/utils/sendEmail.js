import nodeMailer from "nodemailer";
import { config } from "dotenv";

config();

export const sendEmail = async ({ userEmail, subject, body }) => {
  try {
    const transporter = nodeMailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      service: process.env.SMTP_SERVICE,
      auth: {
        user: process.env.SMTP_MAIL,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    const options = {
      from: process.env.SMTP_MAIL,
      to: userEmail,
      subject,
      html: body,
    };

    await transporter.sendMail(options);
  } catch (error) {
    console.error("Error sending email:", error);
  }
};
