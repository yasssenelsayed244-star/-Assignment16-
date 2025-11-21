import mongoose, { Schema, Document, Types } from "mongoose";

export type GroupMemberRole = "owner" | "admin" | "member";

export interface IGroupMember {
  user: Types.ObjectId;
  role: GroupMemberRole;
  joinedAt: Date;
}

export interface IChatGroup {
  name: string;
  description?: string;
  owner: Types.ObjectId;
  members: IGroupMember[];
  lastActivityAt: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IChatGroupDoc extends IChatGroup, Document {}

const GroupMemberSchema = new Schema<IGroupMember>({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  role: { type: String, enum: ["owner", "admin", "member"], default: "member" },
  joinedAt: { type: Date, default: Date.now }
});

const ChatGroupSchema = new Schema<IChatGroupDoc>({
  name: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
  members: {
    type: [GroupMemberSchema],
    default: []
  },
  lastActivityAt: { type: Date, default: Date.now }
}, { timestamps: true });

ChatGroupSchema.index({ owner: 1, createdAt: -1 });
ChatGroupSchema.index({ "members.user": 1 });

export default mongoose.model<IChatGroupDoc>("ChatGroup", ChatGroupSchema);

