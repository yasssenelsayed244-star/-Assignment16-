import { Response } from "express";
import likeRepository from "./like.repository";
import { successResponse, errorResponse } from "../../utils/response";
import { AuthenticatedRequest } from "../auth/auth.middleware";

export const toggleLike = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user || !req.user._id) {
      return errorResponse(res, { status: 401, message: "Unauthorized" });
    }
    const userId = req.user._id.toString();
    const { targetType, targetId } = req.body;

    if (!targetType || !targetId) {
      return errorResponse(res, { status: 400, message: "targetType and targetId are required" });
    }

    if (targetType !== "post" && targetType !== "comment") {
      return errorResponse(res, { status: 400, message: "targetType must be 'post' or 'comment'" });
    }

    const result = await likeRepository.toggleLike(userId, targetType, targetId);
    const likesCount = await likeRepository.getLikesCount(targetType, targetId);

    return successResponse(res, {
      liked: result.liked,
      likesCount,
      like: result.like
    }, result.liked ? "Liked successfully" : "Unliked successfully");
  } catch (err) {
    return errorResponse(res, err);
  }
};

export const getLikesCount = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { targetType, targetId } = req.query;

    if (!targetType || !targetId) {
      return errorResponse(res, { status: 400, message: "targetType and targetId are required" });
    }

    if (targetType !== "post" && targetType !== "comment") {
      return errorResponse(res, { status: 400, message: "targetType must be 'post' or 'comment'" });
    }

    const count = await likeRepository.getLikesCount(targetType as "post" | "comment", targetId as string);
    const isLiked = req.user && req.user._id 
      ? await likeRepository.isLikedByUser(req.user._id.toString(), targetType as "post" | "comment", targetId as string)
      : false;

    return successResponse(res, { count, isLiked }, "Likes count fetched");
  } catch (err) {
    return errorResponse(res, err);
  }
};

export const getLikes = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { targetType, targetId } = req.query;

    if (!targetType || !targetId) {
      return errorResponse(res, { status: 400, message: "targetType and targetId are required" });
    }

    if (targetType !== "post" && targetType !== "comment") {
      return errorResponse(res, { status: 400, message: "targetType must be 'post' or 'comment'" });
    }

    const likes = await likeRepository.getLikesByTarget(targetType as "post" | "comment", targetId as string);
    return successResponse(res, likes, "Likes fetched");
  } catch (err) {
    return errorResponse(res, err);
  }
};

