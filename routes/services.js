import express from "express";
const router = express.Router();
import auth from "../middleware/auth.js";

import {
  createServices,
  deleteServices,
  getServices,
  getServicess,
  getServicessBySearch,
  getServicessByUser,
  updateServices,
} from "../controllers/services.js";
router.get("/search", getServicessBySearch);
router.get("/", getServicess);
router.get("/:id", getServices);

router.post("/", auth, createServices);
router.delete("/:id", auth, deleteServices);
router.patch("/:id", auth, updateServices);
router.get("/userServicess/:id", auth, getServicessByUser);

export default router;
