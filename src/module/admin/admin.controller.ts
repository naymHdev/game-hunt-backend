import { RequestHandler } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../utility/catchAsync';
import AdminServices from './admin.services';
import sendResponse from '../../utility/sendResponse';
import UserServices from '../user/user.services';
import AuthServices from '../auth/auth.services';
import config from '../../app/config';
import AppError from '../../app/error/AppError';

const createSuperAdmin: RequestHandler = catchAsync(async (req, res) => {
  const result = await AdminServices.createAdminIntoDb(req.body.data);
  // console.log(req.body);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: 'successfully create admin',
    data: result,
  });
});
const createAdmin: RequestHandler = catchAsync(async (req, res) => {
  const adminId = req.user?.id;
  if (!adminId) {
    throw new AppError(httpStatus.UNAUTHORIZED, 'Admin not authenticated', '');
  }
  const result = await AdminServices.createAdminIntoDb(req.body.data, adminId);
  // console.log(req.body);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: 'successfully create admin',
    data: result,
  });
});

const loginAdmin: RequestHandler = catchAsync(async (req, res) => {
  // console.log("login admin: ",req.body);

  const result = await AdminServices.loginAdminIntoDb(req.body.data);

  const { refreshToken, accessToken } = result;
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
    },
  });
});

const approveGameByAdmin: RequestHandler = catchAsync(async (req, res) => {
  console.log('body: ', req.body.data);
  const result = await AdminServices.approveGame(req.body.data);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Successfully approved game',
    data: result,
  });
});

const getPendingGameUpdates: RequestHandler = catchAsync(async (req, res) => {
  const result = await AdminServices.getPendingGameUpdates();
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Pending game updates retrieved successfully',
    data: result,
  });
});

const approveGameUpdateByAdmin: RequestHandler = catchAsync(
  async (req, res) => {
    const result = await AdminServices.approveGameUpdate(
      req.body.data,
      // req.user?._id!,
    );
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: 'Game update approved successfully',
      data: result,
    });
  },
);

const rejectGameUpdateByAdmin: RequestHandler = catchAsync(async (req, res) => {
  const result = await AdminServices.rejectGameUpdate(req.body.data.updateId);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Game update rejected successfully',
    data: result,
  });
});

const getPendingProfileUpdates: RequestHandler = catchAsync(
  async (req, res) => {
    const result = await AdminServices.getPendingProfileUpdates();
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: 'Pending profile updates retrieved successfully',
      data: result,
    });
  },
);

const approveProfileUpdateByAdmin: RequestHandler = catchAsync(
  async (req, res) => {
    // console.log('approveProfileUpdateByAdmin:', req.user?.id!);

    // if (!req.user) {
    //   throw new AppError(httpStatus.UNAUTHORIZED, 'User not authenticated', '');
    // }
    const result = await AdminServices.approveProfileUpdate(
      req.user?.id!,
      req.body.data,
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: 'Profile update approved successfully',
      data: result,
    });
  },
);

const rejectProfileUpdateByAdmin: RequestHandler = catchAsync(
  async (req, res) => {
    const result = await AdminServices.rejectProfileUpdate(
      req.user?._id!,
      req.body.data.updateId,
    );
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: 'Profile update rejected successfully',
      data: result,
    });
  },
);

const deleteUserByAdmin: RequestHandler = catchAsync(async (req, res) => {
  console.log(req.body.data?.userId!);

  const result = await AdminServices.deleteUser(req.body.data?.userId!);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'User deleted successfully',
    data: result,
  });
});

const deleteGameByAdmin: RequestHandler = catchAsync(async (req, res) => {
  if (req.user?.role !== 'SUPERADMIN') {
    throw new AppError(httpStatus.FORBIDDEN, 'Only Super Admin can delete blog', '');
  }
  console.log(req.body.data?.gameId!);
  const result = await AdminServices.deleteGame(req.body.data?.gameId!);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Game deleted successfully',
    data: result,
  });
});

const getDashboardStats: RequestHandler = catchAsync(async (req, res) => {
  const result = await AdminServices.getDashboardStats();
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Dashboard statistics retrieved successfully',
    data: result,
  });
});

const updateUserToAdmin: RequestHandler = catchAsync(async (req, res) => {
  if ((req.user?.role === 'ADMIN') || (req.user?.role === 'USER')) {
    throw new AppError(httpStatus.FORBIDDEN, 'Only Super Admin can convert user into admin', '');
  }

  const result = await AdminServices.updateUserToAdminIntoDb(
    req.body.data,
  );
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'successfully convert user into admin',
    data: result,
  });
});

const AdminController = {
  createSuperAdmin,
  createAdmin,
  loginAdmin,
  approveGameByAdmin,
  getPendingGameUpdates,
  approveGameUpdateByAdmin,
  rejectGameUpdateByAdmin,
  getPendingProfileUpdates,
  approveProfileUpdateByAdmin,
  rejectProfileUpdateByAdmin,
  deleteUserByAdmin,
  deleteGameByAdmin,
  getDashboardStats,
  updateUserToAdmin,
};

export default AdminController;
