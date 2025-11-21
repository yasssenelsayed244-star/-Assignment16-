import { BaseRepository } from "../../repositories/BaseRepository";
import MessageModel, { IMessageDoc } from "./message.model";

class MessageRepository extends BaseRepository<IMessageDoc> {
  constructor() {
    super(MessageModel);
  }

  // Get chat between two users
  async getChatMessages(user1: string, user2: string, limit: number = 50): Promise<IMessageDoc[]> {
    return await this.model.find({
      $or: [
        { sender: user1, receiver: user2 },
        { sender: user2, receiver: user1 }
      ]
    })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate("sender", "name email")
    .populate("receiver", "name email")
    .exec();
  }

  // Get unread messages count
  async getUnreadCount(userId: string): Promise<number> {
    return await this.model.countDocuments({
      receiver: userId,
      isRead: false
    }).exec();
  }

  // Mark messages as read
  async markAsRead(sender: string, receiver: string): Promise<any> {
    return await this.model.updateMany(
      { sender, receiver, isRead: false },
      { isRead: true }
    ).exec();
  }

  // Get recent conversations
  async getRecentConversations(userId: string): Promise<any[]> {
    return await this.model.aggregate([
      {
        $match: {
          $or: [
            { sender: userId },
            { receiver: userId }
          ]
        }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ["$sender", userId] },
              "$receiver",
              "$sender"
            ]
          },
          lastMessage: { $first: "$$ROOT" }
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "userInfo"
        }
      },
      {
        $unwind: "$userInfo"
      },
      {
        $project: {
          userId: "$_id",
          name: "$userInfo.name",
          email: "$userInfo.email",
          lastMessage: "$lastMessage.content",
          lastMessageTime: "$lastMessage.createdAt",
          isRead: "$lastMessage.isRead"
        }
      }
    ]).exec();
  }
}

export default new MessageRepository();