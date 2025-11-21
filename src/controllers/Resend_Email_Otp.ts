import { Request, Response } from "express";
import UserModel from "../modules/user/user.model";
import { generateOTP, hashToken, generateOTPExpiry } from "../utils/otpHelpers";
import { sendEmail } from "../utils/send_email_function";
import { getEmailVerificationTemplate } from "../utils/emailTemplates/Confirm_Email_Part_1";
import { successResponse, errorResponse } from "../utils/response";

export const resendEmailOtp = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return errorResponse(res, { status: 400, message: "Email is required" });
    }

    const user = await UserModel.findOne({ email });

    if (!user) {
      return errorResponse(res, { status: 404, message: "User not found" });
    }

    if (user.isEmailVerified) {
      return errorResponse(res, {
        status: 400,
        message: "Email already verified",
      });
    }

    const otp = generateOTP();
    const hashedToken = hashToken(otp);

    user.emailVerificationToken = hashedToken;
    user.emailVerificationExpires = generateOTPExpiry(10);
    await user.save();

    const emailHtml = getEmailVerificationTemplate(otp, user.name);
    await sendEmail({
      to: user.email,
      subject: "Resend: Email Verification OTP",
      html: emailHtml,
    });

    return successResponse(res, null, "OTP resent successfully");
  } catch (err) {
    return errorResponse(res, err);
  }
};
