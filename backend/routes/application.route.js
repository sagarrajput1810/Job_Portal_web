import express from "express";
import multer from "multer";
import { applyJob, getApplicants, getAppliedJobs, updateStatus, downloadResume } from "../controllers/application.controller.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";

const router = express.Router();
// memory storage, we will stream buffer to GridFS
const upload = multer({ storage: multer.memoryStorage() });

router.route("/apply/:id").post(isAuthenticated, upload.single("resume"), applyJob);
router.route("/get").get(isAuthenticated,getAppliedJobs);
router.route("/:id/applicants").get(isAuthenticated,getApplicants);
router.route("/status/:id/update").post(isAuthenticated,updateStatus);
// stream a resume file from GridFS by file id
router.route("/resume/:fileId").get(isAuthenticated, downloadResume);

export default router;
