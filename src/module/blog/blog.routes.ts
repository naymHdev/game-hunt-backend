import express from 'express';
import BlogController from './blog.controller';
import validationRequest from '../../middleware/validationRequest';
import BlogValidationSchema from './blog.zod.validation';
import { uploadBlog } from '../../app/multer/blog.multer';
import auth from '../../middleware/auth';
import { USER_ROLE } from '../user/user.constant';

const router = express.Router();

router.get('/getAllBlog', BlogController.getAllBlog);
router.get('/getAllBlog/:id', BlogController.singleBlog);

router.post(
  '/create-blog',
  uploadBlog.fields([{ name: 'blogImage', maxCount: 1 }]),
  validationRequest(BlogValidationSchema.createBlogValidation),
  BlogController.createNewBlog,
);

router.patch(
  '/update-blog',
  uploadBlog.fields([{ name: 'blogImage', maxCount: 1 }]),
  validationRequest(BlogValidationSchema.updateBlogValidation),
  BlogController.updateBlog,
);

router.delete(
  '/delete-blog',
  auth(USER_ROLE.SUPERADMIN),
  validationRequest(BlogValidationSchema.deleteBlogValidation),
  BlogController.deleteBlog,
);

router.delete('/delete-all-blog', BlogController.deleteAllBlog);

export const BlogRouter = router;
