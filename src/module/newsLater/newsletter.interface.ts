import { Types } from "mongoose";

export interface INewsletter {
  // userId: Types.ObjectId
  email: string;
  isDeleted: boolean;
}
