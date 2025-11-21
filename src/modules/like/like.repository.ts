import { BaseRepository } from "../../repositories/BaseRepository";
import LikeModel, { ILikeDoc } from "./like.model";

class LikeRepository extends BaseRepository<ILikeDoc> {
  constructor() {
    super(LikeModel);
  }

  async toggleLike(userId: string, targetType: "post" | "comment", targetId: string): Promise<{ liked: boolean; like: ILikeDoc | null }> {
    const existingLike = await this.model.findOne({
      user: userId,
      targetType,
      targetId
    }).exec();

    if (existingLike) {
      // Unlike - delete the like
      await this.model.deleteOne({ _id: existingLike._id }).exec();
      return { liked: false, like: null };
    } else {
      // Like - create new like
      const like = await this.model.create({
        user: userId,
        targetType,
        targetId
      });
      return { liked: true, like };
    }
  }

  async getLikesCount(targetType: "post" | "comment", targetId: string): Promise<number> {
    return await this.model.countDocuments({ targetType, targetId }).exec();
  }

  async isLikedByUser(userId: string, targetType: "post" | "comment", targetId: string): Promise<boolean> {
    const like = await this.model.findOne({
      user: userId,
      targetType,
      targetId
    }).exec();
    return !!like;
  }

  async getLikesByTarget(targetType: "post" | "comment", targetId: string): Promise<ILikeDoc[]> {
    return await this.model.find({ targetType, targetId })
      .populate("user", "name email")
      .exec();
  }
}

export default new LikeRepository();

