import express from "express";
const router = express.Router();
import {
  signup,
  signin,
  changeEmail,
  changePassword,
} from "../controllers/user.js";
import auth from "../middleware/auth.js";

router.post("/signup", signup);
router.post("/signin", signin);
router.post("/changeEmail", auth, changeEmail);
router.post("/changePassword", auth, changePassword);

export default router;
