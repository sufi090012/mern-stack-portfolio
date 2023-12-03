import express from "express";
const router = express.Router();
import auth from "../middleware/auth.js";

import {
  createTestimonial,
  deleteTestimonial,
  getTestimonial,
  getTestimonials,
  getTestimonialsBySearch,
  getTestimonialsByUser,
  updateTestimonial,
} from "../controllers/testimonial.js";
router.get("/search", getTestimonialsBySearch);
router.get("/", getTestimonials);
router.get("/:id", getTestimonial);

router.post("/", auth, createTestimonial);
router.delete("/:id", auth, deleteTestimonial);
router.patch("/:id", auth, updateTestimonial);
router.get("/userTestimonials/:id", auth, getTestimonialsByUser);

export default router;
