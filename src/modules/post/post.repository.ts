import { BaseRepository } from "../../repositories/BaseRepository";
import PostModel, { IPostDoc } from "./post.model";

class PostRepository extends BaseRepository<IPostDoc> {
  constructor() {
    super(PostModel);
  }

  async findAllWithAuthor(): Promise<IPostDoc[]> {
    return await this.model.find().populate("author", "name email").exec();
  }

  async findByIdWithAuthor(postId: string): Promise<IPostDoc | null> {
    return await this.model.findById(postId).populate("author", "name email").exec();
  }

  async findByAuthor(authorId: string): Promise<IPostDoc[]> {
    return await this.model.find({ author: authorId }).populate("author", "name email").exec();
  }
}

export default new PostRepository();