import { Request, Response } from "express";
import userRepository from "../user/user.repository";
import chatGroupRepository from "../chat/chatGroup.repository";
import { generateOTP, hashToken, generateOTPExpiry, getEmailVerificationTemplate } from "../../utils/emailTemplates/Confirm_Email_Part_1";
import { getEmailVerifiedSuccessTemplate } from "../../utils/emailTemplates/Confirm_Email_Part_2";
import { sendEmail } from "../../utils/send_email_function";
import { generateToken } from "../../utils/jwtHelpers";
import { successResponse, errorResponse, createdResponse } from "../../utils/response";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { CreateUserDTO } from "../user/user.dto";
import { AuthenticatedRequest } from "./auth.middleware";

interface JWTPayload {
  userId: string;
  email: string;
  role: string;
}

const getUserId = (entity: { _id?: unknown }) => {
  if (!entity._id) {
    throw new Error("User ID is missing");
  }

  return typeof entity._id === "string"
    ? entity._id
    : (entity._id as { toString: () => string }).toString();
};

// ==================== GET PROFILE ====================
export const getProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user || !req.user._id) {
      return errorResponse(res, { status: 401, message: "Unauthorized" });
    }

    const userId = getUserId(req.user);
    const user = await userRepository.getProfile(userId);

    if (!user) {
      return errorResponse(res, { status: 404, message: "User not found" });
    }

    const groups = await chatGroupRepository.findByMember(userId);

    return successResponse(res, { user, groups }, "Profile fetched");
  } catch (err) {
    return errorResponse(res, err);
  }
};

// ==================== SIGNUP ====================
export const signup = async (req: Request, res: Response) => {
  try {
    const dto: CreateUserDTO = req.body;
    const hashed = await bcrypt.hash(dto.password, 10);
    
    const otp = generateOTP();
    const hashedToken = hashToken(otp);
    
    const user = await userRepository.create({ 
      ...dto, 
      password: hashed,
      emailVerificationToken: hashedToken,
      emailVerificationExpires: generateOTPExpiry(10)
    } as any);

    const emailHtml = getEmailVerificationTemplate(otp, user.name);
    await sendEmail({
      to: user.email,
      subject: "Verify Your Email",
      html: emailHtml
    });

    const userId = getUserId(user);

    const userData = { 
      id: userId, 
      name: user.name, 
      email: user.email, 
      role: user.role,
      isEmailVerified: user.isEmailVerified 
    };

    return createdResponse(res, userData, "User created. Please check your email to verify your account.");
  } catch (err) {
    return errorResponse(res, err);
  }
};

// ==================== VERIFY EMAIL ====================
export const verifyEmail = async (req: Request, res: Response) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return errorResponse(res, { status: 400, message: "Email and OTP are required" });
    }

    const hashedToken = hashToken(otp);
    const user = await userRepository.findByEmailAndToken(email, hashedToken);

    if (!user) {
      return errorResponse(res, { status: 400, message: "Invalid or expired OTP" });
    }

    await userRepository.verifyEmail(getUserId(user));

    const emailHtml = getEmailVerifiedSuccessTemplate(user.name);
    await sendEmail({
      to: user.email,
      subject: "Email Verified Successfully",
      html: emailHtml
    });

    return successResponse(res, null, "Email verified successfully");
  } catch (err) {
    return errorResponse(res, err);
  }
};

// ==================== RESEND OTP ====================
export const resendEmailOtp = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return errorResponse(res, { status: 400, message: "Email is required" });
    }

    const user = await userRepository.findByEmail(email);

    if (!user) {
      return errorResponse(res, { status: 404, message: "User not found" });
    }

    if (user.isEmailVerified) {
      return errorResponse(res, { status: 400, message: "Email already verified" });
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
      html: emailHtml
    });

    return successResponse(res, null, "OTP resent successfully");
  } catch (err) {
    return errorResponse(res, err);
  }
};

