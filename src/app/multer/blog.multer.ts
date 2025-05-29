import multer from 'multer';
import path from 'path';
import fs from 'fs';
import httpStatus from 'http-status';
import AppError from '../../app/error/AppError';

const blogStorage = multer.diskStorage({
  destination: async (req, file, cb) => {
    console.log('req.body:', req.body);

    const uploadDir = path.join(process.cwd(), `src/uploads/blog/`);
    console.log('Blog Multer - Attempting to create directory:', uploadDir);

    try {
      fs.mkdirSync(uploadDir, { recursive: true });
      console.log(
        'Blog Multer - Directory created successfully:',
        uploadDir,
      );
      cb(null, uploadDir);
    } catch (error: any) {
      console.error(
        'Blog Multer - Failed to create directory:',
        error.message,
      );
      cb(
        new AppError(
          httpStatus.INTERNAL_SERVER_ERROR,
          `Failed to create blog upload directory: ${error.message}`,
          '',
        ),
        '',
      );
    }
  },
  filename: (req, file, cb) => {
    const filename = `${Date.now()}-${file.originalname}`;
    console.log('Profile Multer - Generated filename:', filename);
    cb(null, filename);
  },
});

export const uploadBlog = multer({
  storage: blogStorage,
  // fileFilter(req, file, cb: multer.FileFilterCallback) {
  //   const fileTypes = /jpeg|jpg|png/;
  //   const fileExt = fileTypes.test(path.extname(file.originalname).toLowerCase());
  //   const fileMimeType = fileTypes.test(file.mimetype);
  //   if (fileExt && fileMimeType) {
  //     cb(null, true);
  //   } else {
  //     console.error('Profile Multer - Invalid file type:', file.originalname);
  //     cb(new AppError(httpStatus.BAD_REQUEST, 'Only JPEG, JPG, or PNG images are allowed', '') as any, false);
  //   }
  // },
  // limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});
