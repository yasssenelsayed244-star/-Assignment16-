import { Response } from "express";
import messageRepository from "../message/message.repository";
import friendRequestRepository from "../friendRequest/friendRequest.repository";
import userRepository from "../user/user.repository";
import chatGroupRepository from "./chatGroup.repository";
import groupMessageRepository from "../message/groupMessage.repository";
import { successResponse, errorResponse, createdResponse } from "../../utils/response";
import { sendNotificationToUser, sendRoomMessage } from "../../services/socket.service";
import { AuthenticatedRequest } from "../auth/auth.middleware";

// ==================== SEND MESSAGE ====================
export const sendMessage = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user || !req.user._id) {
      return errorResponse(res, { status: 401, message: "Unauthorized" });
    }
    const senderId = req.user._id.toString();
    const { receiverId, content } = req.body;

    if (!receiverId || !content) {
      return errorResponse(res, { status: 400, message: "Receiver and content are required" });
    }

    const message = await messageRepository.create({
      sender: senderId,
      receiver: receiverId,
      content,
      isRead: false
    } as any);

    // Send real-time notification
    sendNotificationToUser(receiverId, {
      type: "newMessage",
      title: "New Message",
      message: `You have a new message`,
      data: { messageId: message._id, senderId }
    });

    return createdResponse(res, message, "Message sent");
  } catch (err) {
    return errorResponse(res, err);
  }
};

// ==================== GET CHAT ====================
export const getChat = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user || !req.user._id) {
      return errorResponse(res, { status: 401, message: "Unauthorized" });
    }
    const userId = req.user._id.toString();
    const { otherUserId } = req.params;

    const messages = await messageRepository.getChatMessages(userId, otherUserId);

    // Mark messages as read
    await messageRepository.markAsRead(otherUserId, userId);

    return successResponse(res, messages.reverse(), "Chat fetched");
  } catch (err) {
    return errorResponse(res, err);
  }
};

// ==================== GET CONVERSATIONS ====================
export const getConversations = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user || !req.user._id) {
      return errorResponse(res, { status: 401, message: "Unauthorized" });
    }
    const userId = req.user._id.toString();

    const conversations = await messageRepository.getRecentConversations(userId);

    return successResponse(res, conversations, "Conversations fetched");
  } catch (err) {
    return errorResponse(res, err);
  }
};

// ==================== GET UNREAD COUNT ====================
export const getUnreadCount = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user || !req.user._id) {
      return errorResponse(res, { status: 401, message: "Unauthorized" });
    }
    const userId = req.user._id.toString();

    const count = await messageRepository.getUnreadCount(userId);

    return successResponse(res, { count }, "Unread count fetched");
  } catch (err) {
    return errorResponse(res, err);
  }
};

// ==================== CHAT RECAP ====================
export const getChatRecap = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user || !req.user._id) {
      return errorResponse(res, { status: 401, message: "Unauthorized" });
    }
    const userId = req.user._id.toString();

    const [conversations, groups, unreadCount] = await Promise.all([
      messageRepository.getRecentConversations(userId),
      chatGroupRepository.findByMember(userId),
      messageRepository.getUnreadCount(userId)
    ]);

    return successResponse(res, {
      conversations,
      groups,
      unreadCount
    }, "Chat recap fetched");
  } catch (err) {
    return errorResponse(res, err);
  }
};

// ==================== GROUP CHAT ====================
export const createChatGroup = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user || !req.user._id) {
      return errorResponse(res, { status: 401, message: "Unauthorized" });
    }
    const ownerId = req.user._id.toString();
    const { name, description, members = [] } = req.body;

    const uniqueMembers = Array.from(new Set<string>([
      ownerId,
      ...members.filter((memberId: string) => !!memberId)
    ]));

    const group = await chatGroupRepository.create({
      name,
      description,
      owner: ownerId,
      members: uniqueMembers.map((memberId) => ({
        user: memberId,
        role: memberId === ownerId ? "owner" : "member",
        joinedAt: new Date()
      })),
      lastActivityAt: new Date()
    } as any);

    const populated = await chatGroupRepository.findById(group.id);

    return createdResponse(res, populated || group, "Chat group created");
  } catch (err) {
    return errorResponse(res, err);
  }
};

