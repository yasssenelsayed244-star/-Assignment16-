import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { generateToken } from "../utils/jwtHelpers";
import { successResponse, errorResponse } from "../utils/response";
import UserModel from "../modules/user/user.model";

interface JWTPayload {
  userId: string;
  email: string;
  role: string;
}

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

    const user = await UserModel.findById(decoded.userId);

    if (!user) {
      return errorResponse(res, { status: 404, message: "User not found" });
    }

    if (!user.isEmailVerified) {
      return errorResponse(res, { 
        status: 403, 
        message: "Please verify your email first" 
      });
    }

    const newToken = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role || "user"
    });

    return successResponse(res, { token: newToken }, "Token refreshed successfully");
  } catch (err) {
    return errorResponse(res, err);
  }
};