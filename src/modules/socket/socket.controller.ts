import { Request, Response } from "express";
import { AuthenticatedRequest } from "../auth/auth.middleware";
import { successResponse, errorResponse } from "../../utils/response";
import * as socketService from "../../services/socket.service";

// ==================== GET ONLINE USERS ====================
export const getOnlineUsers = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const onlineUsers = socketService.getOnlineUsers();
    return successResponse(res, { users: onlineUsers, count: onlineUsers.length }, "Online users fetched");
  } catch (err) {
    return errorResponse(res, err);
  }
};

// ==================== CHECK USER STATUS ====================
export const checkUserStatus = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { userId } = req.params;
    const isOnline = socketService.isUserOnline(userId);
    return successResponse(res, { userId, isOnline }, "User status checked");
  } catch (err) {
    return errorResponse(res, err);
  }
};

// ==================== SEND NOTIFICATION ====================
export const sendNotification = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { userId, type, title, message, data } = req.body;
    
    if (!userId || !type || !title || !message) {
      return errorResponse(res, { status: 400, message: "Missing required fields" });
    }
    
    const sent = socketService.sendNotificationToUser(userId, {
      type,
      title,
      message,
      data
    });
    
    if (sent) {
      return successResponse(res, null, "Notification sent successfully");
    } else {
      return errorResponse(res, { status: 404, message: "User is not online" });
    }
  } catch (err) {
    return errorResponse(res, err);
  }
};

// ==================== BROADCAST NOTIFICATION ====================
export const broadcastNotification = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { type, title, message, data } = req.body;
    
    if (!type || !title || !message) {
      return errorResponse(res, { status: 400, message: "Missing required fields" });
    }
    
    socketService.broadcastNotification({
      type,
      title,
      message,
      data
    });
    
    return successResponse(res, null, "Notification broadcasted successfully");
  } catch (err) {
    return errorResponse(res, err);
  }
};

// ==================== SEND DIRECT MESSAGE ====================
export const sendDirectMessage = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { toUserId, message } = req.body;
    const fromUserId = req.user?._id ? (req.user._id as any).toString() : undefined;
    
    if (!toUserId || !message) {
      return errorResponse(res, { status: 400, message: "Missing required fields" });
    }
    
    if (!fromUserId) {
      return errorResponse(res, { status: 401, message: "Unauthorized" });
    }
    
    const sent = socketService.sendDirectMessage(fromUserId, toUserId, message);
    
    if (sent) {
      return successResponse(res, null, "Message sent successfully");
    } else {
      return errorResponse(res, { status: 404, message: "Recipient is not online" });
    }
  } catch (err) {
    return errorResponse(res, err);
  }
};

// ==================== REMOVE DISCONNECTED SOCKETS ====================
export const removeDisconnectedSockets = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const result = socketService.removeDisconnectedSockets();
    return successResponse(res, result, "Disconnected sockets removed");
  } catch (err) {
    return errorResponse(res, err);
  }
};