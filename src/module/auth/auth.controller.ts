import { RequestHandler } from 'express';
import catchAsync from '../../utility/catchAsync';
import AuthServices from './auth.services';
import sendRespone from '../../utility/sendResponse';
import httpStatus from 'http-status';
import config from '../../app/config';
import sendResponse from '../../utility/sendResponse';
import { verify } from 'jsonwebtoken';
import { log } from 'console';

const loginUser: RequestHandler = catchAsync(async (req, res) => {
  console.log('login req: ', req);

  const result = await AuthServices.loginUserIntoDb(req.body.data);
  console.log(req.body?.data!);

  const { refreshToken, accessToken, user } = result;
  res.cookie('refreshToken', refreshToken, {
    secure: config.NODE_ENV === 'production',
    httpOnly: true,
  });
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Successfully Login',
    data: {
      accessToken,
      user: user,
    },
  });
});

const requestForgotPassword: RequestHandler = catchAsync(async (req, res) => {
  console.log(req.body.data?.email!);

  const result = await AuthServices.requestForgotPassword(
    req.body.data?.email!,
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'OTP sent to your email',
    data: result,
  });
});

const verifyForgotPassword: RequestHandler = catchAsync(async (req, res) => {
  const result = await AuthServices.verifyForgotPassword(req.body.data);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Password reset successfully',
    data: result,
  });
});

const updateUserPassword: RequestHandler = catchAsync(async (req, res) => {
  const result = await AuthServices.updateUserPassword(req.body.data);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Password updated successfully',
    data: result,
  });
});

const AuthController = {
  loginUser,
  requestForgotPassword,
  verifyForgotPassword,
  updateUserPassword,
};

export default AuthController;
