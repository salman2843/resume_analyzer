import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { Router } from "express";
import multer from "multer";
import { listResumes, uploadResume } from "../controllers/resume.controller.js";
import { requireAuth } from "../middleware/auth.js";
import { HttpError } from "../utils/httpError.js";

const router = Router();
const uploadDir = path.join(process.cwd(), "uploads", "resumes");

fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, callback) => {
    callback(null, uploadDir);
  },
  filename: (_req, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase() || ".pdf";
    callback(null, `${randomUUID()}${extension}`);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024
  },
  fileFilter: (_req, file, callback) => {
    if (file.mimetype !== "application/pdf") {
      callback(new HttpError(400, "Only PDF resumes are supported"));
      return;
    }

    callback(null, true);
  }
});

router.use(requireAuth);
router.get("/", listResumes);
router.post("/", upload.single("resume"), uploadResume);

export default router;