export const listUserGroups = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user || !req.user._id) {
      return errorResponse(res, { status: 401, message: "Unauthorized" });
    }
    const userId = req.user._id.toString();
    const groups = await chatGroupRepository.findByMember(userId);
    return successResponse(res, groups, "Groups fetched");
  } catch (err) {
    return errorResponse(res, err);
  }
};

export const getGroupChat = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user || !req.user._id) {
      return errorResponse(res, { status: 401, message: "Unauthorized" });
    }
    const userId = req.user._id.toString();
    const { groupId } = req.params;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 100;

    const isMember = await chatGroupRepository.isMember(groupId, userId);
    if (!isMember) {
      return errorResponse(res, { status: 403, message: "You are not a member of this group" });
    }

    const messages = await groupMessageRepository.getMessages(groupId, limit);
    return successResponse(res, messages.reverse(), "Group chat fetched");
  } catch (err) {
    return errorResponse(res, err);
  }
};

export const joinGroup = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user || !req.user._id) {
      return errorResponse(res, { status: 401, message: "Unauthorized" });
    }
    const userId = req.user._id.toString();
    const { groupId } = req.params;

    const group = await chatGroupRepository.findById(groupId);
    if (!group) {
      return errorResponse(res, { status: 404, message: "Group not found" });
    }

    const isMember = await chatGroupRepository.isMember(groupId, userId);
    if (isMember) {
      return successResponse(res, group, "Already a member of this group");
    }

    const updatedGroup = await chatGroupRepository.addMember(groupId, userId);
    return successResponse(res, updatedGroup, "Joined group successfully");
  } catch (err) {
    return errorResponse(res, err);
  }
};

export const sendGroupMessage = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user || !req.user._id) {
      return errorResponse(res, { status: 401, message: "Unauthorized" });
    }
    const userId = req.user._id.toString();
    const { groupId } = req.params;
    const { content } = req.body;

    const isMember = await chatGroupRepository.isMember(groupId, userId);
    if (!isMember) {
      return errorResponse(res, { status: 403, message: "You are not a member of this group" });
    }

    const message = await groupMessageRepository.create({
      group: groupId,
      sender: userId,
      content
    } as any);

    await chatGroupRepository.update(groupId, { lastActivityAt: new Date() } as any);

    sendRoomMessage(groupId, {
      groupId,
      senderId: userId,
      content,
      messageId: message._id
    });

    return createdResponse(res, message, "Message sent to group");
  } catch (err) {
    return errorResponse(res, err);
  }
};

// ==================== SEND FRIEND REQUEST ====================
export const sendFriendRequest = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user || !req.user._id) {
      return errorResponse(res, { status: 401, message: "Unauthorized" });
    }
    const senderId = req.user._id.toString();
    const { receiverId } = req.body;

    if (!receiverId) {
      return errorResponse(res, { status: 400, message: "Receiver ID is required" });
    }

    if (senderId === receiverId) {
      return errorResponse(res, { status: 400, message: "Cannot send friend request to yourself" });
    }

    // Check if request already exists
    const exists = await friendRequestRepository.requestExists(senderId, receiverId);
    if (exists) {
      return errorResponse(res, { status: 400, message: "Friend request already sent or exists" });
    }

    const friendRequest = await friendRequestRepository.create({
      sender: senderId,
      receiver: receiverId,
      status: "pending"
    } as any);

    // Send notification
    sendNotificationToUser(receiverId, {
      type: "friendRequest",
      title: "New Friend Request",
      message: `You have a new friend request`,
      data: { requestId: friendRequest._id, senderId }
    });

    return createdResponse(res, friendRequest, "Friend request sent");
  } catch (err) {
    return errorResponse(res, err);
  }
};

// ==================== GET FRIEND REQUESTS ====================
export const getFriendRequests = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user || !req.user._id) {
      return errorResponse(res, { status: 401, message: "Unauthorized" });
    }
    const userId = req.user._id.toString();

    const requests = await friendRequestRepository.getPendingRequests(userId);

    return successResponse(res, requests, "Friend requests fetched");
  } catch (err) {
    return errorResponse(res, err);
  }
};

