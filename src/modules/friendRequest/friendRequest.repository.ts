import { BaseRepository } from "../../repositories/BaseRepository";
import FriendRequestModel, { IFriendRequestDoc } from "./friendRequest.model";

class FriendRequestRepository extends BaseRepository<IFriendRequestDoc> {
  constructor() {
    super(FriendRequestModel);
  }

  // Get pending requests for user
  async getPendingRequests(userId: string): Promise<IFriendRequestDoc[]> {
    return await this.model.find({
      receiver: userId,
      status: "pending"
    })
    .populate("sender", "name email")
    .sort({ createdAt: -1 })
    .exec();
  }

  // Get sent requests
  async getSentRequests(userId: string): Promise<IFriendRequestDoc[]> {
    return await this.model.find({
      sender: userId,
      status: "pending"
    })
    .populate("receiver", "name email")
    .sort({ createdAt: -1 })
    .exec();
  }

  // Check if request exists
  async requestExists(sender: string, receiver: string): Promise<boolean> {
    const exists = await this.model.exists({
      $or: [
        { sender, receiver },
        { sender: receiver, receiver: sender }
      ]
    });
    return !!exists;
  }

  // Accept request
  async acceptRequest(requestId: string): Promise<IFriendRequestDoc | null> {
    return await this.model.findByIdAndUpdate(
      requestId,
      { status: "accepted" },
      { new: true }
    ).exec();
  }

  // Reject request
  async rejectRequest(requestId: string): Promise<IFriendRequestDoc | null> {
    return await this.model.findByIdAndUpdate(
      requestId,
      { status: "rejected" },
      { new: true }
    ).exec();
  }
}

export default new FriendRequestRepository();