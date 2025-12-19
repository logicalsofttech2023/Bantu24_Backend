import { Policy, FAQ } from "../models/PolicyModel.js";
import Admin from "../models/AdminModel.js";
import User from "../models/UserModel.js";
import { ContactUs } from "../models/WebsiteUi.js";
import bcrypt from "bcrypt";
import { generateToken } from "../utils/commonFunctions.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import Category from "../models/CategoryModel.js";

export const adminSignup = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    throw new ApiError(400, "All fields are required");
  }

  const existingAdmin = await Admin.findOne({ email });
  if (existingAdmin) {
    throw new ApiError(400, "Admin already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const admin = await Admin.create({
    name,
    email,
    password: hashedPassword,
  });

  const token = generateToken(admin._id);

  return res
    .status(201)
    .json(new ApiResponse(201, "Admin registered successfully", { token }));
});

export const loginAdmin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, "Email and password are required");
  }

  const admin = await Admin.findOne({ email });
  if (!admin) {
    throw new ApiError(400, "Invalid email or password");
  }

  const isMatch = await bcrypt.compare(password, admin.password);
  if (!isMatch) {
    throw new ApiError(400, "Invalid email or password");
  }

  return res.status(200).json(
    new ApiResponse(200, "Admin logged in successfully", {
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
      },
      token: generateToken(admin._id),
    })
  );
});

export const getAdminDetail = asyncHandler(async (req, res) => {
  const admin = await Admin.findById(req.user.id).select(
    "-password -otp -otpExpiresAt"
  );

  if (!admin) {
    throw new ApiError(404, "Admin not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Admin fetched successfully", admin));
});

export const updateAdminDetail = asyncHandler(async (req, res) => {
  const { name, email } = req.body;

  if (!name || !email) {
    throw new ApiError(400, "Name and email are required");
  }

  const admin = await Admin.findByIdAndUpdate(
    req.user.id,
    { name, email },
    { new: true, select: "-password -otp -otpExpiresAt" }
  );

  if (!admin) {
    throw new ApiError(404, "Admin not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Admin updated successfully", admin));
});

export const resetAdminPassword = asyncHandler(async (req, res) => {
  const { newPassword, confirmPassword } = req.body;

  if (!newPassword || !confirmPassword) {
    throw new ApiError(400, "All fields are required");
  }

  if (newPassword !== confirmPassword) {
    throw new ApiError(400, "Passwords do not match");
  }

  const admin = await Admin.findById(req.user.id);
  if (!admin) {
    throw new ApiError(404, "Admin not found");
  }

  const isSame = await bcrypt.compare(newPassword, admin.password);
  if (isSame) {
    throw new ApiError(400, "New password cannot be same as old password");
  }

  admin.password = await bcrypt.hash(newPassword, 10);
  await admin.save();

  return res
    .status(200)
    .json(new ApiResponse(200, "Password reset successful"));
});

export const getAllUsers = asyncHandler(async (req, res) => {
  let { page = 1, limit = 10, search = "", status } = req.query;

  page = Number(page);
  limit = Number(limit);

  let filter = {};

  if (search) {
    filter.$or = [
      { fullName: { $regex: search, $options: "i" } },
      { userEmail: { $regex: search, $options: "i" } },
      { phone: { $regex: search, $options: "i" } },
    ];
  }

  if (status !== undefined) {
    filter.status = status === "true";
  }

  const users = await User.find(filter)
    .select("-password -otp -otpExpiresAt")
    .skip((page - 1) * limit)
    .limit(limit)
    .sort({ createdAt: -1 });

  const totalUsers = await User.countDocuments(filter);

  return res.status(200).json(
    new ApiResponse(200, "Users fetched successfully", {
      users,
      totalUsers,
      totalPages: Math.ceil(totalUsers / limit),
      currentPage: page,
    })
  );
});

