import { ZodError } from "zod";
import ApiError from "../utils/ApiError.js";

export const validate = (schema) => (req, res, next) => {
  try {
    req.body = schema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof ZodError) {
      return next(
        new ApiError(
          400,
          "Validation error",
          error.issues.map((issue) => ({
            field: issue.path.join("."),
            message: issue.message,
          }))
        )
      );
    }
    return next(error);
  }
};
