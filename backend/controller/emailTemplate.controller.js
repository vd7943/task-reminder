import EmailTemplate from "../model/emailTemplate.model.js";

export const setEmailTemplate = async (req, res) => {
  try {
    const { planName, createdBy, subject, body, taskLink } = req.body;

    const existingTemplate = await EmailTemplate.findOne({
      planName,
      createdBy,
    });

    if (existingTemplate) {
      return res.status(400).json({
        message: "An email template already exists for this plan.",
      });
    }

    const template = new EmailTemplate({
      planName,
      createdBy,
      subject,
      body,
      taskLink,
    });

    await template.save();
    res.status(200).json({ message: "Template saved successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error saving template", error });
  }
};
