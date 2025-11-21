import mongoose, { Schema, Document } from "mongoose";
import { IPost } from "../../interfaces/IPost";
import * as hooks from "./post.hooks";

export interface IPostDoc extends IPost, Document {
  
}

const PostSchema: Schema = new Schema({
  author: { type: Schema.Types.ObjectId, ref: "User", required: true },
  content: { type: String, required: true },
  isFrozen: { type: Boolean, default: false },
  tags: [{ type: Schema.Types.ObjectId, ref: "User" }] // Users tagged in the post
}, { timestamps: true });

// ==================== DOCUMENT MIDDLEWARE ====================

PostSchema.pre("save", hooks.preSaveHook);
PostSchema.post("save", hooks.postSaveHook);

// ==================== QUERY MIDDLEWARE ====================

PostSchema.pre("find", hooks.preFindHook);
PostSchema.post("find", hooks.postFindHook);
PostSchema.pre("findOne", hooks.preFindHook);
PostSchema.pre("findOneAndUpdate", hooks.preFindOneAndUpdateHook);
PostSchema.post("findOneAndUpdate", hooks.postFindOneAndUpdateHook);
PostSchema.pre("deleteOne", { document: true, query: false }, hooks.preDeleteOneHook);
PostSchema.post("deleteOne", { document: true, query: false }, hooks.postDeleteOneHook);

// ==================== INSTANCE METHODS ====================

// عدد التعليقات على المنشور
PostSchema.methods.getCommentsCount = async function() {
  const Comment = require("../comment/comment.model").default;
  return await Comment.countDocuments({ postId: this._id });
};

// ==================== STATIC METHODS ====================

// البحث عن منشورات مستخدم معين
PostSchema.statics.findByAuthor = function(authorId: string) {
  return this.find({ author: authorId }).populate("author", "name email");
};

export default mongoose.model<IPostDoc>("Post", PostSchema);