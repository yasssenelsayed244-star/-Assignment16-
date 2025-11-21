import { Router } from "express";
import { addPost, fetchPosts, fetchPostById, updatePostById, freezePostById, unfreezePostById, deletePostById } from "./post.controller";
import { validateCreatePost } from "./post.validation";
import { protect, restrictTo } from "../auth/auth.middleware";

const router = Router();

router.post("/", protect, validateCreatePost, addPost);
router.get("/", protect, fetchPosts);
router.get("/:postId", protect, fetchPostById);
router.put("/:postId", protect, updatePostById);
router.patch("/:postId/freeze", protect, restrictTo("admin"), freezePostById);
router.patch("/:postId/unfreeze", protect, restrictTo("admin"), unfreezePostById);
router.delete("/:postId", protect, deletePostById);

export default router;
