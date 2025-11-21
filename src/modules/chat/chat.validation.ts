import { NextFunction, Request, Response } from "express";
import { z } from "zod";

const createGroupSchema = z.object({
  name: z.string().trim().min(3, "Group name must be at least 3 characters"),
  description: z.string().trim().optional(),
  members: z.array(z.string().trim()).optional()
});

const groupMessageSchema = z.object({
  content: z.string().trim().min(1, "Message content is required")
});

export const validateCreateGroup = (req: Request, res: Response, next: NextFunction) => {
  const result = createGroupSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ status: "error", message: result.error.format() });
  }
  next();
};

export const validateGroupMessage = (req: Request, res: Response, next: NextFunction) => {
  const result = groupMessageSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ status: "error", message: result.error.format() });
  }
  next();
};

