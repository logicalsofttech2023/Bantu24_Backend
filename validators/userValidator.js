import { z } from "zod";

export const registerUserSchema = z.object({
  type: z.enum(["email", "phone"]),
  name: z.string().optional(),
  userEmail: z.string().email("Invalid email address").optional(),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters long")
    .optional(),
  phone: z.string().optional(),
  countryCode: z.string().optional(),
  location: z.string().optional(),
  language: z.string().optional(),
  loginType: z.string().optional(),
  profileImage: z.string().optional(),
});
