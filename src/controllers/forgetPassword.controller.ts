import { Request, Response } from "express";
import UserModel from "../modules/user/user.model";
import { generateOTP, hashToken, generateOTPExpiry } from "../utils/emailTemplates/Confirm_Email_Part_1";
import { sendEmail } from "../utils/send_email_function";
import { successResponse, errorResponse } from "../utils/response";

export const forgetPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return errorResponse(res, { status: 400, message: "Email is required" });
    }

    const user = await UserModel.findOne({ email });

    if (!user) {
      return errorResponse(res, { status: 404, message: "User not found" });
    }

    const otp = generateOTP();
    const hashedToken = hashToken(otp);

    user.emailVerificationToken = hashedToken;
    user.emailVerificationExpires = generateOTPExpiry(10);
    await user.save();

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 50px auto; background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          .header { text-align: center; padding-bottom: 20px; border-bottom: 2px solid #FF5722; }
          .header h1 { color: #FF5722; margin: 0; }
          .content { padding: 30px 0; text-align: center; }
          .content p { color: #555; font-size: 16px; line-height: 1.6; }
          .otp-box { background-color: #fff3e0; border: 2px dashed #FF5722; padding: 20px; margin: 20px 0; border-radius: 5px; }
          .otp-code { font-size: 32px; font-weight: bold; color: #FF5722; letter-spacing: 5px; }
          .footer { text-align: center; padding-top: 20px; border-top: 1px solid #ddd; color: #999; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Password Reset Request</h1>
          </div>
          <div class="content">
            <p>Hello <strong>${user.name}</strong>,</p>
            <p>We received a request to reset your password. Use the OTP code below:</p>
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
      subject: "Password Reset OTP",
      html: emailHtml
    });

    return successResponse(res, null, "Password reset OTP sent to your email");
  } catch (err) {
    return errorResponse(res, err);
  }
};