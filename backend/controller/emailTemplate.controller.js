import EmailTemplate from "../model/emailTemplate.model.js";

export const setEmailTemplate = async (req, res) => {
  try {
    const { planName, createdBy, subject, body } = req.body;

    const template = new EmailTemplate({
      planName,
      createdBy,
      subject,
      body,
    });

    await template.save();
    res.status(200).json({ message: "Template saved successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error saving template", error });
  }
};

export const getEmailTemplatesByCreatedBy = async (req, res) => {
  try {
    const { createdBy } = req.params; // "Custom" or "Admin"
    const templates = await EmailTemplate.find({ createdBy });

    const groupedTemplates = templates.reduce((acc, template) => {
      if (!acc[template.planName]) {
        acc[template.planName] = [];
      }
      acc[template.planName].push(template);
      return acc;
    }, {});

    res.status(200).json({ templates: groupedTemplates });
  } catch (error) {
    res.status(500).json({ message: "Error fetching templates", error });
  }
};

export const updateEmailTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const { subject, body } = req.body;

    const updatedTemplate = await EmailTemplate.findByIdAndUpdate(
      id,
      { subject, body },
      { new: true }
    );

    if (!updatedTemplate) {
      return res.status(404).json({ message: "Template not found" });
    }

    res
      .status(200)
      .json({ message: "Template updated successfully", updatedTemplate });
  } catch (error) {
    res.status(500).json({ message: "Error updating template", error });
  }
};
