import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { uploadProfile } from "../middleware/uploadMiddleware.js";
import {
  getAllCategories,
  getVendorById,
  loginVendor,
  registerVendor,
  vendorVerifyOtp,
} from "../controllers/VendorController.js";
const router = express.Router();

router.post(
  "/registerVendor",
  uploadProfile.fields([
    { name: "vendorProfileImage", maxCount: 1 },
    { name: "vendorReferenceLetter", maxCount: 1 },
    { name: "vendorIdentityDocument", maxCount: 1 },
  ]),
  registerVendor
);

router.post(
  "/vendorVerifyOtp",
  uploadProfile.fields([
    { name: "vendorProfileImage", maxCount: 1 },
    { name: "vendorReferenceLetter", maxCount: 1 },
    { name: "vendorIdentityDocument", maxCount: 1 },
  ]),
  vendorVerifyOtp
);
router.post("/loginVendor", loginVendor);
router.get("/getAllCategories", getAllCategories);
router.get("/getVendorById", authMiddleware, getVendorById);

export default router;
