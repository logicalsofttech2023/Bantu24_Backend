import express from "express";
import { getUserById, loginUser, registerUser, verifyOtp } from "../controllers/UserController.js";
import { validate } from "../middleware/validateMiddleware.js";
import { registerUserSchema } from "../validators/userValidator.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { uploadProfile } from "../middleware/uploadMiddleware.js";
const router = express.Router();

router.post("/registerUser", uploadProfile.fields([{ name: "profileImage", maxCount: 1 }]), registerUser);
router.post("/verifyOtp", uploadProfile.fields([{ name: "profileImage", maxCount: 1 }]),  verifyOtp);
router.post("/loginUser", loginUser);
router.get("/getUserById", authMiddleware, getUserById);

export default router;