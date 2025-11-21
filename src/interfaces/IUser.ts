import { Types } from "mongoose";

export interface IUser {
  name: string;
  email: string;
  password?: string;
  role?: "user" | "admin";
  isEmailVerified?: boolean;
  emailVerificationToken?: string;
  emailVerificationExpires?: Date;
  // 2FA Fields
  is2FAEnabled?: boolean;
  twoFAToken?: string;
  twoFAExpires?: Date;
  // Friends
  friends?: Types.ObjectId[];
  // Blocked users
  blockedUsers?: Types.ObjectId[];
}