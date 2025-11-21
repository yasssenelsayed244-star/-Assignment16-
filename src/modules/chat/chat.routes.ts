import { Router } from "express";
import {
  sendMessage,
  getChat,
  getConversations,
  getUnreadCount,
  getChatRecap,
  sendFriendRequest,
  getFriendRequests,
  acceptFriendRequest,
  rejectFriendRequest,
  getFriends,
  deleteFriendRequest,
  unfriend,
  createChatGroup,
  listUserGroups,
  getGroupChat,
  joinGroup,
  sendGroupMessage
} from "./chat.controllers";
import { protect } from "../auth/auth.middleware";
import { validateCreateGroup, validateGroupMessage } from "./chat.validation";

const router = Router();

// ==================== MESSAGES ====================
router.post("/send", protect, sendMessage);
router.get("/chat/:otherUserId", protect, getChat);
router.get("/conversations", protect, getConversations);
router.get("/unread-count", protect, getUnreadCount);
router.get("/recap", protect, getChatRecap);

// ==================== GROUP CHAT ====================
router.post("/groups", protect, validateCreateGroup, createChatGroup);
router.get("/groups", protect, listUserGroups);
router.get("/groups/:groupId/messages", protect, getGroupChat);
router.post("/groups/:groupId/join", protect, joinGroup);
router.post("/groups/:groupId/messages", protect, validateGroupMessage, sendGroupMessage);

// ==================== FRIEND REQUESTS ====================
router.post("/friend-request", protect, sendFriendRequest);
router.get("/friend-requests", protect, getFriendRequests);
router.patch("/friend-request/:requestId/accept", protect, acceptFriendRequest);
router.patch("/friend-request/:requestId/reject", protect, rejectFriendRequest);
router.delete("/friend-request/:requestId", protect, deleteFriendRequest);
router.get("/friends", protect, getFriends);
router.post("/unfriend", protect, unfriend);

export default router;