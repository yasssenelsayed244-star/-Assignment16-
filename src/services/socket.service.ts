import { getIO } from "../config/socket.config";

// ==================== NOTIFICATION SERVICES ====================

// إرسال notification لمستخدم واحد
export const sendNotificationToUser = (userId: string, notification: {
  type: string;
  title: string;
  message: string;
  data?: any;
}) => {
  try {
    const io = getIO();
    
    // البحث عن socket الخاص بالمستخدم
    const sockets = Array.from(io.sockets.sockets.values());
    const userSocket = sockets.find(socket => socket.data.user?.userId === userId);
    
    if (userSocket) {
      userSocket.emit("notification", {
        ...notification,
        timestamp: new Date()
      });
      console.log(`Notification sent to user ${userId}`);
      return true;
    }
    
    console.log(`User ${userId} is not online`);
    return false;
  } catch (error) {
    console.error("Error sending notification:", error);
    return false;
  }
};

// إرسال notification لعدة مستخدمين
export const sendNotificationToMultipleUsers = (userIds: string[], notification: any) => {
  const results = userIds.map(userId => sendNotificationToUser(userId, notification));
  return results;
};

// Broadcast notification لجميع المستخدمين
export const broadcastNotification = (notification: any) => {
  try {
    const io = getIO();
    io.emit("notification", {
      ...notification,
      timestamp: new Date()
    });
    console.log("Notification broadcasted to all users");
    return true;
  } catch (error) {
    console.error("Error broadcasting notification:", error);
    return false;
  }
};

// ==================== POST SERVICES ====================

// إشعار عند إنشاء منشور جديد
export const notifyNewPost = (post: any) => {
  broadcastNotification({
    type: "newPost",
    title: "New Post",
    message: `${post.author.name} created a new post`,
    data: { postId: post._id }
  });
};

// إشعار عند تعليق جديد
export const notifyNewComment = (comment: any, postAuthorId: string) => {
  sendNotificationToUser(postAuthorId, {
    type: "newComment",
    title: "New Comment",
    message: `${comment.author.name} commented on your post`,
    data: { 
      postId: comment.postId,
      commentId: comment._id 
    }
  });
};

// ==================== MESSAGE SERVICES ====================

// إرسال رسالة مباشرة
export const sendDirectMessage = (fromUserId: string, toUserId: string, message: string) => {
  try {
    const io = getIO();
    const sockets = Array.from(io.sockets.sockets.values());
    const recipientSocket = sockets.find(socket => socket.data.user?.userId === toUserId);
    
    if (recipientSocket) {
      recipientSocket.emit("directMessage", {
        from: fromUserId,
        message: message,
        timestamp: new Date()
      });
      return true;
    }
    return false;
  } catch (error) {
    console.error("Error sending direct message:", error);
    return false;
  }
};

// ==================== ROOM SERVICES ====================

// إرسال رسالة لـ room معين
export const sendRoomMessage = (roomId: string, message: any) => {
  try {
    const io = getIO();
    io.to(roomId).emit("roomMessage", {
      ...message,
      timestamp: new Date()
    });
    return true;
  } catch (error) {
    console.error("Error sending room message:", error);
    return false;
  }
};

// ==================== TYPING INDICATOR SERVICES ====================

// إشعار typing
export const sendTypingIndicator = (fromUserId: string, toUserId: string, isTyping: boolean) => {
  try {
    const io = getIO();
    const sockets = Array.from(io.sockets.sockets.values());
    const recipientSocket = sockets.find(socket => socket.data.user?.userId === toUserId);
    
    if (recipientSocket) {
      recipientSocket.emit("typingIndicator", {
        from: fromUserId,
        isTyping: isTyping
      });
      return true;
    }
    return false;
  } catch (error) {
    console.error("Error sending typing indicator:", error);
    return false;
  }
};

// ==================== ONLINE STATUS SERVICES ====================

// الحصول على المستخدمين المتصلين
export const getOnlineUsers = (): string[] => {
  try {
    const io = getIO();
    const sockets = Array.from(io.sockets.sockets.values());
    return sockets
      .filter(socket => socket.data.user)
      .map(socket => socket.data.user.userId);
  } catch (error) {
    console.error("Error getting online users:", error);
    return [];
  }
};

// التحقق من أن المستخدم متصل
export const isUserOnline = (userId: string): boolean => {
  const onlineUsers = getOnlineUsers();
  return onlineUsers.includes(userId);
};

// إزالة الاتصالات غير الصالحة
export const removeDisconnectedSockets = () => {
  const io = getIO();
  const removedSocketIds: string[] = [];

  io.sockets.sockets.forEach((socket) => {
    const isConnected = socket.connected;
    const hasUser = !!socket.data?.user;

    if (!isConnected || !hasUser) {
      removedSocketIds.push(socket.id);
      socket.disconnect(true);
    }
  });

  return {
    removedCount: removedSocketIds.length,
    removedSocketIds
  };
};