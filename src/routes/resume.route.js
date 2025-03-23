import express from "express";
import multer from "multer";
import authMiddleware from "../middlewares/authMiddleware.js";
import { uploadResumeController, getUserResumesController, getJobRecommendationsController } from "../controllers/resume.controller.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/", authMiddleware, upload.single("resume"), uploadResumeController);
router.get("/getResume", authMiddleware, getUserResumesController);
router.get("/recommendations", authMiddleware, getJobRecommendationsController);

export default router;