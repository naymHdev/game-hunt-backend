import { RequestWithFiles } from '../../types/express';
import httpStatus from 'http-status';
import AppError from '../../app/error/AppError';
import games from './game.model';
import QueryBuilder from '../../app/builder/QueryBuilder';
import User from '../user/user.model';
import {
  CommentPayload,
  CommentUpvotePayload,
  GameUpvotePayload,
  SharePayload,
  TGameUpdate,
  TopGameQuery,
  updateLinkPayload,
} from './game.type';
import { startOfDay, startOfWeek, endOfDay, endOfWeek } from 'date-fns';
import PendingGameUpdate from './gameUpdate.model';
import { GameInterface, IPendingGameUpdate, Upvote } from './game.interface';
import mongoose from 'mongoose';
import MediaUrl from '../../utility/game.media';
import { idConverter } from '../../utility/idCoverter';
import Game from './game.model';
import { uploadFileToBunny } from '../../utility/bunny_cdn';
import fs from 'fs/promises';

const createNewGameIntoDb = async (req: RequestWithFiles, userId: string) => {
  console.log('createNewGameIntoDb - Request Details:', {
    body: req.body,
    files: req.files,
    userId,
    headers: req.headers,
  });
  const userIdObject = await idConverter(userId);
  const { data, image } = req.body;
  console.log(image);

  if (!data) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Data object is missing', '');
  }
  if (!data.title) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Game title is required', '');
  }
  if (!data.categories || !data.categories.length) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Categories are required', '');
  }

  const files = req.files as { [fieldname: string]: Express.Multer.File[] };
  const imageFiles = files['image'] || [];
  const thumbnailFile = files['thumbnail'] ? files['thumbnail'][0] : null;

  const mediaFiles = await Promise.all(
    imageFiles.map(async (file) => {
      const remotePath = `${Date.now()}-${file.originalname}`;
      return await uploadFileToBunny(file.path, remotePath);
    }),
  );

  let thumbnail;
  if (thumbnailFile) {
    const remotePath = `${Date.now()}-${thumbnailFile.originalname}`;
    thumbnail = await uploadFileToBunny(thumbnailFile.path, remotePath);
    await fs.unlink(thumbnailFile.path);
  }

  const user = await User.findById(userIdObject).where({
    isDeleted: { $ne: true },
  });
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found', '');
  }

  const gameData: GameInterface = {
    userId: userIdObject,
    userName: data.userName || 'Unknown',
    title: data.title,
    subTitle: data.subTitle || '',
    description: data.description || '',
    image: mediaFiles.length > 0 ? mediaFiles : image?.images || [],
    thumbnail: thumbnail!,
    categories: data.categories,
    platform: data.platform || [],
    price: data.price ? parseFloat(data.price) : 0,
    socialLinks: data.socialLinks || [],
    gameStatus: data.gameStatus,
    upcomingDate: data.upcomingDate,
    // comments: [],
    // totalComments: 0,
    // shares: [],
    // totalShare: 0,
    // upvote: data.upvote,
    // totalUpvote: data.totalUpvote,
    // isApproved: false,
    // isDelete: false,
  };

  // const gameData: GameInterface = {
  //   userId: userId,
  //   gameId: payload.gameId,
  //   game_title: payload.game_title,
  //   category: payload.category,
  //   description: payload.description || '',
  //   price: payload.price,
  //   steam_link: payload.steam_link || '',
  //   x_link: payload.x_link || '',
  //   linkedin_link: payload.linkedin_link || '',
  //   reddit_link: payload.reddit_link || '',
  //   instagram_link: payload.instagram_link || '',
  //   media_files: mediaFiles,
  //   comments: [],
  //   totalComments: 0,
  //   shares: [],
  //   totalShare: 0,
  //   isApproved: false,
  //   isDelete: false,
  // };

  const result = await Game.create(gameData);
  return result;
};

const getAllGameIntoDb = async (
  query: Record<string, unknown>,
  isApproved: boolean,
) => {
  try {
    // if (!Object.values(USER_ROLE).includes(role)) {
    //   throw new AppError(httpStatus.FORBIDDEN, 'Invalid user role', '');
    // }
    const baseQuery = Game.find().populate('userId');
    if (isApproved === true) {
      baseQuery.where({ isApproved: isApproved });
    }
    // if (role !== USER_ROLE.ADMIN) {
    //   baseQuery.where({ isApproved: true });
    // }

    const gameQuery = new QueryBuilder(baseQuery, query)
      .search(['title', 'description'])
      .filter()
      .sort()
      .pagination()
      .fields();

    const allGames = await gameQuery.modelQuery;
    const meta = await gameQuery.countTotal();

    return { meta, allGames };
  } catch (error: any) {
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      error.message || 'Failed to retrieve games',
      '',
    );
  }
};

