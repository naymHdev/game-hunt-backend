import httpStatus from 'http-status';
import AppError from '../../app/error/AppError';
import {
  approveGameType,
  TApproveGameUpdate,
  TApproveProfileUpdate,
} from './admin.types';
import PendingUserUpdate from '../user/userUpdateProfile';
import { IUser } from '../user/user.interface';
import User from '../user/user.model';
import PendingGameUpdate from '../game/gameUpdate.model';
import { GameInterface, IPendingGameUpdate } from '../game/game.interface';
import { USER_ROLE } from '../user/user.constant';
import { TAdminLogin, TAuth } from '../auth/auth.constant';
import { jwtHelpers } from '../../app/jwtHalpers/jwtHalpers';
import config from '../../app/config';
import Admin from './admin.model';
import { IAdmin } from './admin.interface';
import Game from '../game/game.model';
import { idConverter } from '../../utility/idCoverter';

const createAdminIntoDb = async (payload: IAdmin, creatorId?: string) => {
  try {
    const { name, email, password, role } = payload;

    if (role !== USER_ROLE.SUPERADMIN && role !== USER_ROLE.ADMIN) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'Role must be SUPERADMIN or ADMIN',
        '',
      );
    }

    const isExist = await Admin.findOne({
      email,
      isDeleted: { $ne: true },
    });
    if (isExist) {
      throw new AppError(httpStatus.FORBIDDEN, 'Admin already exists', '');
    }

    const existingSuperAdmin = await Admin.findOne({
      role: USER_ROLE.SUPERADMIN,
      isDeleted: { $ne: true },
    });

    if (!existingSuperAdmin) {
      if (role !== USER_ROLE.SUPERADMIN) {
        throw new AppError(
          httpStatus.FORBIDDEN,
          'First admin must be a SUPERADMIN',
          '',
        );
      }
    } else {
      if (!creatorId) {
        throw new AppError(
          httpStatus.FORBIDDEN,
          'Creator ID required when Super Admin exists',
          '',
        );
      }
      const creator = await Admin.findById(creatorId);
      if (!creator || creator.role !== USER_ROLE.SUPERADMIN) {
        throw new AppError(
          httpStatus.FORBIDDEN,
          'Only Super Admin can create admins',
          '',
        );
      }

      if (role === USER_ROLE.SUPERADMIN) {
        throw new AppError(
          httpStatus.FORBIDDEN,
          'Only one Super Admin can exist',
          '',
        );
      }
    }

    const createAdminBuilder = new Admin({ name, email, password, role });
    const result = await createAdminBuilder.save();
    return {
      status: true,
      message: 'Successfully created new admin',
      adminId: result.id.toString(),
    };
  } catch (error: any) {
    throw new AppError(
      httpStatus.SERVICE_UNAVAILABLE,
      error.message || 'Failed to create admin',
      '',
    );
  }
};

