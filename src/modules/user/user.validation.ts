import { z } from "zod";
import { Request, Response, NextFunction } from "express";

export const createUserSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const validateCreateUser = (req: Request, res: Response, next: NextFunction) => {
  const result = createUserSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ status: "error", message: result.error.format() });
  }
  next();
};

export const validateLogin = (req: Request, res: Response, next: NextFunction) => {
  const result = loginSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ status: "error", message: result.error.format() });
  }
  next();
};
