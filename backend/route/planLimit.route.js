import express from "express";
import {
  getPlanLimit,
  setPlanLimit,
} from "../controller/planLimit.controller.js";

const router = express.Router();

router.get("/get-plan-limit", getPlanLimit);
router.post("/set-plan-limit", setPlanLimit);

export default router;