const loginAdminIntoDb = async (payload: TAdminLogin) => {
  const isAdminExist = await Admin.findOne(
    { email: payload.email },
    { password: 1, _id: 1, email: 1, role: 1 },
  );

  if (!isAdminExist) {
    throw new AppError(httpStatus.NOT_FOUND, 'Admin not found', '');
  }

  if (payload.password) {
    const isPasswordValid = await User.isPasswordMatched(
      payload.password,
      isAdminExist.password,
    );

    if (!isPasswordValid) {
      throw new AppError(httpStatus.FORBIDDEN, 'This Password Not Matched', '');
    }
  }

  const jwtPayload = {
    id: isAdminExist.id,
    role: isAdminExist.role,
    email: isAdminExist.email,
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

  return {
    accessToken,
    refreshToken,
  };
};

const approveGame = async (payload: approveGameType) => {
  const { gameId } = payload;
  const gameIdObject = await idConverter(gameId);
  console.log('gameId: ', gameIdObject);

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

  const updatedGame = await Game.findByIdAndUpdate(
    gameId,
    { $set: { isApproved: true } },
    { new: true, runValidators: true },
  ).where({ isDelete: { $ne: true } });

  if (!updatedGame) {
    throw new AppError(httpStatus.NOT_FOUND, 'Failed to update game', '');
  }

  return updatedGame;
};

const getPendingGameUpdates = async () => {
  const updates = await PendingGameUpdate.find({ status: 'pending' }).populate(
    'userId',
    'email name',
  );
  return updates;
};

const approveGameUpdate = async (
  payload: TApproveGameUpdate,
  // adminId: string,
) => {
  try {
    if (!payload.updateId) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Update ID is required', '');
    }

    const updateIdObject = await idConverter(payload.updateId!);

    if (!updateIdObject) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'Invalid update ID format',
        '',
      );
    }

    const admin = await User.findById(updateIdObject).where({
      isDeleted: { $ne: true },
      role: USER_ROLE.ADMIN,
    });
    // if (!admin) {
    //   throw new AppError(httpStatus.FORBIDDEN, 'Admin user not found', '');
    // }

    const pendingUpdate = await PendingGameUpdate.findById(updateIdObject);
    if (!pendingUpdate) {
      throw new AppError(
        httpStatus.NOT_FOUND,
        'Pending game update not found',
        '',
      );
    }

    if (pendingUpdate.status !== 'pending') {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'Game update is not in pending status',
        '',
      );
    }

    // Find game
    const game = await Game.findById(pendingUpdate.gameId).where({
      isDelete: { $ne: true },
    });
    if (!game) {
      throw new AppError(httpStatus.NOT_FOUND, 'Game not found', '');
    }

    if (!game.isApproved) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'Game must be approved before applying updates',
        '',
      );
    }

    const updateFields: Partial<GameInterface> = {};
    if (pendingUpdate.title !== undefined)
      updateFields.title = pendingUpdate.title;
    if (pendingUpdate.subTitle !== undefined)
      updateFields.subTitle = pendingUpdate.subTitle;
    if (pendingUpdate.description !== undefined)
      updateFields.description = pendingUpdate.description;
    if (pendingUpdate.image !== undefined && pendingUpdate.image.length > 0)
      updateFields.image = pendingUpdate.image;
    if (pendingUpdate.thumbnail !== undefined && pendingUpdate.thumbnail !== '')
      updateFields.thumbnail = pendingUpdate.thumbnail;
    if (
      pendingUpdate.categories !== undefined &&
      pendingUpdate.categories.length > 0
    )
      updateFields.categories = pendingUpdate.categories;
    if (
      pendingUpdate.platform !== undefined &&
      pendingUpdate.platform.length > 0
    )
      updateFields.platform = pendingUpdate.platform;
    if (pendingUpdate.price !== undefined)
      updateFields.price = pendingUpdate.price;
    if (
      pendingUpdate.socialLinks !== undefined &&
      pendingUpdate.socialLinks.length > 0
    )
      updateFields.socialLinks = pendingUpdate.socialLinks;
    if (
      pendingUpdate.gameStatus !== undefined &&
      (pendingUpdate.gameStatus === 'upcoming' ||
        pendingUpdate.gameStatus === 'active')
    ) {
      updateFields.gameStatus = pendingUpdate.gameStatus;
      updateFields.upcomingDate = undefined;

      if (
        pendingUpdate.gameStatus === 'upcoming' &&
        pendingUpdate.upcomingDate !== undefined
      ) {
        updateFields.upcomingDate = pendingUpdate.upcomingDate;
      }
    }

    if (Object.keys(updateFields).length === 0) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'No valid fields provided for update',
        '',
      );
    }

    // Update game
    const updatedGame = await Game.findByIdAndUpdate(
      pendingUpdate.gameId,
      { $set: updateFields },
      {
        new: true,
        runValidators: true,
      },
    )
      .where({ isDelete: { $ne: true } })
      .populate('userId');

    if (!updatedGame) {
      throw new AppError(
        httpStatus.NOT_FOUND,
        'Failed to apply game update',
        '',
      );
    }

    await PendingGameUpdate.findByIdAndUpdate(updateIdObject, {
      status: 'approved',
      // reviewedBy: await idConverter(adminId),
      reviewedAt: new Date(),
    });

    return updatedGame;
  } catch (error: any) {
    console.error('Error in approveGameUpdate:', error);
    throw new AppError(
      error.statusCode || httpStatus.INTERNAL_SERVER_ERROR,
      error.message || 'Failed to approve game update',
      '',
    );
  }
};

const rejectGameUpdate = async (updateId: string) => {
  const updateIdObject = await idConverter(updateId);

  if (!updateIdObject) {
    throw new AppError(httpStatus.NOT_FOUND, 'Invalid pending updateId ', '');
  }

  const pendingUpdate = await PendingGameUpdate.findById(updateIdObject);
  if (!pendingUpdate) {
    throw new AppError(httpStatus.NOT_FOUND, 'Pending update not found', '');
  }

  if (pendingUpdate.status !== 'pending') {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Update is not in pending status',
      '',
    );
  }

  await PendingGameUpdate.deleteOne(updateIdObject);

  return { message: 'Game update rejected successfully' };
};

