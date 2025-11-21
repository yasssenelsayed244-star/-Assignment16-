export interface IPost {
  author: string; // user id
  content: string;
  isFrozen?: boolean;
  tags?: string[]; // user ids
  createdAt?: Date;
}
