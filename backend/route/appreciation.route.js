import express from "express";
import { getTopAppreciations } from "../controller/appreciation.controller.js";

const router = express.Router();

router.get("/appreciations", getTopAppreciations);

export default router;
