import { Request, Response } from "express";
import userRepository from "../user/user.repository";
import { generateOTP, hashToken, generateOTPExpiry } from "../../utils/emailTemplates/Confirm_Email_Part_1";
import { sendEmail } from "../../utils/send_email_function";
import { successResponse, errorResponse } from "../../utils/response";
import { AuthenticatedRequest } from "../auth/auth.middleware";

// ==================== ENABLE 2FA ====================
// Step 1: Enable 2FA (send OTP)
export const enable2FA = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?._id?.toString();
    
    if (!userId) {
      return errorResponse(res, { status: 401, message: "Unauthorized" });
    }
    
    const user = await userRepository.findById(userId);
    
    if (!user) {
      return errorResponse(res, { status: 404, message: "User not found" });
    }
    
    if (user.is2FAEnabled) {
      return errorResponse(res, { status: 400, message: "2FA is already enabled" });
    }
    
    // Generate OTP
    const otp = generateOTP();
    const hashedToken = hashToken(otp);
    
    // Save to user
    user.twoFAToken = hashedToken;
    user.twoFAExpires = generateOTPExpiry(10);
    await user.save();
    
    // Send email
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 50px auto; background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          .header { text-align: center; padding-bottom: 20px; border-bottom: 2px solid #2196F3; }
          .header h1 { color: #2196F3; margin: 0; }
          .content { padding: 30px 0; text-align: center; }
          .content p { color: #555; font-size: 16px; line-height: 1.6; }
          .otp-box { background-color: #e3f2fd; border: 2px dashed #2196F3; padding: 20px; margin: 20px 0; border-radius: 5px; }
          .otp-code { font-size: 32px; font-weight: bold; color: #2196F3; letter-spacing: 5px; }
          .footer { text-align: center; padding-top: 20px; border-top: 1px solid #ddd; color: #999; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Enable 2-Factor Authentication</h1>
          </div>
          <div class="content">
            <p>Hello <strong>${user.name}</strong>,</p>
            <p>You requested to enable 2-Factor Authentication. Use the OTP code below:</p>
            <div class="otp-box">
              <div class="otp-code">${otp}</div>
            </div>
            <p>This code will expire in <strong>10 minutes</strong>.</p>
            <p>If you didn't request this, please ignore this email.</p>
          </div>
          <div class="footer">
            <p>&copy; 2025 Your App. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
    
    await sendEmail({
      to: user.email,
      subject: "Enable 2-Factor Authentication",
      html: emailHtml
    });
    
    return successResponse(res, null, "OTP sent to your email to enable 2FA");
  } catch (err) {
    return errorResponse(res, err);
  }
};

// ==================== CONFIRM ENABLE 2FA ====================
// Step 2: Confirm 2FA with OTP
export const confirmEnable2FA = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?._id?.toString();
    const { otp } = req.body;
    
    if (!userId) {
      return errorResponse(res, { status: 401, message: "Unauthorized" });
    }
    
    if (!otp) {
      return errorResponse(res, { status: 400, message: "OTP is required" });
    }
    
    const user = await userRepository.findById(userId);
    
    if (!user) {
      return errorResponse(res, { status: 404, message: "User not found" });
    }
    
    if (user.is2FAEnabled) {
      return errorResponse(res, { status: 400, message: "2FA is already enabled" });
    }
    
    // Verify OTP
    const hashedOtp = hashToken(otp);
    
    if (user.twoFAToken !== hashedOtp) {
      return errorResponse(res, { status: 400, message: "Invalid OTP" });
    }
    
    if (user.twoFAExpires && user.twoFAExpires < new Date()) {
      return errorResponse(res, { status: 400, message: "OTP has expired" });
    }
    
    // Enable 2FA
    user.is2FAEnabled = true;
    user.twoFAToken = undefined;
    user.twoFAExpires = undefined;
    await user.save();
    
    return successResponse(res, { is2FAEnabled: true }, "2FA enabled successfully");
  } catch (err) {
    return errorResponse(res, err);
  }
};

// ==================== DISABLE 2FA ====================
export const disable2FA = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?._id?.toString();
    const { password } = req.body;
    
    if (!userId) {
      return errorResponse(res, { status: 401, message: "Unauthorized" });
    }
    
    if (!password) {
      return errorResponse(res, { status: 400, message: "Password is required" });
    }
    
    const user = await userRepository.findById(userId);
    
    if (!user) {
      return errorResponse(res, { status: 404, message: "User not found" });
    }
    
    if (!user.is2FAEnabled) {
      return errorResponse(res, { status: 400, message: "2FA is not enabled" });
    }
    
    // Verify password
    const bcrypt = require("bcrypt");
    const isMatch = await bcrypt.compare(password, user.password!);
    
    if (!isMatch) {
      return errorResponse(res, { status: 400, message: "Invalid password" });
    }
    
    // Disable 2FA
    user.is2FAEnabled = false;
    user.twoFAToken = undefined;
    user.twoFAExpires = undefined;
    await user.save();
    
    return successResponse(res, { is2FAEnabled: false }, "2FA disabled successfully");
  } catch (err) {
    return errorResponse(res, err);
  }
};

// ==================== VERIFY 2FA LOGIN ====================
export const verify2FALogin = async (req: Request, res: Response) => {
  try {
    const { email, otp } = req.body;
    
    if (!email || !otp) {
      return errorResponse(res, { status: 400, message: "Email and OTP are required" });
    }
    
    const user = await userRepository.findByEmail(email);
    
    if (!user) {
      return errorResponse(res, { status: 404, message: "User not found" });
    }
    
    if (!user.is2FAEnabled) {
      return errorResponse(res, { status: 400, message: "2FA is not enabled for this account" });
    }
    
    // Verify OTP
    const hashedOtp = hashToken(otp);
    
    if (user.twoFAToken !== hashedOtp) {
      return errorResponse(res, { status: 400, message: "Invalid OTP" });
    }
    
    if (user.twoFAExpires && user.twoFAExpires < new Date()) {
      return errorResponse(res, { status: 400, message: "OTP has expired" });
    }
    
    // Clear OTP
    user.twoFAToken = undefined;
    user.twoFAExpires = undefined;
    await user.save();
    
    // Generate JWT token
    const { generateToken } = require("../../utils/jwtHelpers");
    if (!user._id) {
      return errorResponse(res, { status: 500, message: "User ID is missing" });
    }

    const userId = user._id.toString();

    const token = generateToken({
      userId,
      email: user.email,
      role: user.role || "user"
    });
    
    const userData = {
      id: userId,
      name: user.name,
      email: user.email,
      role: user.role,
      isEmailVerified: user.isEmailVerified,
      is2FAEnabled: user.is2FAEnabled
    };
    
    return successResponse(res, { user: userData, token }, "Login successful");
  } catch (err) {
    return errorResponse(res, err);
  }
};