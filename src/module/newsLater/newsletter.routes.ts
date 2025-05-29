import express from 'express';
import validationRequest from '../../middleware/validationRequest';
import {
  newsletterIdValidationSchema,
  newsletterValidationSchema,
} from './newsletter.validation';
import newsletterController from './newsletter.controller';
import auth from '../../middleware/auth';
import { USER_ROLE } from '../user/user.constant';
const router = express.Router();

router.post(
  '/add-mail',
  // auth(USER_ROLE.ADMIN, USER_ROLE.USER),
  validationRequest(newsletterValidationSchema),
  newsletterController.addNewsletterMail,
);

router.get(
  '/findNewsletterMail',
  // auth(USER_ROLE.ADMIN),
  newsletterController.findAllNewsletterEmail,
);

router.delete(
  '/delete-all-newsletter',
  auth(USER_ROLE.ADMIN),
  newsletterController.deleteAllNewsletter,
);

router.delete(
  '/delete-newsletter',
  auth(USER_ROLE.ADMIN),
  validationRequest(newsletterIdValidationSchema),
  newsletterController.deleteNewsletter,
);

export const NewsletterRoute = router;
