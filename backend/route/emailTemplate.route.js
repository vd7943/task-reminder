import express from "express";
import {
  getEmailTemplatesByCreatedBy,
  setEmailTemplate,
  updateEmailTemplate,
} from "../controller/emailTemplate.controller.js";
const router = express.Router();

router.post("/template/set-template", setEmailTemplate);
router.get("/templates/:createdBy", getEmailTemplatesByCreatedBy);
router.put("/update-template/:id", updateEmailTemplate);

export default router;
