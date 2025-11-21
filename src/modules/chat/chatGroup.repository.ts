import { BaseRepository } from "../../repositories/BaseRepository";
import ChatGroupModel, { IChatGroupDoc } from "./chatGroup.model";
import { Types } from "mongoose";

class ChatGroupRepository extends BaseRepository<IChatGroupDoc> {
  constructor() {
    super(ChatGroupModel);
  }

  async findByMember(userId: string): Promise<IChatGroupDoc[]> {
    return this.model
      .find({ "members.user": userId })
      .populate("owner", "name email")
      .populate("members.user", "name email")
      .sort({ lastActivityAt: -1 })
      .exec();
  }

  async isMember(groupId: string, userId: string): Promise<boolean> {
    const exists = await this.model.exists({
      _id: groupId,
      "members.user": userId
    });
    return !!exists;
  }

  async addMember(groupId: string, userId: string, role: "admin" | "member" = "member") {
    return this.model.findByIdAndUpdate(
      groupId,
      {
        $addToSet: {
          members: {
            user: new Types.ObjectId(userId),
            role,
            joinedAt: new Date()
          }
        },
        $set: { lastActivityAt: new Date() }
      },
      { new: true }
    )
    .populate("owner", "name email")
    .populate("members.user", "name email")
    .exec();
  }
}

export default new ChatGroupRepository();

