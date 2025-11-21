import dotenv from "dotenv";
dotenv.config();
import { createServer } from "http";
import { connectDB } from "./config/db";
import { ensureDefaultAdminUser } from "./config/bootstrap";
import { initializeSocket, socketAuthMiddleware, socketLoggingMiddleware } from "./config/socket.config";
import { handleConnection } from "./socket/socket.events";
import { initializeAllNamespaces } from "./socket/namespaces/socket.namespaces";
import app from "./app";

const PORT = process.env.PORT || 3000;

async function start() {
  // الاتصال بقاعدة البيانات
  await connectDB();
  await ensureDefaultAdminUser();
  
  // إنشاء HTTP Server
  const httpServer = createServer(app);
  
  // تهيئة Socket.IO
  const io = initializeSocket(httpServer);
  
  // تطبيق Socket.IO Middleware على الـ main namespace
  io.use(socketLoggingMiddleware);
  io.use(socketAuthMiddleware);
  
  // تسجيل Socket.IO Events للـ main namespace
  handleConnection(io);
  
  // تهيئة باقي الـ Namespaces
  initializeAllNamespaces(io);
  
  // بدء السيرفر
  httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Socket.IO ready for connections`);
    console.log(`Namespaces: / (main), /chat, /notifications, /admin`);
  });
}

start().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});