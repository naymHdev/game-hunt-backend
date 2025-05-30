import express from 'express';
import validationRequest from '../../middleware/validationRequest';
import GameController from '../game/game.controller';
import AdminValidationSchema from './admin.validation';
import AdminController from './admin.controller';
import auth from '../../middleware/auth';
import { USER_ROLE } from '../user/user.constant';
import AuthValidationSchema from '../auth/auth.validation';
import AuthController from '../auth/auth.controller';
import { userValidation } from '../user/user.zod.validation';
import UserController from '../user/user.controller';
import GameValidationSchema from '../game/game.zod.validation';

const router = express.Router();

router.post(
  '/signupSuperAdmin',
  validationRequest(AdminValidationSchema.adminSignUpValidation),
  AdminController.createSuperAdmin,
);

router.post(
  '/signup',
  auth(USER_ROLE.SUPERADMIN),
  validationRequest(AdminValidationSchema.adminSignUpValidation),
  AdminController.createAdmin,
);

router.post(
  '/login',
  validationRequest(AdminValidationSchema.adminSignInValidation),
  AdminController.loginAdmin,
);

router.get('/getAllGame', GameController.getAllGamebyAdmin);

router.get('/find_all_users', UserController.findAllUser);

router.post(
  '/approveGame',
  // auth(USER_ROLE.ADMIN),
  validationRequest(AdminValidationSchema.approveGameValidation),
  AdminController.approveGameByAdmin,
);

router.get(
  '/pending-game-updates',
  // auth(USER_ROLE.ADMIN),
  AdminController.getPendingGameUpdates,
);

router.post(
  '/approve-game-update',
  // auth(USER_ROLE.ADMIN),
  validationRequest(AdminValidationSchema.approveGameUpdateValidation),
  AdminController.approveGameUpdateByAdmin,
);

router.delete(
  '/reject-game-update',
  // auth(USER_ROLE.ADMIN),
  validationRequest(AdminValidationSchema.rejectGameUpdateValidation),
  AdminController.rejectGameUpdateByAdmin,
);

router.get(
  '/pending-profile-updates',
  // auth(USER_ROLE.ADMIN),
  AdminController.getPendingProfileUpdates,
);

router.post(
  '/approve-profile-update',
  // auth(USER_ROLE.ADMIN),
  validationRequest(AdminValidationSchema.approveProfileUpdateValidation),
  AdminController.approveProfileUpdateByAdmin,
);

router.patch(
  '/update_linkType',
  validationRequest(GameValidationSchema.UpdateLinkTypeValidation),
  GameController.updateLinkType,
);

router.patch(
  '/update_user_to_admin',
  auth(USER_ROLE.SUPERADMIN),
  validationRequest(AdminValidationSchema.updateUserToAdminValidation),
  AdminController.updateUserToAdmin,
);

router.delete(
  '/reject-profile-update',
  // auth(USER_ROLE.ADMIN),
  validationRequest(AdminValidationSchema.rejectProfileUpdateValidation),
  AdminController.rejectProfileUpdateByAdmin,
);

router.delete(
  '/delete-game',
  auth(USER_ROLE.ADMIN, USER_ROLE.SUPERADMIN),
  validationRequest(AdminValidationSchema.deleteGameValidationSchema),
  AdminController.deleteGameByAdmin,
);

router.delete(
  '/delete-user',
  // auth(USER_ROLE.ADMIN),
  validationRequest(AdminValidationSchema.deleteUserValidationSchema),
  AdminController.deleteUserByAdmin,
);

router.get(
  '/dashboard',
  // auth(USER_ROLE.ADMIN),
  AdminController.getDashboardStats,
);

const AdminRouter = router;

export default AdminRouter;
