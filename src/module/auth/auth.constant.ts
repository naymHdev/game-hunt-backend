import { Types } from 'mongoose';

export type TAdminLogin = {
  email: string,
  password: string
}
export type TAuth = {
  sub: string;
  email: string;
  password?: string;
};

export type TForgotPassword = {
  email: string;
};

export type TVerifyForgotPassword = {
  email: string;
  otp: string;
  newPassword: string;
};

export type TUpdateUserPassword = {
  userId: Types.ObjectId;
  password: string;
  newPassword: string;
};
