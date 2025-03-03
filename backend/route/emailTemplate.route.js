import express from "express";
import {
  setEmailTemplate,
} from "../controller/emailTemplate.controller.js";
const router = express.Router();

router.post("/set-template", setEmailTemplate);

export default router;
