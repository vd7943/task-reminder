import express from "express";
import {
  getUserTypes,
  updateUserTypes,
} from "../controller/config.controller.js";
const router = express.Router();

router.get("/get-user-type", getUserTypes);
router.post("/update-user-type", updateUserTypes);

export default router;
