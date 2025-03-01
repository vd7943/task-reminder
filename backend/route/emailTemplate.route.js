import express from "express";
import {
  getEmailTemplate,
  setEmailTemplate,
} from "../controller/emailTemplate.controller.js";
const router = express.Router();

router.post("/set-template", setEmailTemplate);
router.get("/templates", getEmailTemplate);

export default router;
