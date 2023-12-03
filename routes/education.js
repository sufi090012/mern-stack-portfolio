import express from "express";
const router = express.Router();
import auth from "../middleware/auth.js";

import {
  createEducation,
  deleteEducation,
  getEducation,
  getEducations,
  getEducationsBySearch,
  getEducationsByUser,
  updateEducation,
} from "../controllers/education.js";
router.get("/search", getEducationsBySearch);
router.get("/", getEducations);
router.get("/:id", getEducation);

router.post("/", auth, createEducation);
router.delete("/:id", auth, deleteEducation);
router.patch("/:id", auth, updateEducation);
router.get("/userEducations/:id", auth, getEducationsByUser);

export default router;
