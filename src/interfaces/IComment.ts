export interface IComment {
  postId: string;
  author: string; // user id
  content: string;
  parentComment?: string; // comment id for replies
  isFrozen?: boolean;
  tags?: string[]; // user ids
  createdAt?: Date;
}
