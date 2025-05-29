import express from 'express';
import validationRequest from '../../middleware/validationRequest';
import { userValidation } from './user.zod.validation';
import UserController from './user.controller';
import { uploadProfile } from '../../app/multer/profile.multer';
import verifyToken from '../../middleware/verifyToken';
import auth from '../../middleware/auth';
import { USER_ROLE } from './user.constant';
import AuthController from '../auth/auth.controller';

const router = express.Router();

router.post(
  '/signup',
  validationRequest(userValidation.userSignUpValidation),
  UserController.createUser,
  AuthController.loginUser,
);

router.get('/user-profile', auth(USER_ROLE.USER), UserController.userProfile);

router.patch(
  '/update_profile',
  auth(USER_ROLE.ADMIN, USER_ROLE.USER),
  uploadProfile.fields([{ name: 'photo', maxCount: 1 }]),
  validationRequest(userValidation.userProfileUpdateValidation),
  UserController.updateProfileUser,
);

router.delete(
  '/delete-user',
  auth(USER_ROLE.USER),
  validationRequest(userValidation.userDeleteValidation),
  UserController.deleteUserProfile,
);

router.delete(
  '/delete-game',
  auth(USER_ROLE.USER),
  validationRequest(userValidation.gameDeleteValidation),
  UserController.deleteGame,
);

// router.post(
//   '/profile/update',
//   verifyToken,
//   validationRequest(userValidation.userProfileUpdateValidation),
//   UserController.submitProfileUpdate,
// );

export const UserRouter = router;
