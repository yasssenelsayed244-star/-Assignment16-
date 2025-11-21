import mongoose, { Schema, Document } from "mongoose";
import { IUser } from "../../interfaces/IUser";
import * as hooks from "./user.hooks";

export interface IUserDoc extends IUser, Document {}

const UserSchema: Schema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["user", "admin"], default: "user" },
  isEmailVerified: { type: Boolean, default: false },
  emailVerificationToken: { type: String },
  emailVerificationExpires: { type: Date },
  // 2FA Fields
  is2FAEnabled: { type: Boolean, default: false },
  twoFAToken: { type: String },
  twoFAExpires: { type: Date },
  // Friends
  friends: [{ type: Schema.Types.ObjectId, ref: "User" }],
  // Blocked users
  blockedUsers: [{ type: Schema.Types.ObjectId, ref: "User" }]
}, { timestamps: true });

// ==================== DOCUMENT MIDDLEWARE ====================

UserSchema.pre("save", hooks.preSaveHook);
UserSchema.post("save", hooks.postSaveHook);
UserSchema.pre("validate", hooks.preValidateHook);
UserSchema.post("validate", hooks.postValidateHook);

// ==================== QUERY MIDDLEWARE ====================

UserSchema.pre("find", hooks.preFindHook);
UserSchema.post("find", hooks.postFindHook);
UserSchema.pre("findOne", hooks.preFindOneHook);
UserSchema.pre("findOneAndUpdate", hooks.preFindOneAndUpdateHook);
UserSchema.post("findOneAndUpdate", hooks.postFindOneAndUpdateHook);
UserSchema.pre("deleteOne", { document: true, query: false }, hooks.preDeleteOneHook);
UserSchema.post("deleteOne", { document: true, query: false }, hooks.postDeleteOneHook);

// ==================== AGGREGATE MIDDLEWARE ====================

UserSchema.pre("aggregate", hooks.preAggregateHook);

// ==================== INSTANCE METHODS ====================

UserSchema.methods.comparePassword = async function(candidatePassword: string) {
  const bcrypt = require("bcrypt");
  return await bcrypt.compare(candidatePassword, this.password);
};

// ==================== STATIC METHODS ====================

UserSchema.statics.findByEmail = function(email: string) {
  return this.findOne({ email });
};

export default mongoose.model<IUserDoc>("User", UserSchema);