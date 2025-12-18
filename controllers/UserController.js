import User from "../models/UserModel.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { generateToken, genrateOtp } from "../utils/commonFunctions.js";
import bcrypt from "bcrypt";

export const registerUser = asyncHandler(async (req, res) => {
  const {
    name,
    userEmail,
    password,
    type,
    location,
    phone,
    countryCode,
    language,
    loginType,
  } = req.body;

  if (type === "email") {
    const existingUser = await User.findOne({ userEmail });
    if (existingUser) {
      return res.status(400).json(new ApiResponse(400, "User already exists"));
    }
    const file = req.file || req.files?.profileImage?.[0];
    const user = new User({
      name,
      location,
      userEmail,
      password,
      language,
      isRegistered: true,
      profileImage: file?.filename || null,

    });

    await user.save();
    const token = generateToken(user._id);
    return res
      .status(200)
      .json(
        new ApiResponse(200, "User registered successfully", { user, token })
      );
  } else if (type === "phone") {
    const otp = genrateOtp();

    if (loginType === "register") {
      const existingUser = await User.findOne({ phone, countryCode });
      if (existingUser) {
        throw new ApiError(400, "User already exists");
      }
      await User.create({
        phone,
        countryCode,
        otp: String(otp),
        otpVerified: false,
      });

      return res
        .status(200)
        .json(new ApiResponse(200, "Otp sent successfully", otp));
    } else if (loginType === "login") {
      const existingUser = await User.findOne({ phone, countryCode });
      existingUser.otp = String(otp);
      existingUser.save();
      if (existingUser) {
        return res
          .status(200)
          .json(new ApiResponse(200, "Otp sent successfully", otp));
      } else {
        throw new ApiError(404, "User not registered please register first");
      }
    }
  }
});

export const verifyOtp = asyncHandler(async (req, res) => {
  const { phone, countryCode, otp, name, location, type, language } = req.body;

  const user = await User.findOne({ phone, countryCode });
  const file = req.file || req.files?.profileImage?.[0];

  if (!user.otp || user.otp !== String(otp)) {
    throw new ApiError(400, "Invalid OTP");
  }

  user.otpVerified = true;
  user.otp = null;

  if (type === "register") {
    user.otpVerified = true;
    user.isRegistered = true;
    user.name = name;
    user.location = location;
    user.language = language;
    user.profileImage = file?.filename || null;
  }

  await user.save();

  const token = generateToken(user._id);

  return res
    .status(200)
    .json(new ApiResponse(200, "User verified successfully", { token }));
});

export const loginUser = asyncHandler(async (req, res) => {
  const { userEmail, password } = req.body;
  const user = await User.findOne({ userEmail });
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (!user.isRegistered) {
    throw new ApiError(400, "User not registered");
  }

  const isPasswordMatch = await bcrypt.compare(password, user.password);
  if (!isPasswordMatch) {
    throw new ApiError(401, "Invalid credentials");
  }

  const token = generateToken(user._id);
  return res
    .status(200)
    .json(new ApiResponse(200, "User logged in successfully", { user, token }));
});

export const getUserById = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const user = await User.findById(userId).select("-password");
  if (!user) {
    throw new ApiError(404, "User not found");
  }
  return res.status(200).json(new ApiResponse(200, "User found", user));
});
