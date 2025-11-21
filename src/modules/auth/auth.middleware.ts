import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import userRepository from "../user/user.repository";
import { errorResponse } from "../../utils/response";
import { IUserDoc } from "../user/user.model";

interface JWTPayload {
  userId: string;
  email: string;
  role: string;
}

// Extend Express Request to include user property
export interface AuthenticatedRequest extends Request {
  user?: IUserDoc;
}

// ==================== PROTECT MIDDLEWARE ====================
// التحقق من أن المستخدم مسجل دخول
export const protect = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    let token: string | undefined;

    // استخراج الـ token من الـ header
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return errorResponse(res, { status: 401, message: "Not authorized, no token" });
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      return errorResponse(res, { status: 500, message: "JWT secret not configured" });
    }

    // التحقق من صحة الـ token
    const decoded = jwt.verify(token, jwtSecret) as JWTPayload;

    // جلب المستخدم من قاعدة البيانات
    const user = await userRepository.findByIdWithoutPassword(decoded.userId);

    if (!user) {
      return errorResponse(res, { status: 401, message: "User not found" });
    }

    // التحقق من أن البريد الإلكتروني مفعل
    if (!user.isEmailVerified) {
      return errorResponse(res, { status: 403, message: "Please verify your email first" });
    }

    // حفظ بيانات المستخدم في الـ request
    req.user = user;
    next();
  } catch (err) {
    return errorResponse(res, { status: 401, message: "Not authorized, invalid token" });
  }
};

// ==================== RESTRICT TO MIDDLEWARE ====================
// التحقق من صلاحية المستخدم (admin, user, etc.)
export const restrictTo = (...roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role || "")) {
      return errorResponse(res, { 
        status: 403, 
        message: "You do not have permission to perform this action" 
      });
    }
    next();
  };
};