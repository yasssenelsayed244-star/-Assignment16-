import commentRepository from "./comment.repository";
import { CreateCommentDTO, UpdateCommentDTO } from "./comment.dto";

export const addComment = async (dto: CreateCommentDTO) => {
  return await commentRepository.create(dto as any);
};

export const getCommentsByPost = async (postId: string) => {
  return await commentRepository.findByPostWithAuthor(postId);
};

export const getCommentsByAuthor = async (authorId: string) => {
  return await commentRepository.findByAuthor(authorId);
};

export const getCommentsCountByPost = async (postId: string) => {
  return await commentRepository.countByPost(postId);
};

export const getCommentById = async (commentId: string) => {
  return await commentRepository.findByIdWithAuthor(commentId);
};

export const getCommentWithReplies = async (commentId: string) => {
  return await commentRepository.findByIdWithReplies(commentId);
};

export const updateComment = async (commentId: string, dto: UpdateCommentDTO) => {
  return await commentRepository.update(commentId, dto as any);
};

export const freezeComment = async (commentId: string) => {
  return await commentRepository.update(commentId, { isFrozen: true } as any);
};

export const unfreezeComment = async (commentId: string) => {
  return await commentRepository.update(commentId, { isFrozen: false } as any);
};

export const hardDeleteComment = async (commentId: string) => {
  return await commentRepository.delete(commentId);
};