const getPendingProfileUpdates = async () => {
  const updates = await PendingUserUpdate.find({ status: 'pending' }).populate(
    '_id',
    'email name',
  );
  return updates;
};

const approveProfileUpdate = async (
  adminId: string,
  payload: TApproveProfileUpdate,
) => {
  try {
    if (!payload.updateId) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Update ID is required', '');
    }
    const updateIdObject = await idConverter(payload.updateId!);
    if (!updateIdObject) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'Invalid update ID format',
        '',
      );
    }

    // const admin = await Admin.findById(await idConverter(adminId!)).where({
    //   isDeleted: { $ne: true },
    //   role: USER_ROLE.ADMIN,
    // });
    // if (!admin) {
    //   throw new AppError(httpStatus.FORBIDDEN, 'Admin user not found', '');
    // }

    const pendingUpdate = await PendingUserUpdate.findById(updateIdObject);
    if (!pendingUpdate) {
      throw new AppError(
        httpStatus.NOT_FOUND,
        'Pending profile update not found',
        '',
      );
    }

    if (pendingUpdate.status !== 'pending') {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'Profile update is not in pending status',
        '',
      );
    }

    const user = await User.findById(pendingUpdate.userId).where({
      isDeleted: { $ne: true },
    });
    if (!user) {
      throw new AppError(httpStatus.NOT_FOUND, 'User not found', '');
    }

    const updateFields: Partial<IUser> = {
      approvedUpdate: true,
    };
    if (pendingUpdate.name !== undefined)
      updateFields.name = pendingUpdate.name;
    if (pendingUpdate.userName !== undefined)
      updateFields.userName = pendingUpdate.userName;
    if (pendingUpdate.bio !== undefined) updateFields.bio = pendingUpdate.bio;
    if (pendingUpdate.links !== undefined)
      updateFields.links = pendingUpdate.links;
    if (pendingUpdate.photo !== undefined)
      updateFields.photo = pendingUpdate.photo;

    if (Object.keys(updateFields).length === 1) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'No valid fields provided for update',
        '',
      );
    }

    const updatedUser = await User.findByIdAndUpdate(
      pendingUpdate.userId,
      { $set: updateFields },
      { new: true, runValidators: true },
    )
      .where({ isDeleted: { $ne: true } })
      .select('name userName email role bio links photo approvedUpdate');

    if (!updatedUser) {
      throw new AppError(
        httpStatus.NOT_FOUND,
        'Failed to apply profile update',
        '',
      );
    }

    await PendingUserUpdate.findByIdAndUpdate(payload.updateId, {
      status: 'approved',
      reviewedAt: new Date(),
    });

    return updatedUser;
  } catch (error: any) {
    console.error('Error in approveProfileUpdate:', error);
    throw new AppError(
      error.statusCode || httpStatus.INTERNAL_SERVER_ERROR,
      error.message || 'Failed to approve profile update',
      '',
    );
  }
};

const rejectProfileUpdate = async (adminId: string, updateId: string) => {
  const updateIdObject = await idConverter(updateId);
  // const adminIdObject = await idConverter(adminId);

  if (!updateIdObject) {
    throw new AppError(httpStatus.NOT_FOUND, 'UpdateId is required', '');
  }

  const pendingUpdate = await PendingUserUpdate.findById(updateIdObject);
  if (!pendingUpdate) {
    throw new AppError(httpStatus.NOT_FOUND, 'Pending update not found', '');
  }

  if (pendingUpdate.status !== 'pending') {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Update is not in pending status',
      '',
    );
  }

  await PendingUserUpdate.findByIdAndUpdate(updateIdObject, {
    status: 'rejected',
    reviewedAt: new Date(),
  });
  return { message: 'Profile update rejected successfully' };
};

const deleteUser = async (userId: string) => {
  const userIdObject = await idConverter(userId);
  console.log('userIdObject: ', userIdObject);

  const findUser = await User.find({ _id: userIdObject });

  if (findUser.length === 0) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found', '');
  }
  const deleteResult = await User.deleteOne({ _id: userIdObject });
  console.log('Delete result:', deleteResult);

  if (deleteResult.deletedCount === 0) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not deleted', '');
  }

  // if (pendingUpdate.status !== 'pending') {
  //   throw new AppError(
  //     httpStatus.BAD_REQUEST,
  //     'Update is not in pending status',
  //     '',
  //   );
  // }

  return deleteUser;
};

