import express, { NextFunction, Request, Response } from 'express';
import validationRequest from '../../middleware/validationRequest';
import GameValidationSchema from './game.zod.validation';
import auth from '../../middleware/auth';
import { USER_ROLE } from '../user/user.constant';
import { uploadGames } from '../../app/multer/game.multer';
import GameController from './game.controller';

const router = express.Router();

router.post(
  '/upload_game',
  auth(USER_ROLE.ADMIN, USER_ROLE.USER),
  uploadGames.fields([
    { name: 'image', maxCount: 5 },
    { name: 'thumbnail', maxCount: 1 },
  ]),
  validationRequest(GameValidationSchema.GameSchema),
  GameController.createNewGame,
);

router.patch(
  '/update_game',
  auth(USER_ROLE.ADMIN, USER_ROLE.USER),
  uploadGames.fields([
    { name: 'image', maxCount: 5 },
    { name: 'thumbnail', maxCount: 1 },
  ]),
  validationRequest(GameValidationSchema.GameUpdateSchemaValidation),
  GameController.updateGame,
);

router.post(
  '/comment',
  auth(USER_ROLE.ADMIN, USER_ROLE.USER),
  validationRequest(GameValidationSchema.CommentSchema),
  GameController.addComment,
);

router.post(
  '/upvote-comment',
  auth(USER_ROLE.ADMIN, USER_ROLE.USER),
  validationRequest(GameValidationSchema.UpvoteCommentSchema),
  GameController.addCommentUpvote,
);

router.post(
  '/upvote-game',
  auth(USER_ROLE.ADMIN, USER_ROLE.USER, USER_ROLE.SUPERADMIN),
  validationRequest(GameValidationSchema.UpvoteGameSchema),
  GameController.addGameUpvote,
);

router.post(
  '/share',
  auth(USER_ROLE.ADMIN, USER_ROLE.USER),
  validationRequest(GameValidationSchema.ShareSchema),
  GameController.addShare,
);

router.get('/getAllGame', GameController.getAllGame);

router.get('/getAllApprovedGame', GameController.getAllApproveGame);

router.get(
  '/getUpcomingGame',
  // auth(USER_ROLE.USER, USER_ROLE.ADMIN),
  GameController.getUpcomingGame,
);

router.get(
  '/getSimilarGame',
  // auth(USER_ROLE.USER, USER_ROLE.ADMIN),
  GameController.getSimilarGame,
);

router.get(
  '/top-game/day',
  // auth(USER_ROLE.ADMIN, USER_ROLE.USER),
  // validationRequest(GameValidationSchema.TopGameQuerySchema),
  GameController.getTopGameOfDay,
);

router.get(
  '/top-game/week',
  // auth(USER_ROLE.ADMIN, USER_ROLE.USER),
  // validationRequest(GameValidationSchema.TopGameQuerySchema),
  GameController.getTopGameOfWeek,
);

router.get(
  '/search-game',
  // auth(USER_ROLE.ADMIN, USER_ROLE.USER),
  // validationRequest(GameValidationSchema.TopGameQuerySchema),
  GameController.searchGame,
);

const GameRouter = router;

export default GameRouter;
