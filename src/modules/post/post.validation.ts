import { z } from "zod";
import { Request, Response, NextFunction } from "express";

export const createPostSchema = z.object({
  author: z.string().min(1).optional(),
  content: z.string().min(1),
  tags: z.array(z.string()).optional()
});

export const validateCreatePost = (req: Request, res: Response, next: NextFunction) => {
  const result = createPostSchema.safeParse(req.body);
  if (!result.success) {
      return res.status(400).json({ status: "error", message: result.error.format() });
  }
  next();
};