const getAllApproveGameIntoDb = async (
  query: Record<string, unknown>,
  isApproved: boolean,
) => {
  try {
    // if (!Object.values(USER_ROLE).includes(role)) {
    //   throw new AppError(httpStatus.FORBIDDEN, 'Invalid user role', '');
    // }
    const baseQuery = Game.find();
    if (isApproved === true) {
      baseQuery.where({ isApproved: isApproved, gameStatus: 'active' });
    }
    // if (role !== USER_ROLE.ADMIN) {
    //   baseQuery.where({ isApproved: true });
    // }

    const gameQuery = new QueryBuilder(baseQuery, query)
      .search(['title', 'description'])
      .filter()
      .sort()
      .pagination()
      .fields();

    const allGames = await gameQuery.modelQuery;
    const meta = await gameQuery.countTotal();

    return { meta, allGames };
  } catch (error: any) {
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      error.message || 'Failed to retrieve games',
      '',
    );
  }
};
const getUpcomingGame = async (
  query: Record<string, unknown>,
  // role: UserRole,
) => {
  try {
    console.log('query: ', query);
    // if (!Object.values(USER_ROLE).includes(role)) {
    //   throw new AppError(httpStatus.FORBIDDEN, 'Invalid user role', '');
    // }

    const filter: Record<string, any> = {
      gameStatus: 'upcoming',
      isApproved: true,
    };
    // if (role !== USER_ROLE.ADMIN) {
    //   filter.isApproved = true;
    // }

    const baseQuery = Game.find(filter);

    // if (role !== USER_ROLE.ADMIN) {
    //   baseQuery.where({ isApproved: true });
    // }

    const gameQuery = new QueryBuilder(baseQuery, query)
      .search(['title', 'description'])
      .filter()
      .sort()
      .pagination()
      .fields();

    const allGames = await gameQuery.modelQuery;
    const meta = await gameQuery.countTotal();

    return { meta, allGames };
  } catch (error: any) {
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      error.message || 'Failed to retrieve games',
      '',
    );
  }
};

const getSimilarGame = async (
  query: Record<string, unknown>,
  // role: UserRole,
) => {
  try {
    console.log('query: ', query);
    const { gameId } = query;
    const gameIdObject = await idConverter(gameId as string);

    console.log('gameId: ', gameIdObject);

    if (!gameId) {
      throw new AppError(httpStatus.NOT_FOUND, 'GameId is required', '');
    }

    // if (!Object.values(USER_ROLE).includes(role)) {
    //   throw new AppError(httpStatus.FORBIDDEN, 'Invalid user role', '');
    // }

    const currentGame = await games.findById(gameIdObject!);
    if (!currentGame) {
      throw new AppError(httpStatus.NOT_FOUND, 'Game not found', '');
    }

    const price = currentGame.price || 0;
    const lowerBound = price * 0.8;
    const upperBound = price * 1.2;

    const filter: Record<string, any> = {
      _id: { $ne: gameIdObject },
      // gameStatus: 'active',
      price: { $gte: lowerBound, $lte: upperBound },
      $or: [
        { title: currentGame.title },
        { subTitle: currentGame.subTitle },
        { type: currentGame.platform },
        { category: currentGame.categories },
        { isApproved: true },
      ],
    };

    // if (role !== USER_ROLE.ADMIN) {
    //   filter.isApproved = true;
    // }
    const baseQuery = games.find(filter).populate('gameId');

    // if (role !== USER_ROLE.ADMIN) {
    //   baseQuery.where({ isApproved: true });
    // }

    const gameQuery = new QueryBuilder(baseQuery, query)
      .search(['title', 'description'])
      .filter()
      .sort()
      .pagination()
      .fields();

    const allGames = await gameQuery.modelQuery;
    const meta = await gameQuery.countTotal();

    return { meta, allGames };
  } catch (error: any) {
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      error.message || 'Failed to retrieve games',
      '',
    );
  }
};

