import httpStatus from 'http-status';
import AppError from '../../app/error/AppError';
import { RequestWithFiles } from '../../types/express';
import { BlogInterface, IBlogUpdate } from './blog.interface';
import Blog from './blog.model';
import QueryBuilder from '../../app/builder/QueryBuilder';
import { idConverter } from '../../utility/idCoverter';
import { uploadFileToBunny } from '../../utility/bunny_cdn';
import fs from 'fs/promises';

const createNewBlogIntoDb = async (req: RequestWithFiles) => {
  // console.log('createNewGameIntoDb - Request Details:', {
  //   body: req.body,
  //   files: req.files,
  //   headers: req.headers,
  // });

  const { data } = req.body;

  if (!data) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Data object is missing', '');
  }

  if (!data.title) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Blog title is required', '');
  }

  if (!data.author) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Author is required', '');
  }

  if (!data.published) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Draft or published required',
      '',
    );
  }

  const files = req.files as { [fieldname: string]: Express.Multer.File[] };
  const blogImageFiles = files?.blogImage || [];

  let blogImage;
  if (blogImageFiles.length > 0) {
    const remotePath = `${Date.now()}-${blogImageFiles[0].originalname}`;
    const start = Date.now();
    blogImage = await uploadFileToBunny(blogImageFiles[0].path, remotePath);
    console.log('Upload took', Date.now() - start, 'ms');
    await fs.unlink(blogImageFiles[0].path);
  } else {
    blogImage = '';
  }

  const blogData: BlogInterface = {
    author: data.author || 'Unknown',
    title: data.title,
    description: data.description || '',
    blogImage,
    altTag: data.altTag || '',
    rewards: data.rewards || [],
    published: data.published || false,
    updatedAt: new Date(),
    isDeleted: false,
  };

  const result = await Blog.create(blogData);
  return result;
};

const getAllBlogIntoDb = async (query: Record<string, unknown>) => {
  try {
    const baseQuery = Blog.find().lean();

    const blogQuery = new QueryBuilder(baseQuery, query)
      .search(['title', 'description'])
      .filter()
      .sort()
      .pagination()
      .fields();

    const allBlogs = await blogQuery.modelQuery;
    const meta = await blogQuery.countTotal();

    return { meta, allBlogs };
  } catch (error: any) {
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      error.message || 'Failed to retrieve blogs',
      '',
    );
  }
};

const singleBlog = async (id : string) => {
  try {
    const blogData = await Blog.findOne({_id : id})

    return blogData

  } catch (error: any) {
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      error.message || 'Failed to retrieve blog',
      '',
    );
  }
};

const updateBlogIntoDb = async (
  payload: IBlogUpdate,
  file?: Express.Multer.File,
) => {
  // const session = await mongoose.startSession();
  // session.startTransaction();

  try {
    console.log('file:', file?.path);

    console.log('payload: ', payload);

    console.log('userId: ', payload.blogId);

    if (!payload.blogId) {
      throw new AppError(httpStatus.FORBIDDEN, 'Blog does not exist', '');
    }
   
  if (!payload.published) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Draft or published required',
      '',
    );
  }

    const blogIdObject = await idConverter(payload.blogId);

    const existingBlog = await Blog.findOne({
      _id: blogIdObject,
      isDeleted: { $ne: true },
    });
    // { $set: updateFields },
    // { new: true, runValidators: true, session },
    // ).select('-password');

    if (!existingBlog) {
      throw new AppError(
        httpStatus.NOT_FOUND,
        'User not found or is deleted',
        '',
      );
    }

    if (existingBlog.id !== payload.blogId) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        'Blog does not exist for edit',
        '',
      );
    }
    const updateFields: Partial<IBlogUpdate> = {};

    if (payload.title) updateFields.title = payload.title;
    if (payload.description) updateFields.description = payload.description;
    if (payload.author) updateFields.author = payload.author;
    if (payload.altTag) updateFields.altTag = payload.altTag;
    if (payload.rewards && payload.rewards.length > 0)
      updateFields.rewards = payload.rewards;
    
    if (typeof payload.published === 'boolean')
      updateFields.published = payload.published;

    // if (file) {
    //   updateFields.blogImage = MediaUrl.blogMediaUrl(file.path);
    // }

    if (file) {
      const remotePath = `${Date.now()}-${file.originalname}`;
      updateFields.blogImage = await uploadFileToBunny(file.path, remotePath);
      fs.unlink(file.path);
    }

    updateFields.updatedAt = new Date();

    const updatedBlog = await Blog.findByIdAndUpdate(
      blogIdObject,
      { $set: updateFields },
      { new: true, runValidators: true },
    );

    // await session.commitTransaction();

    return updatedBlog;
  } catch (error: any) {
    // await session.abortTransaction();
    throw new AppError(
      error.statusCode || httpStatus.INTERNAL_SERVER_ERROR,
      error.message || 'Failed to update user profile',
      '',
    );
  }
  //  finally {
  //   session.endSession();
  // }
};

const deleteBlogIntoDb = async (blogId: string) => {
  if (!blogId) {
    throw new AppError(httpStatus.NOT_FOUND, 'BlogId is required', '');
  }
  const blogIdObject = await idConverter(blogId);
  const isExist = await Blog.findById(blogIdObject);
  if (!isExist) {
    throw new AppError(httpStatus.NOT_FOUND, 'Blog not exist in database', '');
  }
  const deleteBlog = await Blog.deleteOne({
    _id: blogIdObject,
    isDeleted: { $ne: true },
  });
  if (deleteBlog.deletedCount === 0) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      'Blog not deleted yet from database',
      '',
    );
  }
  return { success: true, message: 'Blog deleted successfully' };
};

const deleteAllBlogIntoDb = async () => {
  const blogs = await Blog.find();
  if (!blogs || blogs.length === 0) {
    throw new AppError(httpStatus.NOT_FOUND, 'No blog exist in database', '');
  }
  const deleteBlog = await Blog.deleteMany({ isDeleted: { $ne: true } });
  if (deleteBlog.deletedCount === 0) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      'Blog not deleted yet from database',
      '',
    );
  }
  return { success: true, message: 'All blog deleted successfully' };
};

const BlogServices = {
  createNewBlogIntoDb,
  getAllBlogIntoDb,
  updateBlogIntoDb,
  deleteBlogIntoDb,
  deleteAllBlogIntoDb,
  singleBlog
};

export default BlogServices;
