import { Response } from "express";
import { createPost, getAllPosts, getPostById, updatePost, freezePost, unfreezePost, hardDeletePost } from "./post.service";
import { createdResponse, successResponse, errorResponse } from "../../utils/response";
import { AuthenticatedRequest } from "../auth/auth.middleware";
import postRepository from "./post.repository";
import userRepository from "../user/user.repository";
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

export const addPost = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user || !req.user._id) {
      return errorResponse(res, { status: 401, message: "Unauthorized" });
    }
    const authorId = req.user._id.toString();
    const post = await createPost({ ...req.body, author: authorId });
    
    // Send email notifications to tagged users
    if (req.body.tags && Array.isArray(req.body.tags) && req.body.tags.length > 0) {
      const taggedUsers = await userRepository.find({ _id: { $in: req.body.tags } });
      for (const user of taggedUsers) {
        if (user.email) {
          try {
            await sendEmail({
              to: user.email,
              subject: "You were tagged in a post",
              html: getTagNotificationTemplate(user.name, `You were tagged in a post by ${req.user.name || "someone"}. Check it out!`)
            });
          } catch (emailErr) {
            console.error(`Failed to send email to ${user.email}:`, emailErr);
          }
        }
      }
    }
    
    return createdResponse(res, post, "Post created");
  } catch (err) {
    return errorResponse(res, err);
  }
};

export const fetchPosts = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const posts = await getAllPosts();
    return successResponse(res, posts, "Posts fetched");
  } catch (err) {
    return errorResponse(res, err);
  }
};

export const fetchPostById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { postId } = req.params;
    const post = await getPostById(postId);
    if (!post) {
      return errorResponse(res, { status: 404, message: "Post not found" });
    }
    return successResponse(res, post, "Post fetched");
  } catch (err) {
    return errorResponse(res, err);
  }
};

export const updatePostById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user || !req.user._id) {
      return errorResponse(res, { status: 401, message: "Unauthorized" });
    }
    const { postId } = req.params;
    const userId = req.user._id.toString();
    
    const post = await postRepository.findById(postId);
    if (!post) {
      return errorResponse(res, { status: 404, message: "Post not found" });
    }
    
    // Check if user is the author or admin
    if (post.author.toString() !== userId && req.user.role !== "admin") {
      return errorResponse(res, { status: 403, message: "Not authorized to update this post" });
    }
    
    const updatedPost = await updatePost(postId, req.body);
    
    // Send email notifications to newly tagged users
    if (req.body.tags && Array.isArray(req.body.tags) && req.body.tags.length > 0) {
      const existingTags = post.tags?.map(t => t.toString()) || [];
      const newTags = req.body.tags.filter((tagId: string) => !existingTags.includes(tagId));
      
      if (newTags.length > 0) {
        const taggedUsers = await userRepository.find({ _id: { $in: newTags } });
        for (const user of taggedUsers) {
          if (user.email) {
            try {
            await sendEmail({
              to: user.email,
              subject: "You were tagged in a post",
              html: getTagNotificationTemplate(user.name, `You were tagged in a post by ${req.user.name || "someone"}. Check it out!`)
            });
            } catch (emailErr) {
              console.error(`Failed to send email to ${user.email}:`, emailErr);
            }
          }
        }
      }
    }
    
    return successResponse(res, updatedPost, "Post updated");
  } catch (err) {
    return errorResponse(res, err);
  }
};

export const freezePostById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user || req.user.role !== "admin") {
      return errorResponse(res, { status: 403, message: "Only admins can freeze posts" });
    }
    const { postId } = req.params;
    const post = await freezePost(postId);
    if (!post) {
      return errorResponse(res, { status: 404, message: "Post not found" });
    }
    return successResponse(res, post, "Post frozen");
  } catch (err) {
    return errorResponse(res, err);
  }
};

export const unfreezePostById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user || req.user.role !== "admin") {
      return errorResponse(res, { status: 403, message: "Only admins can unfreeze posts" });
    }
    const { postId } = req.params;
    const post = await unfreezePost(postId);
    if (!post) {
      return errorResponse(res, { status: 404, message: "Post not found" });
    }
    return successResponse(res, post, "Post unfrozen");
  } catch (err) {
    return errorResponse(res, err);
  }
};

export const deletePostById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user || !req.user._id) {
      return errorResponse(res, { status: 401, message: "Unauthorized" });
    }
    const { postId } = req.params;
    const userId = req.user._id.toString();
    
    const post = await postRepository.findById(postId);
    if (!post) {
      return errorResponse(res, { status: 404, message: "Post not found" });
    }
    
    // Check if user is the author or admin
    if (post.author.toString() !== userId && req.user.role !== "admin") {
      return errorResponse(res, { status: 403, message: "Not authorized to delete this post" });
    }
    
    await hardDeletePost(postId);
    return successResponse(res, null, "Post deleted permanently");
  } catch (err) {
    return errorResponse(res, err);
  }
};