const userComment = async (payload: CommentPayload, userId: string) => {
  try {
    const { gameId, comment } = payload;
    // console.log(userId);
    if (!gameId || !comment) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'Game ID and comment are required',
        '',
      );
    }
    const user = await User.findById(userId).where({
      isDeleted: { $ne: true },
    });
    if (!user) {
      throw new AppError(httpStatus.NOT_FOUND, 'User not found', '');
    }

    const game = await Game.findById(gameId).where({ isDelete: { $ne: true } });
    if (!game) {
      throw new AppError(
        httpStatus.NOT_FOUND,
        'Game not found or is deleted',
        '',
      );
    }
    const commentData = {
      userId: new mongoose.Types.ObjectId(userId),
      comment: payload.comment,
      commentTime: new Date(),
      upvote: [],
      totalUpvote: 0,
      report: [],
      createdAt: new Date(),
    };

    const updatedGame = await Game.findByIdAndUpdate(
      payload.gameId,
      {
        $push: { comments: commentData },
        $inc: { totalComments: 1 },
      },
      { new: true, runValidators: true },
    ).populate('userId');

    if (!updatedGame) {
      throw new AppError(httpStatus.NOT_FOUND, 'Failed to add comment', '');
    }

    return updatedGame;
  } catch (error: any) {
    throw new AppError(
      error.statusCode || httpStatus.INTERNAL_SERVER_ERROR,
      error.message || 'Failed to add comment',
      '',
    );
  }
};

const userCommentUpvote = async (
  payload: CommentUpvotePayload,
  userId: string,
) => {
  try {
    if (!payload.gameId || !payload.commentId) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'Game ID and comment ID are required',
        '',
      );
    }

    const user = await User.findById(userId).where({
      isDeleted: { $ne: true },
    });
    if (!user) {
      throw new AppError(httpStatus.NOT_FOUND, 'User not found', '');
    }

    const game = await Game.findById(payload.gameId).where({
      isDelete: { $ne: true },
    });
    if (!game) {
      throw new AppError(
        httpStatus.NOT_FOUND,
        'Game not found or is deleted',
        '',
      );
    }

    const comment = game.comments?.find((c) =>
      c._id?.equals(payload.commentId),
    );
    if (!comment) {
      throw new AppError(httpStatus.NOT_FOUND, 'Comment not found', '');
    }

    const alreadyUpvoted = comment.upvote.some((vote) =>
      vote.userId.equals(userId),
    );
    if (alreadyUpvoted) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'User has already upvoted this comment',
        '',
      );
    }

    const updatedGame = await Game.findOneAndUpdate(
      {
        _id: payload.gameId,
        'comments._id': payload.commentId,
        isDelete: { $ne: true },
      },
      {
        $push: {
          'comments.$.upvote': {
            userId: new mongoose.Types.ObjectId(userId),
            createdAt: new Date(),
          },
        },
        $inc: { 'comments.$.totalUpvote': 1 },
      },
      { new: true, runValidators: true },
    ).populate('userId');

    if (!updatedGame) {
      throw new AppError(httpStatus.NOT_FOUND, 'Failed to upvote comment', '');
    }

    return updatedGame;
  } catch (error: any) {
    console.error('Error in userCommentUpvote:', error);
    throw new AppError(
      error.statusCode || httpStatus.INTERNAL_SERVER_ERROR,
      error.message || 'Failed to upvote comment',
      '',
    );
  }
};
const userGameUpvote = async (payload: GameUpvotePayload, userId: string) => {
  try {
    if (!payload.gameId) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Game ID are required', '');
    }

    const userIdObject = await idConverter(userId);
    const gameIdObject = await idConverter(payload.gameId);

    const user = await User.findById(userIdObject).where({
      isDeleted: { $ne: true },
    });
    if (!user) {
      throw new AppError(httpStatus.NOT_FOUND, 'User not found', '');
    }

    const game = await Game.findById(gameIdObject).where({
      isDelete: { $ne: true },
    });
    if (!game) {
      throw new AppError(
        httpStatus.NOT_FOUND,
        'Game not found or is deleted',
        '',
      );
    }

    const alreadyUpvoted = game.upvote?.some((vote) =>
      vote.userId.equals(userIdObject),
    );
    if (alreadyUpvoted) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'User has already upvoted this comment',
        '',
      );
    }

    const updatedGame = await Game.findOneAndUpdate(
      {
        _id: gameIdObject,
        isDelete: { $ne: true },
      },
      {
        $push: {
          upvote: {
            userId: userIdObject,
            createdAt: new Date(),
          },
        },
        $inc: { totalUpvote: 1 },
      },
      { new: true, runValidators: true },
    ).populate('userId');

    if (!updatedGame) {
      throw new AppError(httpStatus.NOT_FOUND, 'Failed to upvote game', '');
    }

    return updatedGame;
  } catch (error: any) {
    console.error('Error in game tUpvote:', error);
    throw new AppError(
      error.statusCode || httpStatus.INTERNAL_SERVER_ERROR,
      error.message || 'Failed to upvote game',
      '',
    );
  }
};

