import EmailTemplate from "../model/emailTemplate.model.js";

export const setEmailTemplate = async (req, res) => {
  try {
    const { userType, subject, body, taskLink } = req.body;
    let template = await EmailTemplate.findOne({ userType });

    if (template) {
      template.subject = subject;
      template.body = body;
      template.taskLink = taskLink;
    } else {
      template = new EmailTemplate({ userType, subject, body, taskLink });
    }

    await template.save();
    res.status(200).json({ message: "Template saved successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error saving template", error });
  }
};

export const getEmailTemplate = async (req, res) => {
  const templates = await EmailTemplate.find();
  res.json(templates);
};
