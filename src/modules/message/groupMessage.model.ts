import mongoose, { Schema, Document } from "mongoose";

export interface IGroupMessage {
  group: string;
  sender: string;
  content: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IGroupMessageDoc extends IGroupMessage, Document {}

const GroupMessageSchema: Schema = new Schema({
  group: { type: Schema.Types.ObjectId, ref: "ChatGroup", required: true },
  sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
  content: { type: String, required: true, trim: true }
}, { timestamps: true });

GroupMessageSchema.index({ group: 1, createdAt: -1 });

export default mongoose.model<IGroupMessageDoc>("GroupMessage", GroupMessageSchema);

