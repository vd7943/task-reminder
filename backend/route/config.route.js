import express from "express";
import {
  getUserTypes,
  renameUserTypes,
} from "../controller/config.controller.js";
const router = express.Router();

router.post("/update-user-type", getUserTypes);
router.get("/get-user-type", renameUserTypes);

export default router;
