import { Document, HydratedDocument } from "mongoose";

export type HydratedDoc<T> = HydratedDocument<T>;

export type DocWithId<T> = T & { _id: string };