const userShare = async (payload: SharePayload, userId: string) => {
  try {
    const { gameId } = payload;

    const user = await User.findById(userId).where({
      isDeleted: { $ne: true },
    });
    if (!user) {
      throw new AppError(httpStatus.NOT_FOUND, 'User not found', '');
    }

    const game = await Game.findById(gameId).where({ isDelete: { $ne: true } });
    if (!game) {
      throw new AppError(
        httpStatus.NOT_FOUND,
        'Game not found or is deleted',
        '',
      );
    }

    const alreadyShared = game?.shares?.some((share) =>
      share.userId.equals(userId),
    );
    if (alreadyShared) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'User has already shared this game',
        '',
      );
    }

    const updatedGame = await games
      .findByIdAndUpdate(
        gameId,
        {
          $push: {
            shares: { userId },
          },
          $inc: {
            totalShare: 1,
          },
        },
        { new: true, runValidators: true },
      )
      .where({ isDelete: { $ne: true } })
      .populate('userId');

    if (!updatedGame) {
      throw new AppError(httpStatus.NOT_FOUND, 'Failed to add share', '');
    }

    return updatedGame;
  } catch (error: any) {
    throw new AppError(
      error.statusCode || httpStatus.INTERNAL_SERVER_ERROR,
      error.message || 'Failed to add share',
      '',
    );
  }
};

export const getTopGameOfDay = async (query: TopGameQuery) => {
  try {
    const start = startOfDay(new Date());
    const end = endOfDay(new Date());

    const topGames = await Game.aggregate([
      {
        $match: {
          isDelete: { $ne: true },
          isApproved: true,
        },
      },
      {
        $addFields: {
          todayComments: {
            $size: {
              $filter: {
                input: { $ifNull: ['$comments', []] },
                as: 'comment',
                cond: {
                  $and: [
                    { $gte: ['$$comment.createdAt', start] },
                    { $lte: ['$$comment.createdAt', end] },
                  ],
                },
              },
            },
          },
          todayShares: {
            $size: {
              $filter: {
                input: { $ifNull: ['$shares', []] },
                as: 'share',
                cond: {
                  $and: [
                    { $gte: ['$$share.createdAt', start] },
                    { $lte: ['$$share.createdAt', end] },
                  ],
                },
              },
            },
          },
          todayUpvotes: {
            $size: {
              $filter: {
                input: { $ifNull: ['$upvote', []] },
                as: 'vote',
                cond: {
                  $and: [
                    { $gte: ['$$vote.createdAt', start] },
                    { $lte: ['$$vote.createdAt', end] },
                  ],
                },
              },
            },
          },
        },
      },
      {
        $addFields: {
          popularityScore: {
            $add: ['$todayComments', '$todayShares', '$todayUpvotes'],
          },
        },
      },
      { $sort: { popularityScore: -1 } },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'userId',
        },
      },
      { $unwind: '$userId' },
    ]);
    return topGames;
  } catch (error: any) {
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      error.message || 'Failed to retrieve top games of the day',
      '',
    );
  }
};

export const getTopGameOfWeek = async (query: TopGameQuery) => {
  try {
    const start = startOfWeek(new Date(), { weekStartsOn: 1 });
    const end = endOfWeek(new Date(), { weekStartsOn: 1 });

    const topGames = await games.aggregate([
      {
        $match: {
          isDelete: { $ne: true },
          isApproved: true,
        },
      },
      {
        $addFields: {
          weekComments: {
            $size: {
              $filter: {
                input: { $ifNull: ['$comments', []] }, // Handle null values
                as: 'comment',
                cond: {
                  $and: [
                    { $gte: ['$$comment.createdAt', start] },
                    { $lte: ['$$comment.createdAt', end] },
                  ],
                },
              },
            },
          },
          weekShares: {
            $size: {
              $filter: {
                input: { $ifNull: ['$shares', []] }, // Handle null values
                as: 'share',
                cond: {
                  $and: [
                    { $gte: ['$$share.createdAt', start] },
                    { $lte: ['$$share.createdAt', end] },
                  ],
                },
              },
            },
          },
          weekUpvotes: {
            $size: {
              $filter: {
                input: { $ifNull: ['$upvote', []] }, // Handle null values
                as: 'vote',
                cond: {
                  $and: [
                    { $gte: ['$$vote.createdAt', start] },
                    { $lte: ['$$vote.createdAt', end] },
                  ],
                },
              },
            },
          },
        },
      },
      {
        $addFields: {
          popularityScore: {
            $add: ['$weekComments', '$weekShares', '$weekUpvotes'],
          },
        },
      },
      { $sort: { popularityScore: -1 } },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'userId',
        },
      },
      { $unwind: '$userId' },
    ]);

    return topGames;
  } catch (error: any) {
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      error.message || 'Failed to retrieve top games of the week',
      '',
    );
  }
};

