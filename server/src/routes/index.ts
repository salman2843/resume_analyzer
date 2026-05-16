import { Router } from "express";
import authRoutes from "./auth.routes.js";
import healthRoutes from "./health.routes.js";
import resumeRoutes from "./resume.routes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/health", healthRoutes);
router.use("/resumes", resumeRoutes);

export default router;
