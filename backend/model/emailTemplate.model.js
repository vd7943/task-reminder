import mongoose from "mongoose";

const emailTemplateSchema = new mongoose.Schema({
  planName: { type: String, required: true },
  createdBy: { type: String, required: true },
  subject: { type: String, required: true },
  body: { type: String, required: true },
});

const EmailTemplate = mongoose.model("EmailTemplate", emailTemplateSchema);
export default EmailTemplate;
