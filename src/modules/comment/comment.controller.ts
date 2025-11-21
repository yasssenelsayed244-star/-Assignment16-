import { Response } from "express";
import { addComment, getCommentsByPost, getCommentById, getCommentWithReplies, updateComment, freezeComment, unfreezeComment, hardDeleteComment } from "./comment.service";
import postRepository from "../post/post.repository";
import commentRepository from "./comment.repository";
import userRepository from "../user/user.repository";
import { createdResponse, successResponse, errorResponse } from "../../utils/response";
import { notifyNewComment } from "../../services/socket.service";
import { AuthenticatedRequest } from "../auth/auth.middleware";
import { sendEmail } from "../../utils/send_email_function";

// Helper function for tag notification emails
const getTagNotificationTemplate = (userName: string, message: string): string => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>You were tagged</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          background-color: #f4f4f4;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 50px auto;
          background-color: #ffffff;
          padding: 30px;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
          text-align: center;
          padding-bottom: 20px;
          border-bottom: 2px solid #4CAF50;
        }
        .header h1 {
          color: #4CAF50;
          margin: 0;
        }
        .content {
          padding: 30px 0;
        }
        .content p {
          color: #555;
          font-size: 16px;
          line-height: 1.6;
        }
        .footer {
          text-align: center;
          padding-top: 20px;
          border-top: 1px solid #ddd;
          color: #999;
          font-size: 12px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>You were tagged</h1>
        </div>
        <div class="content">
          <p>Hello <strong>${userName}</strong>,</p>
          <p>${message}</p>
        </div>
        <div class="footer">
          <p>&copy; 2025 Your App. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

export const createComment = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user || !req.user._id) {
      return errorResponse(res, { status: 401, message: "Unauthorized" });
    }
    const authorId = req.user._id.toString();
    const comment = await addComment({ ...req.body, author: authorId });
    
    // الحصول على المنشور لمعرفة صاحبه
    const post = await postRepository.findById(comment.postId.toString());
    
    if (post) {
      // إرسال إشعار real-time لصاحب المنشور
      notifyNewComment(comment, post.author.toString());
    }
    
    // Send email notifications to tagged users
    if (req.body.tags && Array.isArray(req.body.tags) && req.body.tags.length > 0) {
      const taggedUsers = await userRepository.find({ _id: { $in: req.body.tags } });
      for (const user of taggedUsers) {
        if (user.email) {
          try {
            await sendEmail({
              to: user.email,
              subject: "You were tagged in a comment",
              html: getTagNotificationTemplate(user.name, `You were tagged in a comment by ${req.user.name || "someone"}. Check it out!`)
            });
          } catch (emailErr) {
            console.error(`Failed to send email to ${user.email}:`, emailErr);
          }
        }
      }
    }
    
    return createdResponse(res, comment, "Comment added");
  } catch (err) {
    return errorResponse(res, err);
  }
};

export const fetchComments = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const postId = req.params.postId;
    const comments = await getCommentsByPost(postId);
    return successResponse(res, comments, "Comments fetched");
  } catch (err) {
    return errorResponse(res, err);
  }
};

export const fetchCommentById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { commentId } = req.params;
    const comment = await getCommentById(commentId);
    if (!comment) {
      return errorResponse(res, { status: 404, message: "Comment not found" });
    }
    return successResponse(res, comment, "Comment fetched");
  } catch (err) {
    return errorResponse(res, err);
  }
};

export const fetchCommentWithReplies = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { commentId } = req.params;
    const comment = await getCommentWithReplies(commentId);
    if (!comment) {
      return errorResponse(res, { status: 404, message: "Comment not found" });
    }
    
    // Get all replies to this comment
    const replies = await commentRepository.findRepliesByComment(commentId);
    
    return successResponse(res, {
      comment,
      replies
    }, "Comment with replies fetched");
  } catch (err) {
    return errorResponse(res, err);
  }
};

export const updateCommentById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user || !req.user._id) {
      return errorResponse(res, { status: 401, message: "Unauthorized" });
    }
    const { commentId } = req.params;
    const userId = req.user._id.toString();
    
    const comment = await commentRepository.findById(commentId);
    if (!comment) {
      return errorResponse(res, { status: 404, message: "Comment not found" });
    }
    
    // Check if user is the author or admin
    if (comment.author.toString() !== userId && req.user.role !== "admin") {
      return errorResponse(res, { status: 403, message: "Not authorized to update this comment" });
    }
    
    const updatedComment = await updateComment(commentId, req.body);
    
    // Send email notifications to newly tagged users
    if (req.body.tags && Array.isArray(req.body.tags) && req.body.tags.length > 0) {
      const existingTags = comment.tags?.map(t => t.toString()) || [];
      const newTags = req.body.tags.filter((tagId: string) => !existingTags.includes(tagId));
      
      if (newTags.length > 0) {
        const taggedUsers = await userRepository.find({ _id: { $in: newTags } });
        for (const user of taggedUsers) {
          if (user.email) {
            try {
              await sendEmail({
                to: user.email,
                subject: "You were tagged in a comment",
                html: getTagNotificationTemplate(user.name, `You were tagged in a comment by ${req.user.name || "someone"}. Check it out!`)
              });
            } catch (emailErr) {
              console.error(`Failed to send email to ${user.email}:`, emailErr);
            }
          }
        }
      }
    }
    
    return successResponse(res, updatedComment, "Comment updated");
  } catch (err) {
    return errorResponse(res, err);
  }
};

export const freezeCommentById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user || req.user.role !== "admin") {
      return errorResponse(res, { status: 403, message: "Only admins can freeze comments" });
    }
    const { commentId } = req.params;
    const comment = await freezeComment(commentId);
    if (!comment) {
      return errorResponse(res, { status: 404, message: "Comment not found" });
    }
    return successResponse(res, comment, "Comment frozen");
  } catch (err) {
    return errorResponse(res, err);
  }
};

export const unfreezeCommentById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user || req.user.role !== "admin") {
      return errorResponse(res, { status: 403, message: "Only admins can unfreeze comments" });
    }
    const { commentId } = req.params;
    const comment = await unfreezeComment(commentId);
    if (!comment) {
      return errorResponse(res, { status: 404, message: "Comment not found" });
    }
    return successResponse(res, comment, "Comment unfrozen");
  } catch (err) {
    return errorResponse(res, err);
  }
};

export const deleteCommentById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user || !req.user._id) {
      return errorResponse(res, { status: 401, message: "Unauthorized" });
    }
    const { commentId } = req.params;
    const userId = req.user._id.toString();
    
    const comment = await commentRepository.findById(commentId);
    if (!comment) {
      return errorResponse(res, { status: 404, message: "Comment not found" });
    }
    
    // Check if user is the author or admin
    if (comment.author.toString() !== userId && req.user.role !== "admin") {
      return errorResponse(res, { status: 403, message: "Not authorized to delete this comment" });
    }
    
    await hardDeleteComment(commentId);
    return successResponse(res, null, "Comment deleted permanently");
  } catch (err) {
    return errorResponse(res, err);
  }
};