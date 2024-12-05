import { Router } from "express";
import {
  emailVerification,
  forgotPassword,
  login,
  resendEmailVerification,
  signup,
} from "../controllers/auth.controller";

const router = Router();

router.post("/signup", signup);
router.post("/email-verification", emailVerification);
router.post("/login", login);
router.post("/resend-email-verification", resendEmailVerification);
router.post("/forgot-password", forgotPassword);

export default router;
