import { Router } from "express";
import { 
  signup, 
  login, 
  verifyEmail, 
  resendEmailOtp, 
  forgetPassword, 
  changePassword, 
  refreshToken,
  getProfile
} from "./auth.controllers";
import { 
  validateSignup,
  validateLogin,
  validateConfirmEmail, 
  validateResendOtp, 
  validateForgotPassword,
  validateChangePassword 
} from "./auth.validation";
import { protect } from "./auth.middleware";

const router = Router();

router.post("/signup", validateSignup, signup);
router.patch("/confirm-email", validateConfirmEmail, verifyEmail);
router.patch("/resend-otp", validateResendOtp, resendEmailOtp);
router.post("/login", validateLogin, login);
router.patch("/forget-password", validateForgotPassword, forgetPassword);
router.patch("/change-password", validateChangePassword, changePassword);
router.post("/refresh-token", refreshToken);
router.get("/me", protect, getProfile);

export default router;