const deleteGame = async (gameId: string) => {
  console.log('gameid: ', typeof gameId);
  const gameIdObject = await idConverter(gameId);
  console.log('gameid: ', typeof gameIdObject);


  console.log('gameIdObject: ', gameIdObject);

  const findGame = await Game.find({ _id: gameIdObject });

  if (findGame.length === 0) {
    throw new AppError(httpStatus.NOT_FOUND, 'Game not found', '');
  }

  const deleteResult = await Game.deleteOne({ _id: gameIdObject });
  console.log('Delete result:', deleteResult);

  if (deleteResult.deletedCount === 0) {
    throw new Error('Game not found or deletion failed.');
  }

  return { success: true, message: 'Game deleted successfully' };
};

const getDashboardStats = async () => {
  const totalUsers = await User.countDocuments({ isDeleted: false });
  const totalGames = await Game.countDocuments({ isDelete: false });
  const totalUpcomingGames = await Game.countDocuments({ isApproved: false });

  const userWiseGames = await User.aggregate([
    { $match: { isDeleted: false } },
    {
      $lookup: {
        from: 'games',
        localField: 'userId',
        foreignField: 'userId',
        as: 'games',
      },
    },
    {
      $project: {
        userId: 1,
        name: 1,
        email: 1,
        games: {
          $filter: {
            input: '$games',
            as: 'game',
            cond: { $eq: ['$$game.isDelete', false] },
          },
        },
      },
    },
    {
      $sort: { userId: 1 },
    },
  ]).project({
    userId: 1,
    name: 1,
    email: 1,
    'games._id': 1,
    'games.gameId': 1,
    'games.game_title': 1,
    'games.category': 1,
    'games.description': 1,
    'games.price': 1,
    'games.isApproved': 1,
  });

  const userGames = await Game.aggregate([
    { $match: { isDelete: false } },
    {
      $group: {
        _id: '$userId',
        gameCount: { $sum: 1 },
      },
    },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: 'userId',
        as: 'user',
      },
    },
    { $unwind: '$user' },
    {
      $project: {
        userId: '$user.userId',
        userName: '$user.name',
        userEmail: '$user.email',
        gameCount: 1,
      },
    },
  ]);

  const allUsers = await User.find({ isDeleted: false })
    .select('-password')
    .lean();

  const allGames = await Game.find({ isDelete: false }).lean();

  const approvedGames = await Game.find({ isApproved: true }).lean();

  const gameUpdateRequest = await PendingGameUpdate.find({
    status: 'pending',
  }).lean();

  const userUpdateRequest = await PendingGameUpdate.find({
    status: 'pending',
  }).lean();

  return {
    totalUsers,
    totalGames,
    totalUpcomingGames,
    userWiseGames,
    allUsers,
    allGames,
    approvedGames,
    gameUpdateRequest,
    userUpdateRequest,
  };
};

const updateUserToAdminIntoDb = async (
  payload: { userId: string, password: string },
) => {
  const role = USER_ROLE.ADMIN;
  const userIdObject = await idConverter(payload.userId)
  console.log('userId: ', payload.userId);

  if (!userIdObject) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      'Provided user ID does not match authenticated user',
      '',
    );
  }

  const existingUser = await User.findOne({
    _id: userIdObject,
    isDeleted: { $ne: true },
  });
  // { $set: updateFields },
  // { new: true, runValidators: true, session },
  // ).select('-password');

  if (!existingUser) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      'User not found or is deleted',
      '',
    );
  }

  const createAdminBuilder = new Admin({ name: existingUser.name, email: existingUser.email, password: payload.password, role });
  const result = await createAdminBuilder.save();
  return {
    status: true,
    message: 'Successfully created new admin',
    admin: result,
  };

};

const AdminServices = {
  createAdminIntoDb,
  loginAdminIntoDb,
  approveGame,
  getPendingGameUpdates,
  approveGameUpdate,
  rejectGameUpdate,
  getPendingProfileUpdates,
  approveProfileUpdate,
  rejectProfileUpdate,
  deleteUser,
  deleteGame,
  getDashboardStats,
  updateUserToAdminIntoDb,
};

export default AdminServices;