const updateGameIntoDb = async (
  userId: string,
  payload: TGameUpdate,
  files?: { [fieldname: string]: Express.Multer.File[] },
) => {
  const { data, image } = payload;
  const dataGameId = await idConverter(data.gameId);
  const dataUserId = await idConverter(userId);
  console.log('update game payload: ', payload);

  if (!dataUserId) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      'Provided user ID does not match authenticated user',
      '',
    );
  }

  if (!mongoose.isValidObjectId(dataGameId)) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Invalid game ID', '');
  }

  const game = await Game.findById(dataGameId).where({
    isDelete: { $ne: true },
  });
  if (!game) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      'Game not found or is deleted',
      '',
    );
  }
  console.log('userId type: ', userId);

  console.log('userId type: ', game.userId);

  if (game.userId.toString() !== userId.toString()) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      'You can only update your own games',
      '',
    );
  }

  const existingUpdate = await PendingGameUpdate.findOne({
    gameId: dataGameId,
    userId: dataUserId,
    status: 'pending',
  });
  if (existingUpdate) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'You already have a pending game update',
      '',
    );
  }

  const imageFiles = files?.['image'] || [];
  const thumbnailFile = files?.['thumbnail'] ? files['thumbnail'][0] : null;

  // const mediaFiles = imageFiles.map((file) =>
  //   MediaUrl.gameMediaUrl(file.path, userId, 'image'),
  // );

  const mediaFiles = await Promise.all(
    imageFiles.map(async (file) => {
      const remotePath = `${Date.now()}-${file.originalname}`;
      return await uploadFileToBunny(file.path, remotePath);
    }),
  );

  // const thumbnail = thumbnailFile
  //   ? MediaUrl.gameMediaUrl(thumbnailFile.path, userId, 'thumbnails')
  //   : image?.thumbnail || '';

  let thumbnail;
  if (thumbnailFile) {
    const remotePath = `${Date.now()}-${thumbnailFile.originalname}`;
    thumbnail = await uploadFileToBunny(thumbnailFile.path, remotePath);
    await fs.unlink(thumbnailFile.path);
  }

  const pendingUpdateData: Partial<IPendingGameUpdate> = {
    gameId: dataGameId,
    userId: dataUserId,
    title: data.title,
    subTitle: data.subTitle,
    description: data.description,
    image: mediaFiles.length > 0 ? mediaFiles : image?.images || [],
    thumbnail: thumbnail,
    categories: data.categories,
    platform: data.platform,
    price: data.price,
    socialLinks: data.socialLinks,
    gameStatus: data.gameStatus,
    upcomingDate: data.upcomingDate ? new Date(data.upcomingDate) : undefined,
    status: 'pending',
    submittedAt: new Date(),
  };

  const pendingUpdate = await PendingGameUpdate.create(pendingUpdateData);
  return pendingUpdate;
};

const updateLinkTypeIntoDb = async (payload: updateLinkPayload) => {
  const dataGameId = await idConverter(payload.gameId);

  if (!dataGameId) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Invalid game ID', '');
  }

  const game = await Game.findById(dataGameId).where({
    isDelete: { $ne: true },
  });
  if (!game) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      'Game not found or is deleted',
      '',
    );
  }
  const updatedGame = await Game.findByIdAndUpdate(
    dataGameId,
    { $set: { linkType: payload.linkType } },
    { new: true, runValidators: true },
  );
  if (!updatedGame) {
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Failed to update link type',
      '',
    );
  }

  return updatedGame;
};

const searchGameIntoDb = async (query: Record<string, unknown>) => {
  console.log('query: ', query);
  if (!query) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Search term is required', '');
  }

  const { searchTerm } = query;

  const games = await Game.find({
    isApproved: true,
    isDelete: false,
    $or: [
      { title: { $regex: searchTerm, $options: 'i' } },
      { subtitle: { $regex: searchTerm, $options: 'i' } },
    ],
  });

  return games;
};

const GameServices = {
  createNewGameIntoDb,
  getAllGameIntoDb,
  getAllApproveGameIntoDb,
  getUpcomingGame,
  getSimilarGame,
  userComment,
  userCommentUpvote,
  userGameUpvote,
  userShare,
  getTopGameOfDay,
  getTopGameOfWeek,
  updateGameIntoDb,
  updateLinkTypeIntoDb,
  searchGameIntoDb,
};

export default GameServices;
