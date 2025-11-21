import postRepository from "./post.repository";
import { CreatePostDTO, UpdatePostDTO } from "./post.dto";

export const createPost = async (dto: CreatePostDTO) => {
  return await postRepository.create(dto as any);
};

export const getAllPosts = async () => {
  return await postRepository.findAllWithAuthor();
};

export const getPostById = async (postId: string) => {
  return await postRepository.findByIdWithAuthor(postId);
};

export const getPostsByAuthor = async (authorId: string) => {
  return await postRepository.findByAuthor(authorId);
};

export const updatePost = async (postId: string, dto: UpdatePostDTO) => {
  return await postRepository.update(postId, dto as any);
};

export const freezePost = async (postId: string) => {
  return await postRepository.update(postId, { isFrozen: true } as any);
};

export const unfreezePost = async (postId: string) => {
  return await postRepository.update(postId, { isFrozen: false } as any);
};

export const hardDeletePost = async (postId: string) => {
  return await postRepository.delete(postId);
};