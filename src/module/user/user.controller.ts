import { RequestHandler } from 'express';
import catchAsync from '../../utility/catchAsync';
import UserServices from './user.services';
import sendResponse from '../../utility/sendResponse';
import httpStatus from 'http-status';
import AppError from '../../app/error/AppError';
import { IUserUpdate } from './user.interface';
import GameServices from '../game/game.services';
import AuthServices from '../auth/auth.services';

const createUser: RequestHandler = catchAsync(async (req, res) => {
  // console.log("login req: ",req.body);
  const { user, existed } = await UserServices.createUserIntoDb(req.body.data);
  const loginResult = await AuthServices.loginUserIntoDb({
    sub: user.sub,
    name: user.name!,
    email: user.email,
    password: req.body.data.password,
  });
  sendResponse(res, {
    success: true,
    statusCode: existed ? httpStatus.OK : httpStatus.CREATED,
    message: existed
      ? 'User already exists, logged in successfully'
      : 'User created and logged in successfully',
    data: loginResult,
  });
});

const findAllUser: RequestHandler = catchAsync(async (req, res) => {
  const result = await UserServices.findAllUserIntoDb(req.query);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'successfully find all user',
    data: result,
  });
});

const userProfile: RequestHandler = catchAsync(async (req, res) => {
  console.log('userId', typeof req.user?._id);
  const result = await UserServices.userProfile(req.user?._id!);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'successfully user profile',
    data: result,
  });
});

const updateProfileUser: RequestHandler = catchAsync(async (req, res) => {
  if (!req.user || !req.user?._id!) {
    throw new AppError(httpStatus.UNAUTHORIZED, 'User not authenticated', '');
  }
  // console.log(req.body);
  console.log('userId', req.user?.id);

  // const payload: IUserUpdate = {
  //   name: req.body.name,
  //   bio: req.body.bio,
  //   links,
  // };
  const files = req.files as
    | { [fieldname: string]: Express.Multer.File[] }
    | undefined;

  const photoImageFile = files?.photo ? files.photo[0] : undefined;
  const result = await UserServices.updateUserProfileIntoDb(
    req.user?._id!,
    req.body.data,
    photoImageFile,
  );
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'successfully sent to admin for updating user profile',
    data: result,
  });
});

const submitProfileUpdate: RequestHandler = catchAsync(async (req, res) => {
  const result = await UserServices.submitProfileUpdate(
    req.body.userId,
    req.body,
  );
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Profile update submitted for approval',
    data: result,
  });
});

const deleteUserProfile: RequestHandler = catchAsync(async (req, res) => {
  const result = await UserServices.deleteUserIntoDb(
    req.body.data.userId,
    req.user?._id!,
  );
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'successfully delete user',
    data: result,
  });
});

const deleteGame: RequestHandler = catchAsync(async (req, res) => {
  const result = await UserServices.deleteGameIntoDb(
    req.body.data?.gameId,
    req.user?._id!,
  );
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'successfully delete game',
    data: result,
  });
});

const UserController = {
  createUser,
  findAllUser,
  userProfile,
  deleteUserProfile,
  deleteGame,
  updateProfileUser,
  submitProfileUpdate,
};

export default UserController;
