import User from "../models/UserModel.js";
import Vendor from "../models/VendorModel.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { generateToken, genrateOtp } from "../utils/commonFunctions.js";
import bcrypt from "bcrypt";
import Category from "../models/CategoryModel.js";

export const registerVendor = asyncHandler(async (req, res) => {
  const {
    type,
    loginType,
    vendorName,
    vendorEmail,
    vendorPassword,
    vendorPhone,
    vendorCountryCode,
    vendorIntroduction,
    vendorBio,
    vendorWorkExperience,
    latitude,
    longitude,
    dob,
    gender,
    categoryId,
    languages,
    availabilityType,
  } = req.body;

  const vendorProfileImage =
    req.file || req.files?.vendorProfileImage?.[0].filename;
  const vendorReferenceLetter =
    req.file || req.files?.vendorReferenceLetter?.[0].filename;

  const vendorIdentityDocument =
    req.file || req.files?.vendorIdentityDocument?.[0].filename;

  if (type === "email") {
    const existingVendor = await Vendor.findOne({ vendorEmail });
    if (existingVendor) {
      throw new ApiError(400, "Vendor already exists");
    }

    const vendor = await Vendor.create({
      vendorName,
      vendorEmail,
      vendorPassword,
      vendorProfileImage: vendorProfileImage || null,
      vendorIdentityDocument: vendorIdentityDocument || null,
      vendorReferenceLetter: vendorReferenceLetter || null,
      vendorIntroduction,
      vendorBio,
      vendorWorkExperience,
      vendorOtpVerified: true,
      latitude,
      longitude,
      dob,
      gender,
      categoryId,
      languages,
      availabilityType,
      isRegistered: true,
    });

    const token = generateToken(vendor._id);

    return res.status(201).json(
      new ApiResponse(201, "Vendor registered successfully", {
        vendor,
        token,
      })
    );
  }

  if (type === "phone") {
    const otp = genrateOtp();

    let vendor = await Vendor.findOne({
      vendorPhone,
      vendorCountryCode,
    });

    if (loginType === "register") {
      if (vendor) {
        throw new ApiError(400, "Vendor already exists");
      }

      await Vendor.create({
        vendorPhone,
        vendorCountryCode,
        vendorOtp: String(otp),
        vendorOtpVerified: false,
      });
    }

    if (loginType === "login") {
      if (!vendor) {
        throw new ApiError(404, "Vendor not registered");
      }

      vendor.vendorOtp = String(otp);
      await vendor.save();
    }

    return res
      .status(200)
      .json(new ApiResponse(200, "OTP sent successfully", otp));
  }
});

export const vendorVerifyOtp = asyncHandler(async (req, res) => {
  const {
    vendorPhone,
    vendorCountryCode,
    vendorOtp,
    loginType,
    vendorName,
    vendorIntroduction,
    vendorBio,
    vendorWorkExperience,
    latitude,
    longitude,
    dob,
    gender,
    categoryId,
    languages,
    availabilityType,
  } = req.body;

  const vendorProfileImage =
    req.file || req.files?.vendorProfileImage?.[0].filename;
  const vendorReferenceLetter =
    req.file || req.files?.vendorReferenceLetter?.[0].filename;

  const vendorIdentityDocument =
    req.file || req.files?.vendorIdentityDocument?.[0].filename;

  const vendor = await Vendor.findOne({
    vendorPhone,
    vendorCountryCode,
  });

  if (!vendor) {
    throw new ApiError(404, "Vendor not found");
  }

  if (!vendor.vendorOtp || vendor.vendorOtp !== String(vendorOtp)) {
    throw new ApiError(400, "Invalid OTP");
  }

  vendor.vendorOtpVerified = true;
  vendor.vendorOtp = null;

  if (loginType === "register") {
    vendor.vendorName = vendorName;
    vendor.vendorIntroduction = vendorIntroduction;
    vendor.vendorBio = vendorBio;
    vendor.vendorWorkExperience = vendorWorkExperience;
    vendor.vendorProfileImage = vendorProfileImage || null;
    vendor.vendorReferenceLetter = vendorReferenceLetter || null;
    vendor.vendorIdentityDocument = vendorIdentityDocument || null;
    vendor.latitude = latitude;
    vendor.longitude = longitude;
    vendor.dob = dob;
    vendor.gender = gender;
    vendor.categoryId = categoryId;
    vendor.languages = languages;
    vendor.availabilityType = availabilityType;
    vendor.isRegistered = true;
  }

  await vendor.save();

  const token = generateToken(vendor._id);

  return res
    .status(200)
    .json(new ApiResponse(200, "Vendor verified successfully", { token }));
});

export const loginVendor = asyncHandler(async (req, res) => {
  const { vendorEmail, vendorPassword } = req.body;
  const vendor = await Vendor.findOne({ vendorEmail });
  if (!vendor) {
    throw new ApiError(404, "Invalid email");
  }

  const isPasswordMatch = await bcrypt.compare(
    vendorPassword,
    vendor.vendorPassword
  );
  if (!isPasswordMatch) {
    throw new ApiError(401, "Invalid password");
  }

  const token = generateToken(vendor._id);
  return res
    .status(200)
    .json(
      new ApiResponse(200, "vendor logged in successfully", { vendor, token })
    );
});

export const getVendorById = asyncHandler(async (req, res) => {
  const vendorId = req.user.id;
  const user = await Vendor.findById(vendorId).select("-password");
  if (!user) {
    throw new ApiError(404, "Vendor not found");
  }
  return res.status(200).json(new ApiResponse(200, "Vendor found", user));
});

export const getAllCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find();
  if (!categories) {
    throw new ApiError(404, "Categories not found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, "Categories found", categories));
});
