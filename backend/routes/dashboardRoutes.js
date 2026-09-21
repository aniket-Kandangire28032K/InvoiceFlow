import express from "express";
import { protect } from "../middleware/auth.js";
import { getDashboard } from "../controller/dashboardController.js";
const router = express.Router();
router.use(protect);
router.get("/", getDashboard);

export default router;
