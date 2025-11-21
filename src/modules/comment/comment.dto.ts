export type CreateCommentDTO = {
  postId: string;
  author: string;
  content: string;
  parentComment?: string; // comment id for replies
  tags?: string[]; // user ids
};

export type UpdateCommentDTO = {
  content?: string;
  tags?: string[]; // user ids
};
