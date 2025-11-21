import mongoose, { Schema, Document } from "mongoose";

export interface ILike {
  user: string; // user id
  targetType: "post" | "comment";
  targetId: string; // post or comment id
  createdAt?: Date;
}

export interface ILikeDoc extends ILike, Document {}

const LikeSchema: Schema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  targetType: { type: String, enum: ["post", "comment"], required: true },
  targetId: { type: Schema.Types.ObjectId, required: true, refPath: "targetType" }
}, { timestamps: true });

// Prevent duplicate likes
LikeSchema.index({ user: 1, targetType: 1, targetId: 1 }, { unique: true });

export default mongoose.model<ILikeDoc>("Like", LikeSchema);

