import express from "express";
import {
  addNewPlan,
  getAllPlans,
  getPlanById,
  getPlans,
  getTodayPlans,
  optForPlan,
  updateTask,
  updatePlanStatus,
  getCoinsEarnedForPlan,
  deletePlan,
} from "../controller/plan.controller.js";

const router = express.Router();

router.post("/add-plan", addNewPlan);
router.post("/opt-plan", optForPlan);
router.get("/get-plan/:role/:userType", getAllPlans);
router.get("/get-user-plan/:id", getPlans);
router.get("/get-today-plan/:id", getTodayPlans);
router.get("/:id", getPlanById);
router.get("/coins-earned/:id", getCoinsEarnedForPlan);
router.put("/update-task/:planId/:taskId", updateTask);
router.put("/update-plan-status/:id/:userId", updatePlanStatus);
router.delete("/delete/:userId/:planId", deletePlan);

export default router;
