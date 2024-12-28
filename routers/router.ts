import { Router } from "express";

import authRouter from "./auth.router";
import userRouter from "./user.router";
import childRouter from "./child.router";

const router = Router();

router.use("/auth", authRouter);
router.use("/users", userRouter);
router.use("/children", childRouter);

export default router;