// ==================== LOGIN (WITH 2FA SUPPORT) ====================
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    
    const user = await userRepository.findByEmail(email);
    
    if (!user) {
      return errorResponse(res, { status: 400, message: "Invalid credentials" });
    }

    // Check email verification
    if (!user.isEmailVerified) {
      return errorResponse(res, { 
        status: 403, 
        message: "Please verify your email before logging in" 
      });
    }

    // Verify password
    const match = await bcrypt.compare(password, user.password!);
    if (!match) {
      return errorResponse(res, { status: 400, message: "Invalid credentials" });
    }
    
    //  CHECK IF 2FA IS ENABLED
    if (user.is2FAEnabled) {
      // Generate OTP for 2FA
      const otp = generateOTP();
      const hashedToken = hashToken(otp);
      
      // Save OTP
      user.twoFAToken = hashedToken;
      user.twoFAExpires = generateOTPExpiry(10);
      await user.save();
      
      // Send OTP email
      const emailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 50px auto; background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .header { text-align: center; padding-bottom: 20px; border-bottom: 2px solid #FF9800; }
            .header h1 { color: #FF9800; margin: 0; }
            .content { padding: 30px 0; text-align: center; }
            .content p { color: #555; font-size: 16px; line-height: 1.6; }
            .otp-box { background-color: #fff3e0; border: 2px dashed #FF9800; padding: 20px; margin: 20px 0; border-radius: 5px; }
            .otp-code { font-size: 32px; font-weight: bold; color: #FF9800; letter-spacing: 5px; }
            .footer { text-align: center; padding-top: 20px; border-top: 1px solid #ddd; color: #999; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Login Verification Code</h1>
            </div>
            <div class="content">
              <p>Hello <strong>${user.name}</strong>,</p>
              <p>Someone is trying to login to your account. Enter this verification code:</p>
              <div class="otp-box">
                <div class="otp-code">${otp}</div>
              </div>
              <p>This code will expire in <strong>10 minutes</strong>.</p>
              <p>If this wasn't you, please change your password immediately.</p>
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
        subject: "Login Verification Code",
        html: emailHtml
      });
      
      return successResponse(res, { 
        require2FA: true,
        email: user.email,
        message: "Please check your email for the verification code"
      }, "2FA verification code sent to your email");
    }
    
    //  IF 2FA IS DISABLED, LOGIN NORMALLY
    const userId = getUserId(user);

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

    return successResponse(res, { user: userData, token }, "Logged in successfully");
  } catch (err) {
    return errorResponse(res, err);
  }
};

// ==================== FORGET PASSWORD ====================
export const forgetPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return errorResponse(res, { status: 400, message: "Email is required" });
    }

    const user = await userRepository.findByEmail(email);

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

// ==================== CHANGE PASSWORD ====================
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
    const user = await userRepository.findByEmailAndToken(email, hashedOtp);

    if (!user) {
      return errorResponse(res, { status: 400, message: "Invalid or expired OTP" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await userRepository.updatePassword(getUserId(user), hashedPassword);

    return successResponse(res, null, "Password changed successfully");
  } catch (err) {
    return errorResponse(res, err);
  }
};

// ==================== REFRESH TOKEN ====================
export const refreshToken = async (req: Request, res: Response) => {
  try {
    const { token } = req.body;

    if (!token) {
      return errorResponse(res, { status: 400, message: "Token is required" });
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      return errorResponse(res, { status: 500, message: "JWT secret not configured" });
    }

    let decoded: JWTPayload;
    try {
      decoded = jwt.verify(token, jwtSecret) as JWTPayload;
    } catch (err) {
      return errorResponse(res, { status: 401, message: "Invalid or expired token" });
    }

    const user = await userRepository.findById(decoded.userId);

    if (!user) {
      return errorResponse(res, { status: 404, message: "User not found" });
    }

    if (!user.isEmailVerified) {
      return errorResponse(res, { 
        status: 403, 
        message: "Please verify your email first" 
      });
    }

    const userId = getUserId(user);

    const newToken = generateToken({
      userId,
      email: user.email,
      role: user.role || "user"
    });

    return successResponse(res, { token: newToken }, "Token refreshed successfully");
  } catch (err) {
    return errorResponse(res, err);
  }
};