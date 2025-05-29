import httpStatus from 'http-status';
import User from './user.model';
import QueryBuilder from '../../app/builder/QueryBuilder';
import { IPendingUserUpdate, IUserUpdate, TSignup } from './user.interface';
import mongoose from 'mongoose';
import { USER_ROLE } from './user.constant';
import AppError from '../../app/error/AppError';
import PendingUserUpdate from './userUpdateProfile';
import MediaUrl from '../../utility/game.media';
import { idConverter } from '../../utility/idCoverter';
import { SocialLinksInterface } from '../game/game.interface';
import { uploadFileToBunny } from '../../utility/bunny_cdn';
import fs from 'fs/promises';
import Game from '../game/game.model';

const createUserIntoDb = async (payload: TSignup) => {
  try {
    console.log(payload);
    const { sub, name, email, password, photo } = payload;
    const role = USER_ROLE.USER;
    const isExist = await User.findOne({
      email,
      role,
      isDeleted: { $ne: true },
    });
    if (isExist) {
      return { user: isExist, existed: true };
    }

    const createUserBuilder = new User({
      sub,
      name,
      email,
      password,
      role,
      photo,
    });
    console.log(createUserBuilder);
    const result = await createUserBuilder.save();

    return { user: result, existed: false };
  } catch (error: any) {
    throw new AppError(
      httpStatus.SERVICE_UNAVAILABLE,
      ' createUserIntoDb server unavailable',
      error.message,
    );
  }
};

const findAllUserIntoDb = async (query: Record<string, unknown>) => {
  try {
    const allUserQuery = new QueryBuilder(User.find(), query)
      .search(['email'])
      .filter()
      .sort()
      .pagination()
      .fields();

    const allUsers = (await allUserQuery.modelQuery) as any;
    const meta = await allUserQuery.countTotal();

    return { meta, allUsers };
  } catch (error: any) {
    throw new AppError(
      httpStatus.SERVICE_UNAVAILABLE,
      'findAllUserIntoDb server unavailable',
      '',
    );
  }
};

const userProfile = async (userId: string) => {
  if (!userId) {
    throw new AppError(httpStatus.NO_CONTENT, 'Invalid userId', '');
  }
  const userIdObject = await idConverter(userId);

  const findUser = await User.findById(userIdObject)
    .populate({
      path: 'uploadedGame',
      match: { isDelete: { $ne: true }, isApproved: true },
      select:
        'id title thumbnail categories price gameStatus totalUpvote totalComments',
    })
    .populate({
      path: 'upVotedGame',
      match: { isDelete: { $ne: true }, isApproved: true },
      select:
        'id title thumbnail categories price gameStatus totalUpvote totalComments',
    })
    .populate({
      path: 'upVotedComment',
      match: { isDelete: { $ne: true }, isApproved: true },
      select:
        'id title thumbnail categories price gameStatus totalUpvote totalComments',
    })
    .select('-password');

  if (!findUser) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found', '');
  }
  return findUser;
};

const deleteUserIntoDb = async (userId: string, authUserId: string) => {
  if (!authUserId) {
    throw new AppError(httpStatus.NO_CONTENT, 'Invalid access', '');
  }

  if (!userId) {
    throw new AppError(httpStatus.NO_CONTENT, 'Invalid userId', '');
  }

  if (userId != authUserId) {
    throw new AppError(
      httpStatus.NO_CONTENT,
      'Provided userId and user not same',
      '',
    );
  }
  const userIdObject = await idConverter(userId);

  const userExist = await User.findById(userIdObject);
  if (!userExist) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found', '');
  }

  await User.deleteOne({ _id: userIdObject });

  const userDeleted = await User.findById(userIdObject);

  if (userDeleted) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not deleted', '');
  }
  return { message: 'User account deleted' };
};

