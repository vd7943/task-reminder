import express from "express";
import { addRemark, getRemark } from "../controller/remark.controller.js";

const router = express.Router();

router.post("/set-remark", addRemark);
router.get("/:id", getRemark);

export default router;
