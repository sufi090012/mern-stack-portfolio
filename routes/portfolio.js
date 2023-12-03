import express from "express";
const router = express.Router();
import auth from "../middleware/auth.js";

import {
  createPortfolio,
  deletePortfolio,
  getPortfolio,
  getPortfolios,
  getPortfoliosBySearch,
  getPortfoliosByUser,
  updatePortfolio,
} from "../controllers/portfolio.js";
router.get("/search", getPortfoliosBySearch);
router.get("/", getPortfolios);
router.get("/:id", getPortfolio);

router.post("/", auth, createPortfolio);
router.delete("/:id", auth, deletePortfolio);
router.patch("/:id", auth, updatePortfolio);
router.get("/userPortfolios/:id", auth, getPortfoliosByUser);

export default router;
