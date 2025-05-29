import httpStatus from 'http-status';
import AppError from '../../app/error/AppError';
import User from '../user/user.model';
import {
  TAuth,
  TUpdateUserPassword,
  TVerifyForgotPassword,
} from './auth.constant';
import config from '../../app/config';
import { jwtHelpers } from '../../app/jwtHalpers/jwtHalpers';
import ForgotPassword from './auth.model';
import bcrypt from 'bcrypt';
import { sendMail } from '../../app/mailer/sendMail';
import { emailRegex } from '../../constants/regex.constants';
import { idConverter } from '../../utility/idCoverter';
import { TSignup } from '../user/user.interface';

const loginUserIntoDb = async (payload: TSignup) => {
  // console.log(payload);

  const isUserExist = await User.findOne(
    { sub: payload.sub, email: payload.email },
    { sub: 1, password: 1, _id: 1, email: 1, role: 1 },
  );

  if (!isUserExist) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found', '');
  }

  const userId = isUserExist._id;
  console.log(userId);

  const loginUserData = await User.findById({ _id: userId });

  if (payload.password) {
    const isPasswordValid = await User.isPasswordMatched(
      payload.password,
      isUserExist.password!,
    );

    if (!isPasswordValid) {
      throw new AppError(httpStatus.FORBIDDEN, 'This Password Not Matched', '');
    }
  }

  const jwtPayload = {
    id: isUserExist.id,
    role: isUserExist.role,
    email: isUserExist.email,
  };

  const accessToken = jwtHelpers.generateToken(
    jwtPayload,
    config.jwt_access_secret as string,
    config.expires_in as string,
  );

  const refreshToken = jwtHelpers.generateToken(
    jwtPayload,
    config.jwt_refresh_secret as string,
    config.refresh_expires_in as string,
  );
  console.log('isUserExist: ', isUserExist);
  return {
    accessToken,
    refreshToken,
    user: loginUserData,
  };
};

const requestForgotPassword = async (email: string) => {
  console.log('email: ', email);

  if (!emailRegex.test(email)) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Invalid email format', '');
  }
  const user = await User.findOne({ email });
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found', '');
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  await ForgotPassword.deleteMany({ email });

  const subject = 'forgote password';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Password Reset Request</h2>
      <p>Use the following OTP to reset your password:</p>
      <h3 style="background: #f0f0f0; padding: 10px; display: inline-block;">${otp}</h3>
      <p>This code expires in 10 minutes.</p>
      <p>If you didn't request this, please ignore this email.</p>
    </div>
  `;

  try {
    await sendMail(email, subject, html);

    const result = await ForgotPassword.create({
      email,
      otp,
      expiresAt,
    });

    return {
      email: result.email,
      expiresAt: result.expiresAt,
    };
  } catch (error) {
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Failed to process password reset request',
      error as any,
    );
  }
};

const verifyForgotPassword = async (payload: TVerifyForgotPassword) => {
  const resetRecord = await ForgotPassword.findOne({
    email: payload.email,
    otp: payload.otp,
    expiresAt: { $gt: new Date() },
  });

  if (!resetRecord) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Invalid or expired OTP', '');
  }

  const user = await User.findOne({ email: payload.email });
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found', '');
  }

  const hashedPassword = await bcrypt.hash(
    payload.newPassword,
    Number(config.bcrypt_salt_rounds),
  );

  const updatedUser = await User.findOneAndUpdate(
    { email: payload.email },
    { password: hashedPassword },
    { new: true },
  ).select('-password');

  if (!updatedUser) {
    throw new AppError(httpStatus.NOT_FOUND, 'Failed to reset password', '');
  }

  await ForgotPassword.deleteOne({ _id: resetRecord._id });

  return updatedUser;
};

const updateUserPassword = async (payload: TUpdateUserPassword) => {
  const { userId, password, newPassword } = payload;
  console.log(userId);

  const userIdObject = await idConverter(userId!);
  const user = await User.findOne(
    { _id: userIdObject, isDeleted: { $ne: true } },
    { password: 1, email: 1 },
  );

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found', '');
  }

  const isPasswordValid = await User.isPasswordMatched(
    password,
    user?.password!,
  );

  if (!isPasswordValid) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      'Current password is incorrect',
      '',
    );
  }

  const hashedNewPassword = await bcrypt.hash(
    newPassword,
    Number(config.bcrypt_salt_rounds),
  );

  const updatedUser = await User.findOneAndUpdate(
    { _id: userIdObject, isDeleted: { $ne: true } },
    { password: hashedNewPassword },
    { new: true },
  ).select('-password');

  if (!updatedUser) {
    throw new AppError(httpStatus.NOT_FOUND, 'Failed to update password', '');
  }

  return updatedUser;
};

const AuthServices = {
  loginUserIntoDb,
  requestForgotPassword,
  verifyForgotPassword,
  updateUserPassword,
};

export default AuthServices;
