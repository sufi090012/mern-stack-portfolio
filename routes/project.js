import express from "express";
const router = express.Router();
import auth from "../middleware/auth.js";

import {
  createProject,
  deleteProject,
  getProject,
  getProjects,
  getProjectsBySearch,
  getProjectsByUser,
  updateProject,
} from "../controllers/project.js";
router.get("/search", getProjectsBySearch);
router.get("/", getProjects);
router.get("/:id", getProject);

router.post("/", auth, createProject);
router.delete("/:id", auth, deleteProject);
router.patch("/:id", auth, updateProject);
router.get("/userProjects/:id", auth, getProjectsByUser);

export default router;
