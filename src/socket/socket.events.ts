import { Server as SocketIOServer, Socket } from "socket.io";
import { createEventRateLimiter, cleanupRateLimitData } from "../utils/socket.rateLimit";
import messageRepository from "../modules/message/message.repository";

// Map للاحتفاظ بالمستخدمين المتصلين
const onlineUsers = new Map<string, string>(); // userId -> socketId
const userSockets = new Map<string, Socket>(); // userId -> Socket instance

// ==================== CONNECTION HANDLER ====================
export const handleConnection = (io: SocketIOServer) => {
  io.on("connection", (socket: Socket) => {
    console.log(` Client connected: ${socket.id}`);
    
    const user = socket.data.user;
    
    if (user) {
      // حفظ المستخدم
      onlineUsers.set(user.userId, socket.id);
      userSockets.set(user.userId, socket);
      
      socket.join(`user:${user.userId}`);
      
      socket.emit("connected", {
        socketId: socket.id,
        message: "Successfully connected",
        timestamp: new Date()
      });
      
      io.emit("onlineUsers", Array.from(onlineUsers.keys()));
      
      console.log(`User ${user.email} is now online`);
    }

    // ==================== CHAT EVENTS ====================
    
    // Send private message
    const messageRateLimiter = createEventRateLimiter("sendPrivateMessage", 20, 60000);
    socket.use((packet, next) => {
      if (packet[0] === "sendPrivateMessage") {
        return messageRateLimiter(socket, packet[1], next);
      }
      next();
    });
    
    socket.on("sendPrivateMessage", async (data, callback) => {
      try {
        const { receiverId, content } = data;
        
        if (!content || !receiverId) {
          throw new Error("Content and receiver are required");
        }
        
        // Save message to database
        const message = await messageRepository.create({
          sender: user.userId,
          receiver: receiverId,
          content,
          isRead: false
        } as any);
        
        // Send to receiver if online
        const recipientSocket = userSockets.get(receiverId);
        if (recipientSocket) {
          recipientSocket.emit("receivePrivateMessage", {
            messageId: message._id,
            from: user.userId,
            content: content,
            timestamp: new Date()
          });
        }
        
        if (callback) {
          callback({
            success: true,
            messageId: message._id,
            timestamp: new Date()
          });
        }
      } catch (error: any) {
        if (callback) {
          callback({
            success: false,
            message: error.message
          });
        }
      }
    });
    
    // Mark messages as read
    socket.on("markAsRead", async (data) => {
      try {
        const { senderId } = data;
        await messageRepository.markAsRead(senderId, user.userId);
        
        // Notify sender
        const senderSocket = userSockets.get(senderId);
        if (senderSocket) {
          senderSocket.emit("messagesRead", {
            readBy: user.userId
          });
        }
      } catch (error) {
        console.error("Error marking messages as read:", error);
      }
    });

    // ==================== TYPING INDICATOR ====================
    const typingRateLimiter = createEventRateLimiter("typing", 30, 60000);
    socket.use((packet, next) => {
      if (packet[0] === "typing") {
        return typingRateLimiter(socket, packet[1], next);
      }
      next();
    });
    
    socket.on("typing", (data) => {
      const recipientSocket = userSockets.get(data.to);
      if (recipientSocket) {
        recipientSocket.emit("userTyping", {
          from: user.userId,
          isTyping: data.isTyping
        });
      }
    });

    // ==================== FRIEND REQUEST EVENTS ====================
    socket.on("friendRequestSent", (data) => {
      const recipientSocket = userSockets.get(data.receiverId);
      if (recipientSocket) {
        recipientSocket.emit("newFriendRequest", {
          from: user.userId,
          requestId: data.requestId
        });
      }
    });

    // ==================== ROOM EVENTS ====================
    socket.on("joinRoom", (roomId, callback) => {
      socket.join(roomId);
      console.log(`User ${user.userId} joined room: ${roomId}`);
      
      socket.to(roomId).emit("userJoinedRoom", {
        userId: user.userId,
        roomId: roomId,
        timestamp: new Date()
      });
      
      if (callback) {
        callback({
          success: true,
          message: `Joined room ${roomId}`
        });
      }
    });

    socket.on("leaveRoom", (roomId, callback) => {
      socket.leave(roomId);
      console.log(`User ${user.userId} left room: ${roomId}`);
      
      socket.to(roomId).emit("userLeftRoom", {
        userId: user.userId,
        roomId: roomId,
        timestamp: new Date()
      });
      
      if (callback) {
        callback({
          success: true,
          message: `Left room ${roomId}`
        });
      }
    });

    const roomMessageRateLimiter = createEventRateLimiter("roomMessage", 10, 60000);
    socket.use((packet, next) => {
      if (packet[0] === "roomMessage") {
        return roomMessageRateLimiter(socket, packet[1], next);
      }
      next();
    });
    
    socket.on("roomMessage", (data, callback) => {
      try {
        if (!data.roomId || !data.message) {
          throw new Error("Invalid room message data");
        }
        
        io.to(data.roomId).emit("roomMessageReceived", {
          from: user.userId,
          roomId: data.roomId,
          message: data.message,
          timestamp: new Date()
        });
        
        if (callback) {
          callback({ success: true });
        }
      } catch (error: any) {
        if (callback) {
          callback({ success: false, message: error.message });
        }
      }
    });

    // ==================== NOTIFICATION ====================
    socket.on("sendNotification", (data) => {
      const recipientSocket = userSockets.get(data.to);
      if (recipientSocket) {
        recipientSocket.emit("notification", {
          type: data.type,
          message: data.message,
          timestamp: new Date()
        });
      }
    });

    // ==================== PING/PONG ====================
    socket.on("ping", (callback) => {
      if (callback) {
        callback({ pong: true, timestamp: new Date() });
      }
    });

    // ==================== DISCONNECT ====================
    socket.on("disconnect", (reason) => {
      console.log(`Client disconnected: ${socket.id} - Reason: ${reason}`);
      
      if (user) {
        onlineUsers.delete(user.userId);
        userSockets.delete(user.userId);
        io.emit("onlineUsers", Array.from(onlineUsers.keys()));
        console.log(`User ${user.email} is now offline`);
      }
      
      cleanupRateLimitData(socket.id);
    });

    // ==================== ERROR ====================
    socket.on("error", (error) => {
      console.error(`Socket error for ${socket.id}:`, error);
    });
  });
};

// Helper functions
export const getOnlineUsers = () => {
  return Array.from(onlineUsers.keys());
};

export const getUserSocket = (userId: string): Socket | undefined => {
  return userSockets.get(userId);
};

export const sendNotificationToUser = (io: SocketIOServer, userId: string, notification: any) => {
  const socket = userSockets.get(userId);
  if (socket) {
    socket.emit("notification", notification);
  }
};

export const broadcastMessage = (io: SocketIOServer, event: string, data: any) => {
  io.emit(event, data);
};