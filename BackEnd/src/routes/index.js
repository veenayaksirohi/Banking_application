import { Router } from "express";
import authRoutes from "./authRoutes.js";
import userRoutes from "./userRoutes.js";
import accountRouter from "./accountRoutes.js";
import transactionRoutes from "./transactionRoutes.js";
const router = Router();

router.use("/auth/", authRoutes);

router.use("/users", userRoutes);

router.use("/accounts", accountRouter);
router.use("/accounts", transactionRoutes);

export default router;
