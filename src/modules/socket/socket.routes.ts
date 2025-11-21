import { Router } from "express";
import { 
  getOnlineUsers, 
  checkUserStatus, 
  sendNotification, 
  broadcastNotification,
  sendDirectMessage,
  removeDisconnectedSockets
} from "./socket.controller";
import { protect, restrictTo } from "../auth/auth.middleware";

const router = Router();

// الحصول على المستخدمين المتصلين
router.get("/online-users", protect, getOnlineUsers);

// التحقق من حالة مستخدم معين
router.get("/user-status/:userId", protect, checkUserStatus);

// إرسال notification لمستخدم واحد
router.post("/send-notification", protect, sendNotification);

// Broadcast notification لجميع المستخدمين (admin only)
router.post("/broadcast-notification", protect, restrictTo("admin"), broadcastNotification);

// إزالة الاتصالات غير الصالحة (admin only)
router.delete("/cleanup-sockets", protect, restrictTo("admin"), removeDisconnectedSockets);

// إرسال رسالة مباشرة
router.post("/send-message", protect, sendDirectMessage);

export default router;