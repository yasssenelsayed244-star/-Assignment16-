import mongoose, { Schema, Document } from "mongoose";
import { IComment } from "../../interfaces/IComment";
import * as hooks from "./comment.hooks";

export interface ICommentDoc extends IComment, Document {}

const CommentSchema: Schema = new Schema({
  postId: { type: Schema.Types.ObjectId, ref: "Post", required: true },
  author: { type: Schema.Types.ObjectId, ref: "User", required: true },
  content: { type: String, required: true },
  parentComment: { type: Schema.Types.ObjectId, ref: "Comment", default: null }, // For replies
  isFrozen: { type: Boolean, default: false },
  tags: [{ type: Schema.Types.ObjectId, ref: "User" }] // Users tagged in the comment
}, { timestamps: true });

// ==================== DOCUMENT MIDDLEWARE ====================

CommentSchema.pre("save", hooks.preSaveHook);
CommentSchema.post("save", hooks.postSaveHook);

// ==================== QUERY MIDDLEWARE ====================

CommentSchema.pre("find", hooks.preFindHook);
CommentSchema.post("find", hooks.postFindHook);
CommentSchema.pre("findOne", hooks.preFindHook);
CommentSchema.pre("findOneAndUpdate", hooks.preFindOneAndUpdateHook);
CommentSchema.post("findOneAndUpdate", hooks.postFindOneAndUpdateHook);
CommentSchema.pre("deleteOne", { document: true, query: false }, hooks.preDeleteOneHook);
CommentSchema.post("deleteOne", { document: true, query: false }, hooks.postDeleteOneHook);

// ==================== INSTANCE METHODS ====================

// الحصول على معلومات المنشور
CommentSchema.methods.getPost = async function() {
  const Post = require("../post/post.model").default;
  return await Post.findById(this.postId);
};

// ==================== STATIC METHODS ====================

// البحث عن تعليقات منشور معين
CommentSchema.statics.findByPost = function(postId: string) {
  return this.find({ postId }).populate("author", "name email");
};

// عدد التعليقات على منشور
CommentSchema.statics.countByPost = function(postId: string) {
  return this.countDocuments({ postId });
};

export default mongoose.model<ICommentDoc>("Comment", CommentSchema);