// ==================== ACCEPT FRIEND REQUEST ====================
export const acceptFriendRequest = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user || !req.user._id) {
      return errorResponse(res, { status: 401, message: "Unauthorized" });
    }
    const userId = req.user._id.toString();
    const { requestId } = req.params;

    const request = await friendRequestRepository.findById(requestId);

    if (!request) {
      return errorResponse(res, { status: 404, message: "Request not found" });
    }

    if (request.receiver.toString() !== userId) {
      return errorResponse(res, { status: 403, message: "Not authorized" });
    }

    await friendRequestRepository.acceptRequest(requestId);

    // Add to friends list
    const user = await userRepository.findById(userId);
    const sender = await userRepository.findById(request.sender.toString());

    if (user && sender) {
      if (!user.friends) user.friends = [];
      if (!sender.friends) sender.friends = [];
      
      user.friends.push(request.sender as any);
      sender.friends.push(userId as any);
      
      await user.save();
      await sender.save();
    }

    // Notify sender
    sendNotificationToUser(request.sender.toString(), {
      type: "friendRequestAccepted",
      title: "Friend Request Accepted",
      message: `Your friend request was accepted`,
      data: { userId }
    });

    return successResponse(res, null, "Friend request accepted");
  } catch (err) {
    return errorResponse(res, err);
  }
};

// ==================== REJECT FRIEND REQUEST ====================
export const rejectFriendRequest = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user || !req.user._id) {
      return errorResponse(res, { status: 401, message: "Unauthorized" });
    }
    const userId = req.user._id.toString();
    const { requestId } = req.params;

    const request = await friendRequestRepository.findById(requestId);

    if (!request) {
      return errorResponse(res, { status: 404, message: "Request not found" });
    }

    if (request.receiver.toString() !== userId) {
      return errorResponse(res, { status: 403, message: "Not authorized" });
    }

    await friendRequestRepository.rejectRequest(requestId);

    return successResponse(res, null, "Friend request rejected");
  } catch (err) {
    return errorResponse(res, err);
  }
};

// ==================== GET FRIENDS ====================
export const getFriends = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user || !req.user._id) {
      return errorResponse(res, { status: 401, message: "Unauthorized" });
    }
    const userId = req.user._id.toString();

    const user = await userRepository.findById(userId);

    if (!user) {
      return errorResponse(res, { status: 404, message: "User not found" });
    }

    const friends = await userRepository.find({
      _id: { $in: user.friends || [] }
    });

    return successResponse(res, friends, "Friends fetched");
  } catch (err) {
    return errorResponse(res, err);
  }
};

// ==================== DELETE FRIEND REQUEST ====================
export const deleteFriendRequest = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user || !req.user._id) {
      return errorResponse(res, { status: 401, message: "Unauthorized" });
    }
    const userId = req.user._id.toString();
    const { requestId } = req.params;

    const request = await friendRequestRepository.findById(requestId);

    if (!request) {
      return errorResponse(res, { status: 404, message: "Request not found" });
    }

    // Check if user is the sender or receiver
    if (request.sender.toString() !== userId && request.receiver.toString() !== userId) {
      return errorResponse(res, { status: 403, message: "Not authorized to delete this request" });
    }

    await friendRequestRepository.delete(requestId);

    return successResponse(res, null, "Friend request deleted");
  } catch (err) {
    return errorResponse(res, err);
  }
};

// ==================== UNFRIEND ====================
export const unfriend = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user || !req.user._id) {
      return errorResponse(res, { status: 401, message: "Unauthorized" });
    }
    const userId = req.user._id.toString();
    const { friendId } = req.body;

    if (!friendId) {
      return errorResponse(res, { status: 400, message: "friendId is required" });
    }

    if (userId === friendId) {
      return errorResponse(res, { status: 400, message: "Cannot unfriend yourself" });
    }

    const user = await userRepository.findById(userId);
    const friend = await userRepository.findById(friendId);

    if (!user || !friend) {
      return errorResponse(res, { status: 404, message: "User not found" });
    }

    // Remove from both users' friends lists
    if (user.friends) {
      user.friends = user.friends.filter(id => id.toString() !== friendId);
      await user.save();
    }

    if (friend.friends) {
      friend.friends = friend.friends.filter(id => id.toString() !== userId);
      await friend.save();
    }

    return successResponse(res, null, "Unfriended successfully");
  } catch (err) {
    return errorResponse(res, err);
  }
};