export const policyUpdate = asyncHandler(async (req, res) => {
  const { type, content } = req.body;
  const image = req.files?.image?.[0]?.filename;

  if (!type || !content) {
    throw new ApiError(400, "Type and content are required");
  }

  let policy = await Policy.findOne({ type });

  if (policy) {
    policy.content = content;
    if (image) policy.image = image;
    await policy.save();
  } else {
    policy = await Policy.create({ type, content, image });
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Policy saved successfully", policy));
});

export const getPolicy = asyncHandler(async (req, res) => {
  const { type } = req.query;

  if (!type) {
    throw new ApiError(400, "Policy type is required");
  }

  const policy = await Policy.findOne({ type });
  if (!policy) {
    throw new ApiError(404, "Policy not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Policy fetched successfully", policy));
});

export const addFAQ = asyncHandler(async (req, res) => {
  const { question, answer } = req.body;

  if (!question || !answer) {
    throw new ApiError(400, "Question and answer are required");
  }

  const faq = await FAQ.create({ question, answer });

  return res
    .status(201)
    .json(new ApiResponse(201, "FAQ added successfully", faq));
});

export const updateFAQ = asyncHandler(async (req, res) => {
  const { id, question, answer, isActive } = req.body;

  const faq = await FAQ.findByIdAndUpdate(
    id,
    { question, answer, isActive },
    { new: true, runValidators: true }
  );

  if (!faq) {
    throw new ApiError(404, "FAQ not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "FAQ updated successfully", faq));
});

export const getAllFAQs = asyncHandler(async (req, res) => {
  const faqs = await FAQ.find().sort({ createdAt: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, "FAQs fetched successfully", faqs));
});

export const getFAQById = asyncHandler(async (req, res) => {
  const { id } = req.query;

  const faq = await FAQ.findById(id);
  if (!faq) {
    throw new ApiError(404, "FAQ not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "FAQ fetched successfully", faq));
});

export const addOrUpdateContactUs = asyncHandler(async (req, res) => {
  const { id, officeLocation, email, phone } = req.body;

  if (!officeLocation || !email || !phone) {
    throw new ApiError(400, "All fields are required");
  }

  let contact;

  if (id) {
    contact = await ContactUs.findByIdAndUpdate(
      id,
      { officeLocation, email, phone },
      { new: true }
    );
    if (!contact) throw new ApiError(404, "ContactUs not found");
  } else {
    const exists = await ContactUs.findOne();
    if (exists) {
      throw new ApiError(400, "Only one ContactUs entry allowed");
    }
    contact = await ContactUs.create({ officeLocation, email, phone });
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "ContactUs saved successfully", contact));
});

export const getContactUs = asyncHandler(async (req, res) => {
  const contact = await ContactUs.findOne();

  return res
    .status(200)
    .json(new ApiResponse(200, "ContactUs fetched successfully", contact));
});

export const addCategory = asyncHandler(async (req, res) => {
  const { categoryName } = req.body;
  if (!categoryName) {
    throw new ApiError(400, "Category name is required");
  }
  const existingCategory = await Category.findOne({ categoryName });
  if (existingCategory) {
    throw new ApiError(400, "Category already exists");
  }

  const categoryImage = req.files?.categoryImage?.[0]?.filename;

  if (!categoryImage) {
    throw new ApiError(400, "Category image is required");
  }

  const category = await Category.create({ categoryName, categoryImage });

  return res
    .status(201)
    .json(new ApiResponse(201, "Category added successfully", category));
});

export const getCategoryById = asyncHandler(async (req, res) => {
  const { categoryId } = req.query;
  const category = await Category.findById(categoryId);
  if (!category) {
    throw new ApiError(404, "Category not found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, "Category fetched successfully", category));
});

export const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find().sort({ createdAt: -1 });
  return res
    .status(200)
    .json(new ApiResponse(200, "Categories fetched successfully", categories));
});

export const deleteCategory = asyncHandler(async (req, res) => {
  const { categoryId } = req.query;
  const category = await Category.findByIdAndDelete(categoryId);
  if (!category) {
    throw new ApiError(404, "Category not found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, "Category deleted successfully", category));
});

export const updateCategory = asyncHandler(async (req, res) => {
  const { categoryName, categoryId } = req.body;
  const categoryImage = req.files?.image?.[0]?.filename;

  const updateData = {
    categoryName,
    ...(categoryImage && { categoryImage }),
  };
  

  const category = await Category.findByIdAndUpdate(
    categoryId,
    updateData,
    { new: true }
  );
  if (!category) {
    throw new ApiError(404, "Category not found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, "Category updated successfully", category));
});
