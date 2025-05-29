import multer from 'multer';
import path from 'path';
import fs from 'fs';
import httpStatus from 'http-status';
import AppError from '../../app/error/AppError';

const adminStorage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'src/uploads/admin/heroImages/');
    console.log('Admin Multer - Attempting to create directory:', uploadDir);

    try {
      fs.mkdirSync(uploadDir, { recursive: true });
      console.log('Admin Multer - Directory created successfully:', uploadDir);
      cb(null, uploadDir);
    } catch (error: any) {
      console.error(
        'Admin Multer - Failed to create directory:',
        error.message,
      );
      cb(
        new AppError(
          httpStatus.INTERNAL_SERVER_ERROR,
          `Failed to create admin upload directory: ${error.message}`,
          '',
        ),
        '',
      );
    }
  },
  filename: (req, file, cb) => {
    const filename = `${Date.now()}-${file.originalname}`;
    console.log('Admin Multer - Generated filename:', filename);
    cb(null, filename);
  },
});

export const uploadAdmin = multer({
  storage: adminStorage,
  // fileFilter(req, file, cb: multer.FileFilterCallback) {
  //   const fileTypes = /jpeg|jpg|png/;
  //   const fileExt = fileTypes.test(path.extname(file.originalname).toLowerCase());
  //   const fileMimeType = fileTypes.test(file.mimetype);
  //   if (fileExt && fileMimeType) {
  //     cb(null, true);
  //   } else {
  //     console.error('Admin Multer - Invalid file type:', file.originalname);
  //     cb(new AppError(httpStatus.BAD_REQUEST, 'Only JPEG, JPG, or PNG files are allowed', '') as any, false);
  //   }
  // },
  // limits: { fileSize: 5 * 1024 * 1024 },
});
