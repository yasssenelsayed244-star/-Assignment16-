import { z } from "zod";
import { Request, Response, NextFunction } from "express";
export const createCommentSchema = z.object({
  postId: z.string().min(1),
  author: z.string().min(1).optional(),
  content: z.string().min(1),
  parentComment: z.string().optional(),
  tags: z.array(z.string()).optional()
});

export const validateCreateComment = (req: Request, res: Response, next: NextFunction) => {
  const result = createCommentSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ status: "error", message: result.error.format() });
  }
  next();
};
