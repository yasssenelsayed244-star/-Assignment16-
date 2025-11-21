import { Request, Response } from "express";
import UserModel from "../modules/user/user.model";
import { successResponse, errorResponse } from "../utils/response";
import { hashToken } from "../utils/emailTemplates/Confirm_Email_Part_1";
import bcrypt from "bcrypt";



export const changePassword = async (req: Request, res: Response) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return errorResponse(res, { 
        status: 400, 
        message: "Email, OTP, and new password are required" 
      });
    }

    if (newPassword.length < 6) {
      return errorResponse(res, { 
        status: 400, 
        message: "Password must be at least 6 characters" 
      });
    }

    const hashedOtp = hashToken(otp);
    const user = await UserModel.findOne({ 
      email,
      emailVerificationToken: hashedOtp,
      emailVerificationExpires: { $gt: Date.now() }
    });

    if (!user) {
      return errorResponse(res, { status: 400, message: "Invalid or expired OTP" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    return successResponse(res, null, "Password changed successfully");
  } catch (err) {
    return errorResponse(res, err);
  }
};