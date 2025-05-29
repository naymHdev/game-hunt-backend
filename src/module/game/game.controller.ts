import { RequestHandlerWithFiles } from '../../types/express';
import catchAsync from '../../utility/catchAsync';
import GameServices from './game.services';
import httpStatus from 'http-status';
import sendResponse from '../../utility/sendResponse';
import AppError from '../../app/error/AppError';
import { RequestHandler } from 'express';
import { USER_ROLE } from '../user/user.constant';

const createNewGame: RequestHandlerWithFiles = catchAsync(async (req, res) => {
  console.log('GameController.createNewGame - Inputs:', {
    body: req.body,
    files: req.files,
    user: req.user,
    headers: req.headers,
  });

  if (!req.user) {
    throw new AppError(httpStatus.UNAUTHORIZED, 'User not authenticated', '');
  }

  // const userId =
  //   req.body.data &&
  //   (typeof req.body.data === 'string'
  //     ? JSON.parse(req.body.data).userId
  //     : req.body.data?.userId);

  const userId = req.user?._id!;
  console.log('userId: ', userId.toString());

  if (!userId) {
    throw new AppError(httpStatus.BAD_REQUEST, 'User ID is required', '');
  }

  const result = await GameServices.createNewGameIntoDb(
    req,
    userId.toString()!,
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: 'successfully created game',
    data: result,
  });
});

const getAllGame: RequestHandler = catchAsync(async (req, res) => {
  const result = await GameServices.getAllGameIntoDb(req.query, true);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Successfully retrieved all games',
    data: result,
  });
});

const getAllGamebyAdmin: RequestHandler = catchAsync(async (req, res) => {
  const result = await GameServices.getAllGameIntoDb(req.query, false);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Successfully retrieved all games',
    data: result,
  });
});

const getAllApproveGame: RequestHandler = catchAsync(async (req, res) => {
  // if (!req.user) {
  //   throw new AppError(
  //     httpStatus.UNAUTHORIZED,
  //     'Accessor is not authenticated',
  //     '',
  //   );
  // }

  // let result;

  // if (req.user?.role === USER_ROLE.ADMIN) {
  //   result = await GameServices.getAllGameIntoDb(req.query, false);
  // } else {
  //   result = await GameServices.getAllGameIntoDb(req.query, true);
  // }

  const result = await GameServices.getAllApproveGameIntoDb(req.query, true);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Successfully retrieved all approved games',
    data: result,
  });
});

const getUpcomingGame: RequestHandler = catchAsync(async (req, res) => {
  // if (!req.user) {
  //   throw new AppError(
  //     httpStatus.UNAUTHORIZED,
  //     'Accessor is not authenticated',
  //     '',
  //   );
  // }
  const result = await GameServices.getUpcomingGame(req.query);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Successfully retrieved upcoming games',
    data: result,
  });
});

const getSimilarGame: RequestHandler = catchAsync(async (req, res) => {
  // if (!req.user) {
  //   throw new AppError(
  //     httpStatus.UNAUTHORIZED,
  //     'Accessor is not authenticated',
  //     '',
  //   );
  // }
  const result = await GameServices.getSimilarGame(req.query);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Successfully retrieved similar games',
    data: result,
  });
});

const addComment: RequestHandler = catchAsync(async (req, res) => {
  // console.log(req.body.body);
  // console.log(req.user);

  const result = await GameServices.userComment(req.body.data, req.user?._id!);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Successfully added comment',
    data: result,
  });
});

const addCommentUpvote: RequestHandler = catchAsync(async (req, res) => {
  console.log('add comment upvote: ', req.body);
  // console.log(req.user);

  const result = await GameServices.userCommentUpvote(
    req.body.data,
    req.user?._id!,
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Successfully upvoted this comment',
    data: result,
  });
});
const addGameUpvote: RequestHandler = catchAsync(async (req, res) => {
  console.log('add game upvote: ', req.body);
  // console.log(req.user);

  const result = await GameServices.userGameUpvote(
    req.body.data,
    req.user?._id!,
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Successfully upvoted this game',
    data: result,
  });
});

const addShare: RequestHandler = catchAsync(async (req, res) => {
  const result = await GameServices.userShare(req.body.data, req.user?._id!);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Successfully shared game',
    data: result,
  });
});

const getTopGameOfDay: RequestHandler = catchAsync(async (req, res) => {
  const result = await GameServices.getTopGameOfDay(req.query);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Successfully retrieved top games of the day',
    data: result,
  });
});

const getTopGameOfWeek: RequestHandler = catchAsync(async (req, res) => {
  const result = await GameServices.getTopGameOfWeek(req.query);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Successfully retrieved top games of the week',
    data: result,
  });
});

const updateGame: RequestHandlerWithFiles = catchAsync(async (req, res) => {
  console.log('GameController.createNewGame - Inputs:', {
    body: req.body,
    files: req.files,
    user: req.user,
    headers: req.headers,
  });
  // const files = Array.isArray(req.files)
  //   ? req.files
  //   : req.files && 'media_files' in req.files
  //     ? req.files['media_files']
  //     : undefined;

  if (!req.user) {
    throw new AppError(httpStatus.UNAUTHORIZED, 'User not authenticated', '');
  }

  const result = await GameServices.updateGameIntoDb(
    req.user?._id!,
    req.body,
    req.files as { [fieldname: string]: Express.Multer.File[] },
  );
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Game update submitted for approval',
    data: result,
  });
});

const updateLinkType: RequestHandlerWithFiles = catchAsync(async (req, res) => {
  console.log('GameController.createNewGame - Inputs:', {
    body: req.body,
    files: req.files,
    user: req.user,
    headers: req.headers,
  });
  const result = await GameServices.updateLinkTypeIntoDb(req.body.data);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Linktype updated successfully',
    data: result,
  });
});
const searchGame: RequestHandler = catchAsync(async (req, res) => {
  if (!req.query) {
    throw new AppError(
      httpStatus.UNAUTHORIZED,
      'Search query can not be empty string',
      '',
    );
  }
  console.log(req.query);

  const result = await GameServices.searchGameIntoDb(req.query);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Successfully retrieved searched games',
    data: result,
  });
});

const singleGame = catchAsync(async (req, res) => {
  const result = await GameServices.getSingleGameIntoDb(req.params.id);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Successfully retrieved game',
    data: result,
  });
});

const GameController = {
  createNewGame,
  getAllGame,
  getAllGamebyAdmin,
  getAllApproveGame,
  getUpcomingGame,
  getSimilarGame,
  addComment,
  addCommentUpvote,
  addGameUpvote,
  addShare,
  getTopGameOfDay,
  getTopGameOfWeek,
  updateGame,
  updateLinkType,
  searchGame,
  singleGame,
};

export default GameController;
