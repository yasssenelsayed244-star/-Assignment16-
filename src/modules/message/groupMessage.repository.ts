import { BaseRepository } from "../../repositories/BaseRepository";
import GroupMessageModel, { IGroupMessageDoc } from "./groupMessage.model";

class GroupMessageRepository extends BaseRepository<IGroupMessageDoc> {
  constructor() {
    super(GroupMessageModel);
  }

  async getMessages(groupId: string, limit = 100): Promise<IGroupMessageDoc[]> {
    return this.model
      .find({ group: groupId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate("sender", "name email")
      .exec();
  }
}

export default new GroupMessageRepository();

