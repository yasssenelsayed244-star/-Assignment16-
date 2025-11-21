import { Router } from "express";
import { getUsers, blockUser, unblockUser, getBlockedUsers } from "./user.controller";
import { protect, restrictTo } from "../auth/auth.middleware";

const router = Router();

// Protected routes - only admins can view all users
router.get("/", protect, restrictTo("admin"), getUsers);

// Block user routes
router.post("/block", protect, blockUser);
router.post("/unblock", protect, unblockUser);
router.get("/blocked", protect, getBlockedUsers);

export default router;