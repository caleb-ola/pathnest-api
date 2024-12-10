import { Router } from "express";
import {
  emailVerification,
  forgotPassword,
  login,
  resendEmailVerification,
  sendTestEmail,
  signup,
  updatePassword,
} from "../controllers/auth.controller";
import protect from "../middlewares/protect.middleware";

const router = Router();

router.post("/signup", signup);
router.post("/email-verification", emailVerification);
router.post("/login", login);
router.post("/resend-email-verification", resendEmailVerification);
router.post("/forgot-password", forgotPassword);
router.post("/update-password", protect, updatePassword);
router.post("/test-email", sendTestEmail);

export default router;
