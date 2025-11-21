export type CreatePostDTO = {
  author: string;
  content: string;
  tags?: string[]; // user ids
};

export type UpdatePostDTO = {
  content?: string;
  tags?: string[]; // user ids
};
