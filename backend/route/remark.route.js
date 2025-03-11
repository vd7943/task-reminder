import express from "express";
import {
  addRemark,
  getPlanRemarks,
  getRemark,
} from "../controller/remark.controller.js";

const router = express.Router();

router.post("/set-remark", addRemark);
router.get("/:id", getRemark);
router.get("/get-remark/:taskId", getPlanRemarks);

export default router;