const deleteGameIntoDb = async (gameId: string, authUserId: string) => {
  if (!authUserId) {
    throw new AppError(httpStatus.NO_CONTENT, 'Invalid user access', '');
  }

  if (!gameId) {
    throw new AppError(httpStatus.NO_CONTENT, 'Invalid gameId', '');
  }

  const gameIdObject = await idConverter(gameId);

  const gameExist = await Game.findById(gameIdObject);

  if (!gameExist) {
    throw new AppError(httpStatus.NOT_FOUND, 'Game not found', '');
  }

  if (authUserId.toString() !== gameExist.userId.toString()) {
    throw new AppError(
      httpStatus.NO_CONTENT,
      'Only owner can delete own game',
      '',
    );
  }

  const deleteResult = await Game.deleteOne({ _id: gameIdObject });
  console.log('Delete result:', deleteResult);

  if (deleteResult.deletedCount === 0) {
    throw new Error('Game deletion failed.');
  }

  return { success: true, message: 'Game deleted successfully' };
};

const updateUserProfileIntoDb = async (
  userId: string,
  payload: IUserUpdate,
  file?: Express.Multer.File,
) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { links, ...updateFields } = payload;
    let parsedLinks: SocialLinksInterface[] | undefined = links;

    console.log('file:', file?.path);

    console.log('payload: ', payload);

    console.log('userId: ', userId);

    if (!userId) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        'Provided user ID does not match authenticated user',
        '',
      );
    }

    // if (password) {
    //   updateFields.password = await bcrypt.hash(
    //     password,
    //     Number(config.bcrypt_salt_rounds),
    //   );
    // }

    const userIdObject = await idConverter(userId);

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

    console.log('existingUser.id: ', typeof existingUser.id);

    if (existingUser.id !== userId.toString()) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        'You can only update your own profile',
        '',
      );
    }

    // const photoPath = file
    //   ? MediaUrl.profileMediaUrl(file.path, userId.toString())
    //   : existingUser.photo;

    let photoPath;
    if (file) {
      const remotePath = `${Date.now()}-${file.originalname}`;
      photoPath = await uploadFileToBunny(file.path, remotePath);
      await fs.unlink(file.path);
    } else {
      photoPath = existingUser.photo;
    }
    console.log('photoPath:', photoPath);

    const pendingUserUpdateData: Partial<IPendingUserUpdate> = {
      userId: userIdObject,
      ...updateFields,
      links: parsedLinks,
      photo: photoPath,
      status: 'pending',
    };

    const pendingUPdate = await PendingUserUpdate.create(
      [pendingUserUpdateData],
      { session },
    );

    await session.commitTransaction();

    return pendingUPdate;
  } catch (error: any) {
    await session.abortTransaction();
    throw new AppError(
      error.statusCode || httpStatus.INTERNAL_SERVER_ERROR,
      error.message || 'Failed to update user profile',
      '',
    );
  } finally {
    session.endSession();
  }
};

const submitProfileUpdate = async (
  userId: string,
  payload: IPendingUserUpdate,
) => {
  const user = await User.findOne({ userId: userId, isDeleted: { $ne: true } });
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found', '');
  }

  const existingUpdate = await PendingUserUpdate.findOne({
    userId,
    status: 'pending',
  });
  if (existingUpdate) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'You already have a pending profile update',
      '',
    );
  }

  const updateData = {
    userId,
    name: payload.name,
    userName: payload.userName,
    bio: payload.bio,
    links: payload.links,
    photo: MediaUrl.profileMediaUrl(payload.photo as string, userId),
    status: 'pending',
    submittedAt: new Date(),
  };

  const pendingUpdate = await PendingUserUpdate.create(updateData);
  return pendingUpdate;
};

const UserServices = {
  createUserIntoDb,
  findAllUserIntoDb,
  userProfile,
  deleteUserIntoDb,
  deleteGameIntoDb,
  updateUserProfileIntoDb,
  submitProfileUpdate,
};

export default UserServices;
