import { BaseRepository } from "../../repositories/BaseRepository";
import CommentModel, { ICommentDoc } from "./comment.model";

class CommentRepository extends BaseRepository<ICommentDoc> {
  constructor() {
    super(CommentModel);
  }

  async findByPostWithAuthor(postId: string): Promise<ICommentDoc[]> {
    return await this.model.find({ postId }).populate("author", "name email").exec();
  }

  async findByAuthor(authorId: string): Promise<ICommentDoc[]> {
    return await this.model.find({ author: authorId }).populate("author", "name email").exec();
  }

  async countByPost(postId: string): Promise<number> {
    return await this.model.countDocuments({ postId }).exec();
  }

  async findByIdWithAuthor(commentId: string): Promise<ICommentDoc | null> {
    return await this.model.findById(commentId).populate("author", "name email").exec();
  }

  async findByIdWithReplies(commentId: string): Promise<ICommentDoc | null> {
    return await this.model.findById(commentId)
      .populate("author", "name email")
      .populate({
        path: "parentComment",
        populate: { path: "author", select: "name email" }
      })
      .exec();
  }

  async findRepliesByComment(commentId: string): Promise<ICommentDoc[]> {
    return await this.model.find({ parentComment: commentId })
      .populate("author", "name email")
      .sort({ createdAt: 1 })
      .exec();
  }
}

export default new CommentRepository();