import { sendEmail } from "../utils/sendEmail.js";
import { config } from "dotenv";

config();

export const contactForm = async (req, res) => {
  try {
    const { name, phone, email, enquiry } = req.body;

    if (!name || !phone || !email || !enquiry) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const submissionDate = new Date().toLocaleString("en-US", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    const subject = `New Contact Form Submission from ${name}`;
    const body = `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #9D60EC; color: #ffffff; padding: 20px; text-align: center; font-size: 20px; font-weight: bold;">
          New Contact Form Submission
        </div>
        <div style="padding: 20px; background-color: #f9f9f9;">
          <p style="font-size: 16px; color: #333;"><strong>Name:</strong> ${name}</p>
          <p style="font-size: 16px; color: #333;"><strong>Email:</strong> ${email}</p>
          <p style="font-size: 16px; color: #333;"><strong>Phone:</strong> ${phone}</p>
          <p style="font-size: 16px; color: #333;"><strong>Enquiry:</strong> ${enquiry}</p>
                     <p style="font-size: 16px; color: #333;"><strong>Submission Date:</strong> ${submissionDate}</p>
        </div>
      </div>
    `;

    await sendEmail({
      userEmail: "dalmiavishesh786@gmail.com",
      subject,
      body,
    });

    res.status(200).json({ message: "Message Sent Successfully!" });
  } catch (error) {
    console.error("Error sending contact form:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
