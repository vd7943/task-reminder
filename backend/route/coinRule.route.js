import express from "express";
import {
  addOrUpdateCoinRule,
  getCoinRules,
} from "../controller/coinRule.controller.js";

const router = express.Router();

router.post("/coin-rules", addOrUpdateCoinRule);
router.get("/coin-rules", getCoinRules);

export default router;
