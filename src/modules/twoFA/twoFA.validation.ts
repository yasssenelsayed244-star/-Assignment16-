import { z, ZodError } from "zod";
import { Request, Response, NextFunction } from "express";

// Schemas
export const confirmEnable2FASchema = z.object({
  otp: z.string().min(6).max(6)
});

export const disable2FASchema = z.object({
  password: z.string().min(6)
});

export const verify2FALoginSchema = z.object({
  email: z.string().email(),
  otp: z.string().min(6).max(6)
});

const formatZodErrors = (error: ZodError) => {
  return error.issues.map((issue) => ({
    path: issue.path.join("."),
    message: issue.message
  }));
};

// Validators
export const validateConfirmEnable2FA = (req: Request, res: Response, next: NextFunction) => {
  try {
    confirmEnable2FASchema.parse(req.body);
    next();
  } catch (err) {
    if (err instanceof ZodError) {
      return res.status(400).json({ status: "error", errors: formatZodErrors(err) });
    }
    next(err);
  }
};

export const validateDisable2FA = (req: Request, res: Response, next: NextFunction) => {
  try {
    disable2FASchema.parse(req.body);
    next();
  } catch (err) {
    if (err instanceof ZodError) {
      return res.status(400).json({ status: "error", errors: formatZodErrors(err) });
    }
    next(err);
  }
};

export const validateVerify2FALogin = (req: Request, res: Response, next: NextFunction) => {
  try {
    verify2FALoginSchema.parse(req.body);
    next();
  } catch (err) {
    if (err instanceof ZodError) {
      return res.status(400).json({ status: "error", errors: formatZodErrors(err) });
    }
    next(err);
  }
};