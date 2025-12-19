import express from "express";
import {
  policyUpdate,
  getPolicy,
  loginAdmin,
  adminSignup,
  getAdminDetail,
  resetAdminPassword,
  updateAdminDetail,
  addFAQ,
  updateFAQ,
  getAllFAQs,
  getFAQById,
  addOrUpdateContactUs,
  getContactUs,
  getAllUsers,
  addCategory,
  getCategories,
} from "../controllers/AdminController.js";

import { authMiddleware } from "../middleware/authMiddleware.js";
import { uploadProfile } from "../middleware/uploadMiddleware.js";

const router = express.Router();

/* ---------------------------------------------
 🔐 Admin Authentication
----------------------------------------------*/
router.post("/adminSignup", adminSignup);
router.post("/loginAdmin", loginAdmin);
router.get("/getAdminDetail", authMiddleware, getAdminDetail);
router.post("/resetAdminPassword", authMiddleware, resetAdminPassword);
router.post("/updateAdminDetail", authMiddleware, updateAdminDetail);

/* ---------------------------------------------
 📄 Privacy & Terms Policy
----------------------------------------------*/
router.post(
  "/policyUpdate",
  uploadProfile.fields([{ name: "image", maxCount: 1 }]),
  policyUpdate
);
router.get("/getPolicy", authMiddleware, getPolicy);

/* ---------------------------------------------
 ❓ FAQ Management
----------------------------------------------*/
router.post("/addFAQ", addFAQ);
router.post("/updateFAQ", authMiddleware, updateFAQ);
router.get("/getAllFAQs", authMiddleware, getAllFAQs);
router.get("/getFAQById", authMiddleware, getFAQById);

/* ---------------------------------------------
 👤 User Management
----------------------------------------------*/
router.get("/getAllUsers", authMiddleware, getAllUsers);

/* ---------------------------------------------
 📜 Agreement Content Management
----------------------------------------------*/

router.post("/addOrUpdateContactUs", authMiddleware, addOrUpdateContactUs);
router.get("/getContactUs", authMiddleware, getContactUs);


router.post("/addCategory", uploadProfile.fields([{ name: "categoryImage", maxCount: 1 }]), addCategory);

router.get("/getCategories", getCategories);

export default router;
