import { Request, Response } from "express";
import { createUser, loginUser, getAllUsers } from "./user.service";
import { createdResponse, successResponse, errorResponse } from "../../utils/response";
import { AuthenticatedRequest } from "../auth/auth.middleware";
import userRepository from "./user.repository";

export const signup = async (req: Request, res: Response) => {
  try {
    const user = await createUser(req.body);
    return createdResponse(res, user, "User created");
  } catch (err) {
    return errorResponse(res, err);
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const user = await loginUser(req.body);
    return successResponse(res, user, "Logged in");
  } catch (err) {
    return errorResponse(res, err);
  }
};

export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await getAllUsers();
    return successResponse(res, users, "Users fetched");
  } catch (err) {
    return errorResponse(res, err);
  }
};

export const blockUser = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user || !req.user._id) {
      return errorResponse(res, { status: 401, message: "Unauthorized" });
    }
    const userId = req.user._id.toString();
    const { blockedUserId } = req.body;

    if (!blockedUserId) {
      return errorResponse(res, { status: 400, message: "blockedUserId is required" });
    }

    if (userId === blockedUserId) {
      return errorResponse(res, { status: 400, message: "Cannot block yourself" });
    }

    const user = await userRepository.findById(userId);
    if (!user) {
      return errorResponse(res, { status: 404, message: "User not found" });
    }

    if (!user.blockedUsers) {
      user.blockedUsers = [];
    }

    // Check if already blocked
    if (user.blockedUsers.some(id => id.toString() === blockedUserId)) {
      return successResponse(res, user, "User already blocked");
    }

    user.blockedUsers.push(blockedUserId as any);
    await user.save();

    // Remove from friends if they are friends
    if (user.friends) {
      user.friends = user.friends.filter(id => id.toString() !== blockedUserId);
      await user.save();
    }

    // Also remove from the blocked user's friends list
    const blockedUser = await userRepository.findById(blockedUserId);
    if (blockedUser && blockedUser.friends) {
      blockedUser.friends = blockedUser.friends.filter(id => id.toString() !== userId);
      await blockedUser.save();
    }

    return successResponse(res, user, "User blocked successfully");
  } catch (err) {
    return errorResponse(res, err);
  }
};

export const unblockUser = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user || !req.user._id) {
      return errorResponse(res, { status: 401, message: "Unauthorized" });
    }
    const userId = req.user._id.toString();
    const { blockedUserId } = req.body;

    if (!blockedUserId) {
      return errorResponse(res, { status: 400, message: "blockedUserId is required" });
    }

    const user = await userRepository.findById(userId);
    if (!user) {
      return errorResponse(res, { status: 404, message: "User not found" });
    }

    if (!user.blockedUsers) {
      return successResponse(res, user, "User not blocked");
    }

    user.blockedUsers = user.blockedUsers.filter(id => id.toString() !== blockedUserId);
    await user.save();

    return successResponse(res, user, "User unblocked successfully");
  } catch (err) {
    return errorResponse(res, err);
  }
};

export const getBlockedUsers = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user || !req.user._id) {
      return errorResponse(res, { status: 401, message: "Unauthorized" });
    }
    const userId = req.user._id.toString();

    const user = await userRepository.findById(userId);
    if (!user) {
      return errorResponse(res, { status: 404, message: "User not found" });
    }

    const blockedUsers = await userRepository.find({
      _id: { $in: user.blockedUsers || [] }
    });

    return successResponse(res, blockedUsers, "Blocked users fetched");
  } catch (err) {
    return errorResponse(res, err);
  }
};
