import { Router } from "express";
import {
  enable2FA,
  confirmEnable2FA,
  disable2FA,
  verify2FALogin,
} from "./twoFA.controllers";
import { protect } from "../auth/auth.middleware";

const router = Router();

// Enable 2FA - Step 1: Send OTP
router.post("/enable", protect, enable2FA);

// Enable 2FA - Step 2: Confirm with OTP
router.post("/confirm-enable", protect, confirmEnable2FA);

// Disable 2FA
router.post("/disable", protect, disable2FA);

// Verify 2FA during login
router.post("/verify-login", verify2FALogin);

export default router;