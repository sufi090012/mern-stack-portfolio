import express from "express";
const router = express.Router();
import auth from "../middleware/auth.js";

import {
  createSkill,
  deleteSkill,
  getSkill,
  getSkills,
  getSkillsBySearch,
  getSkillsByUser,
  updateSkill,
} from "../controllers/skill.js";
router.get("/search", getSkillsBySearch);
router.get("/", getSkills);
router.get("/:id", getSkill);

router.post("/", auth, createSkill);
router.delete("/:id", auth, deleteSkill);
router.patch("/:id", auth, updateSkill);
router.get("/userSkills/:id", auth, getSkillsByUser);

export default router;
