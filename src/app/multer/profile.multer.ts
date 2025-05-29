import multer from 'multer';
import path from 'path';
import fs from 'fs';
import httpStatus from 'http-status';
import AppError from '../../app/error/AppError';

const profileStorage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const userId = req.user?._id;
    console.log(
      'Profile Multer - userId:',
      userId,
      'req.body:',
      req.body,
      'req.user:',
      req.user,
    );

    if (!userId) {
      console.error('Profile Multer - Error: userId is required');
      return cb(
        new AppError(
          httpStatus.BAD_REQUEST,
          'userId is required for file upload',
          '',
        ),
        '',
      );
    }

    const uploadDir = path.join(
      process.cwd(),
      `src/uploads/${userId}/profile/`,
    );
    console.log('Profile Multer - Attempting to create directory:', uploadDir);

    try {
      fs.mkdirSync(uploadDir, { recursive: true });
      console.log(
        'Profile Multer - Directory created successfully:',
        uploadDir,
      );
      cb(null, uploadDir);
    } catch (error: any) {
      console.error(
        'Profile Multer - Failed to create directory:',
        error.message,
      );
      cb(
        new AppError(
          httpStatus.INTERNAL_SERVER_ERROR,
          `Failed to create profile upload directory: ${error.message}`,
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

export const uploadProfile = multer({
  storage: profileStorage,
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
