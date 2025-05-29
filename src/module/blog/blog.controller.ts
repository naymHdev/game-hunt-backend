import { RequestHandlerWithFiles } from '../../types/express';
import catchAsync from '../../utility/catchAsync';
import httpStatus from 'http-status';
import sendResponse from '../../utility/sendResponse';
import { RequestHandler } from 'express';
import BlogServices from './blog.services';
import AppError from '../../app/error/AppError';

const createNewBlog: RequestHandlerWithFiles = catchAsync(async (req, res) => {
  // console.log('GameController.createNewGame - Inputs:', {
  //   body: req.body,
  //   files: req.files,
  //   user: req.user,
  //   headers: req.headers,
  // });

  const result = await BlogServices.createNewBlogIntoDb(req);

  console.log(result);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: 'successfully created blog',
    data: result,
  });
});

const getAllBlog: RequestHandler = catchAsync(async (req, res) => {
  const result = await BlogServices.getAllBlogIntoDb(req.query);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Successfully retrieved all blogs',
    data: result,
  });
});

const singleBlog: RequestHandler = catchAsync(async (req, res) => {
  const result = await BlogServices.singleBlog(req.params.id);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Successfully retrieved blog',
    data: result,
  });
});

const updateBlog: RequestHandlerWithFiles = catchAsync(async (req, res) => {
  console.log('BlogController.createNewGame - Inputs:', {
    body: req.body.data,
    file: req.files,
    headers: req.headers,
  });

  const files = req.files as
    | { [fieldname: string]: Express.Multer.File[] }
    | undefined;

  const blogImageFile = files?.blogImage ? files.blogImage[0] : undefined;
  const result = await BlogServices.updateBlogIntoDb(
    req.body.data,
    blogImageFile,
  );
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Blog updated perfectly',
    data: result,
  });
});

const deleteBlog: RequestHandler = catchAsync(async (req, res) => {
  console.log('BlogController.createNewGame - Inputs:', {
    body: req.body.data,
    headers: req.headers,
  });
  if (req.user.role !== 'SUPERADMIN') {
    throw new AppError(
      httpStatus.FORBIDDEN,
      'Only Super Admin can delet blog',
      '',
    );
  }
  const result = await BlogServices.deleteBlogIntoDb(req.body.data?.blogId!);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Blog deleted perfectly',
    data: result,
  });
});

const deleteAllBlog: RequestHandler = catchAsync(async (req, res) => {
  console.log('BlogController.createNewGame - Inputs:', {
    body: req.body.data,
    headers: req.headers,
  });

  const result = await BlogServices.deleteAllBlogIntoDb();
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'All blogs deleted perfectly',
    data: result,
  });
});

const BlogController = {
  createNewBlog,
  getAllBlog,
  updateBlog,
  deleteBlog,
  deleteAllBlog,
  singleBlog
};

export default BlogController;
