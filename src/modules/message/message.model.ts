import mongoose, { Schema, Document } from "mongoose";

export interface IMessage {
  sender: string;
  receiver: string;
  content: string;
  isRead: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IMessageDoc extends IMessage, Document {}

const MessageSchema: Schema = new Schema({
  sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
  receiver: { type: Schema.Types.ObjectId, ref: "User", required: true },
  content: { type: String, required: true },
  isRead: { type: Boolean, default: false }
}, { timestamps: true });

// Index for faster queries
MessageSchema.index({ sender: 1, receiver: 1 });
MessageSchema.index({ createdAt: -1 });

export default mongoose.model<IMessageDoc>("Message", MessageSchema);