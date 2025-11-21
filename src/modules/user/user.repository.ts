import { BaseRepository } from "../../repositories/BaseRepository";
import UserModel, { IUserDoc } from "./user.model";

class UserRepository extends BaseRepository<IUserDoc> {
  constructor() {
    super(UserModel);
  }

  async findByEmail(email: string): Promise<IUserDoc | null> {
    return await this.model.findOne({ email }).exec();
  }

  async findByIdWithoutPassword(id: string): Promise<IUserDoc | null> {
    return await this.model.findById(id).select("-password").exec();
  }

  async findAllWithoutPassword(): Promise<IUserDoc[]> {
    return await this.model.find().select("-password -emailVerificationToken -twoFAToken").exec();
  }

  async getProfile(userId: string): Promise<IUserDoc | null> {
    return await this.model.findById(userId)
      .select("-password -emailVerificationToken -twoFAToken -twoFAExpires")
      .populate("friends", "name email")
      .exec();
  }

  async findByEmailAndToken(
    email: string,
    token: string
  ): Promise<IUserDoc | null> {
    return await this.model.findOne({
      email,
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: Date.now() }
    }).exec();
  }

  async updatePassword(userId: string, hashedPassword: string): Promise<IUserDoc | null> {
    return await this.model.findByIdAndUpdate(
      userId,
      { 
        password: hashedPassword,
        emailVerificationToken: undefined,
        emailVerificationExpires: undefined
      },
      { new: true }
    ).exec();
  }

  async verifyEmail(userId: string): Promise<IUserDoc | null> {
    return await this.model.findByIdAndUpdate(
      userId,
      {
        isEmailVerified: true,
        emailVerificationToken: undefined,
        emailVerificationExpires: undefined
      },
      { new: true }
    ).exec();
  }

  async enable2FA(userId: string): Promise<IUserDoc | null> {
    return await this.model.findByIdAndUpdate(
      userId,
      {
        is2FAEnabled: true,
        twoFAToken: undefined,
        twoFAExpires: undefined
      },
      { new: true }
    ).exec();
  }

  async disable2FA(userId: string): Promise<IUserDoc | null> {
    return await this.model.findByIdAndUpdate(
      userId,
      {
        is2FAEnabled: false,
        twoFAToken: undefined,
        twoFAExpires: undefined
      },
      { new: true }
    ).exec();
  }
}

export default new UserRepository();