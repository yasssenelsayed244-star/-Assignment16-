import express from "express";
import authRoutes from "./modules/auth/auth.routes";
import twoFARoutes from "./modules/twoFA/twoFA.routes";
import userRoutes from "./modules/user/user.routes";
import postRoutes from "./modules/post/post.routes";
import commentRoutes from "./modules/comment/comment.routes";
import uploadRoutes from "./modules/upload/upload.routes";
import socketRoutes from "./modules/socket/socket.routes";
import chatRoutes from "./modules/chat/chat.routes";
import likeRoutes from "./modules/like/like.routes";
import { errorHandler } from "./utils/errorHandling";

const app = express();
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/2fa", twoFARoutes);
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/socket", socketRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/likes", likeRoutes);

// Error handler (last middleware)
app.use(errorHandler);

export default app;