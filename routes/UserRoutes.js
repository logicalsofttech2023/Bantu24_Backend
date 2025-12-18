import express from "express";
import { completeRegistration, getUserById, loginUser, registerUser, verifyOtp } from "../controllers/UserController.js";
import { validate } from "../middleware/validateMiddleware.js";
import { registerUserSchema } from "../validators/userValidator.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
const router = express.Router();

router.post("/registerUser", validate(registerUserSchema), registerUser);
router.post("/verifyOtp", verifyOtp);
router.post("/completeRegistration", completeRegistration);
router.post("/loginUser", loginUser);
router.get("/getUserById", authMiddleware, getUserById);

export default router;