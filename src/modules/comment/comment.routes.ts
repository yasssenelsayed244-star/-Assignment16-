import { Router } from "express";
import { createComment, fetchComments, fetchCommentById, fetchCommentWithReplies, updateCommentById, freezeCommentById, unfreezeCommentById, deleteCommentById } from "./comment.controller";
import { validateCreateComment } from "./comment.validation";
import { protect, restrictTo } from "../auth/auth.middleware";

const router = Router();

router.post("/", protect, validateCreateComment, createComment);
router.get("/post/:postId", protect, fetchComments);
router.get("/:commentId", protect, fetchCommentById);
router.get("/:commentId/replies", protect, fetchCommentWithReplies);
router.put("/:commentId", protect, updateCommentById);
router.patch("/:commentId/freeze", protect, restrictTo("admin"), freezeCommentById);
router.patch("/:commentId/unfreeze", protect, restrictTo("admin"), unfreezeCommentById);
router.delete("/:commentId", protect, deleteCommentById);

export default router;
