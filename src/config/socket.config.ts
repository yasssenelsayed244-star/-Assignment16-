import { Server as HTTPServer } from "http";
import { Server as SocketIOServer, Socket } from "socket.io";
import jwt from "jsonwebtoken";

let io: SocketIOServer;

// إعداد Socket.IO Server
export const initializeSocket = (httpServer: HTTPServer): SocketIOServer => {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || "http://localhost:3000",
      methods: ["GET", "POST"],
      credentials: true
    },
    // إعدادات الاتصال
    pingTimeout: 60000,
    pingInterval: 25000
  });

  console.log("Socket.IO initialized");
  return io;
};

// الحصول على Socket.IO instance
export const getIO = (): SocketIOServer => {
  if (!io) {
    throw new Error("Socket.IO not initialized");
  }
  return io;
};

// Socket.IO Middleware للمصادقة
export const socketAuthMiddleware = (socket: Socket, next: Function) => {
  try {
    const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(" ")[1];

    if (!token) {
      return next(new Error("Authentication error: No token provided"));
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      return next(new Error("JWT secret not configured"));
    }

    // التحقق من Token
    const decoded = jwt.verify(token, jwtSecret) as any;
    
    // حفظ بيانات المستخدم في socket
    socket.data.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role
    };

    console.log(`User authenticated: ${decoded.email}`);
    next();
  } catch (error) {
    console.error("Socket authentication error:", error);
    next(new Error("Authentication error: Invalid token"));
  }
};

// Socket.IO Middleware للـ Logging
export const socketLoggingMiddleware = (socket: Socket, next: Function) => {
  console.log(`[${new Date().toISOString()}] Socket connecting: ${socket.id}`);
  next();
};

// Socket.IO Middleware للـ Rate Limiting
export const socketRateLimitMiddleware = (socket: Socket, next: Function) => {
  // يمكن إضافة rate limiting logic هنا
  // مثال: تحديد عدد الاتصالات من نفس الـ IP
  next();
};