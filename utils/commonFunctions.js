import jwt from "jsonwebtoken";

export const genrateOtp = () => {
  return Math.floor(1000 + Math.random() * 9000);
};

export const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "720d" });
};
