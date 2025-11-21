// ==================== Socket User Data ====================
export interface SocketUserData {
  userId: string;
  email: string;
  role: string;
}

// ==================== Message Types ====================
export interface DirectMessage {
  to: string;
  message: string;
}

export interface RoomMessage {
  roomId: string;
  message: string;
}

export interface MessageResponse {
  from: string;
  message: string;
  timestamp: Date;
}

// ==================== Notification Types ====================
export interface Notification {
  type: "newPost" | "newComment" | "newLike" | "newFollower" | "system";
  title: string;
  message: string;
  data?: any;
  timestamp?: Date;
}

// ==================== Typing Indicator ====================
export interface TypingIndicator {
  to: string;
  isTyping: boolean;
}

// ==================== Room Events ====================
export interface JoinRoomData {
  roomId: string;
}

export interface LeaveRoomData {
  roomId: string;
}

export interface UserJoinedRoom {
  userId: string;
  roomId: string;
  timestamp: Date;
}

export interface UserLeftRoom {
  userId: string;
  roomId: string;
  timestamp: Date;
}

// ==================== Connection Events ====================
export interface ConnectedResponse {
  socketId: string;
  message: string;
  timestamp: Date;
}

// ==================== ACK Response ====================
export interface AckResponse {
  success: boolean;
  message: string;
  data?: any;
  timestamp?: Date;
}

// ==================== Online Users ====================
export interface OnlineUsersData {
  users: string[];
  count: number;
}