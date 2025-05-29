import { Types } from "mongoose";

export interface IForgotPassword {
  userId: Types.ObjectId;
  email: string;
  otp: string;
  expiresAt: Date;
}
