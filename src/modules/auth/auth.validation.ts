import { z, ZodError } from "zod";
import { Request, Response, NextFunction } from "express";

// ==================== SCHEMAS ====================
export const signupSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6)
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

export const confirmEmailSchema = z.object({
  email: z.string().email(),
  otp: z.string().min(6).max(6)
});

export const resendOtpSchema = z.object({
  email: z.string().email()
});

export const forgotPasswordSchema = z.object({
  email: z.string().email()
});

export const changePasswordSchema = z.object({
  email: z.string().email(),
  otp: z.string().min(6).max(6),
  newPassword: z.string().min(6)
});

// ==================== VALIDATORS ====================
export const validateSignup = (req: Request, res: Response, next: NextFunction) => {
  try {
    signupSchema.parse(req.body);
    next();
  } catch (err) {
    const e = err as ZodError;
    return res.status(400).json({ status: "error", message: e.issues });
  }
};

export const validateLogin = (req: Request, res: Response, next: NextFunction) => {
  try {
    loginSchema.parse(req.body);
    next();
  } catch (err) {
    const e = err as ZodError;
    return res.status(400).json({ status: "error", message: e.issues });
  }
};

export const validateConfirmEmail = (req: Request, res: Response, next: NextFunction) => {
  try {
    confirmEmailSchema.parse(req.body);
    next();
  } catch (err) {
    const e = err as ZodError;
    return res.status(400).json({ status: "error", message: e.issues });
  }
};

export const validateResendOtp = (req: Request, res: Response, next: NextFunction) => {
  try {
    resendOtpSchema.parse(req.body);
    next();
  } catch (err) {
    const e = err as ZodError;
    return res.status(400).json({ status: "error", message: e.issues });
  }
};

export const validateForgotPassword = (req: Request, res: Response, next: NextFunction) => {
  try {
    forgotPasswordSchema.parse(req.body);
    next();
  } catch (err) {
    const e = err as ZodError;
    return res.status(400).json({ status: "error", message: e.issues });
  }
};

export const validateChangePassword = (req: Request, res: Response, next: NextFunction) => {
  try {
    changePasswordSchema.parse(req.body);
    next();
  } catch (err) {
    const e = err as ZodError;
    return res.status(400).json({ status: "error", message: e.issues });
  }
};