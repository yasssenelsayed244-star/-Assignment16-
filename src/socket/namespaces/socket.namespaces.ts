import { Server as SocketIOServer, Namespace } from "socket.io";
import { socketAuthMiddleware } from "../../config/socket.config";

// ==================== CHAT NAMESPACE ====================
export const initializeChatNamespace = (io: SocketIOServer): Namespace => {
  const chatNamespace = io.of("/chat");
  
  chatNamespace.use(socketAuthMiddleware);
  
  chatNamespace.on("connection", (socket) => {
    console.log(`User connected to /chat: ${socket.id}`);
    
    // Chat-specific events
    socket.on("sendChatMessage", (data, callback) => {
      const user = socket.data.user;
      
      chatNamespace.to(data.roomId).emit("chatMessage", {
        from: user.userId,
        message: data.message,
        timestamp: new Date()
      });
      
      if (callback) {
        callback({ success: true });
      }
    });
    
    socket.on("disconnect", () => {
      console.log(`User disconnected from /chat: ${socket.id}`);
    });
  });
  
  return chatNamespace;
};

// ==================== NOTIFICATIONS NAMESPACE ====================
export const initializeNotificationsNamespace = (io: SocketIOServer): Namespace => {
  const notificationsNamespace = io.of("/notifications");
  
  notificationsNamespace.use(socketAuthMiddleware);
  
  notificationsNamespace.on("connection", (socket) => {
    console.log(`User connected to /notifications: ${socket.id}`);
    
    // Join user's personal notification room
    const user = socket.data.user;
    socket.join(`user:${user.userId}`);
    
    socket.on("markAsRead", (notificationId) => {
      console.log(`Notification ${notificationId} marked as read by ${user.userId}`);
      // يمكن حفظ في قاعدة البيانات
    });
    
    socket.on("disconnect", () => {
      console.log(`User disconnected from /notifications: ${socket.id}`);
    });
  });
  
  return notificationsNamespace;
};

// ==================== ADMIN NAMESPACE ====================
export const initializeAdminNamespace = (io: SocketIOServer): Namespace => {
  const adminNamespace = io.of("/admin");
  
  // Middleware للتحقق من admin role
  adminNamespace.use(socketAuthMiddleware);
  adminNamespace.use((socket, next) => {
    const user = socket.data.user;
    if (user.role !== "admin") {
      return next(new Error("Access denied: Admin only"));
    }
    next();
  });
  
  adminNamespace.on("connection", (socket) => {
    console.log(`Admin connected: ${socket.id}`);
    
    // Admin-specific events
    socket.on("getSystemStats", (callback) => {
      const stats = {
        connectedUsers: io.sockets.sockets.size,
        chatUsers: io.of("/chat").sockets.size,
        notificationUsers: io.of("/notifications").sockets.size,
        timestamp: new Date()
      };
      
      if (callback) {
        callback(stats);
      }
    });
    
    socket.on("broadcastSystemMessage", (message) => {
      io.emit("systemMessage", {
        message: message,
        timestamp: new Date()
      });
    });
    
    socket.on("disconnect", () => {
      console.log(`Admin disconnected: ${socket.id}`);
    });
  });
  
  return adminNamespace;
};

// ==================== INITIALIZE ALL NAMESPACES ====================
export const initializeAllNamespaces = (io: SocketIOServer) => {
  initializeChatNamespace(io);
  initializeNotificationsNamespace(io);
  initializeAdminNamespace(io);
  
  console.log(" All Socket.IO namespaces initialized");
};