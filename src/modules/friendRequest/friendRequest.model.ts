import mongoose, { Schema, Document } from "mongoose";

export interface IFriendRequest {
  sender: string;
  receiver: string;
  status: "pending" | "accepted" | "rejected";
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IFriendRequestDoc extends IFriendRequest, Document {}

const FriendRequestSchema: Schema = new Schema({
  sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
  receiver: { type: Schema.Types.ObjectId, ref: "User", required: true },
  status: { 
    type: String, 
    enum: ["pending", "accepted", "rejected"], 
    default: "pending" 
  }
}, { timestamps: true });

// Prevent duplicate friend requests
FriendRequestSchema.index({ sender: 1, receiver: 1 }, { unique: true });

export default mongoose.model<IFriendRequestDoc>("FriendRequest", FriendRequestSchema);