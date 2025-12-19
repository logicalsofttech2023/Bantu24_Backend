import mongoose from "mongoose";
import bcrypt from "bcrypt";

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },
    comment: {
      type: String,
    },
  },
  { timestamps: true }
);



const vendorSchema = new mongoose.Schema(
  {
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },
    vendorName: {
      type: String,
      trim: true,
    },
    vendorEmail: {
      type: String,
      lowercase: true,
    },
    vendorPassword: {
      type: String,
    },
    vendorPhone: {
      type: String,
    },
    vendorCountryCode: {
      type: String,
    },
    vendorOtp: {
      type: String,
    },
    vendorOtpVerified: {
      type: String,
    },
    vendorProfileImage: {
      type: String,
    },
    vendorIntroduction: {
      type: String,
      maxlength: 1000,
    },
    vendorBio: {
      type: String,
    },
    vendorWorkExperience: {
      type: String,
    },
    vendorCvUpload: {
      type: String,
    },
    vendorReferenceLetter: {
      type: String,
    },
    vendorIdentityDocument: {
      type: String,
    },
    latitude: {
      type: Number,
    },
    longitude: {
      type: Number,
    },
    dob: {
      type: String,
    },
    gender: {
      type: String,
    },
    languages: [String],

    isVerified: {
      type: Boolean,
      default: false,
    },
    averageRating: {
      type: Number,
      default: 0,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
    reviews: [reviewSchema],
    availabilityType: String,
    isActive: {
      type: Boolean,
      default: true,
    },
    isRegistered: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

vendorSchema.pre("save", async function () {
  if (!this.isModified("vendorPassword")) return;
  const salt = await bcrypt.genSalt(10);
  this.vendorPassword = await bcrypt.hash(this.vendorPassword, salt);
});

const Vendor = mongoose.model("Vendor", vendorSchema);
export default Vendor;
