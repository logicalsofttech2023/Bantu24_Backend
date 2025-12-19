import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import { errorMiddleware } from "./middleware/errorMiddleware.js";
dotenv.config();
import helmet from "helmet";
import UserRoutes from "./routes/UserRoutes.js";
import AdminRoutes from "./routes/adminRoutes.js";
import VendorRoutes from "./routes/VendorRoutes.js";

const PORT = process.env.PORT || 6008;

const app = express();
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
connectDB();

app.use("/api/v1/user", UserRoutes);
app.use("/api/v1/vendor", VendorRoutes);
app.use("/api/v1/admin", AdminRoutes);
app.use("/", (req, res) => res.send("Server is running"));
app.use(errorMiddleware);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
