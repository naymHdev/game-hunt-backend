import multer from 'multer';
import path from 'path';
import fs from 'fs';

const storage = (destination: string) =>
  multer.diskStorage({
    destination: (req, file, cb) => {
      const userId =
        req.body.data && typeof req.body.data === 'string'
          ? JSON.parse(req.body.data).userId
          : req.body.data?.userId! || 'unknown';
      const subDir = file.fieldname === 'image' ? 'images' : 'thumbnails';
      const uploadPath = path.join(
        process.cwd(),
        'src',
        'uploads',
        userId,
        destination,
        subDir,
      );
      console.log('Game Multer - Target Upload Directory:', uploadPath);
      fs.mkdirSync(uploadPath, { recursive: true });
      console.log(
        'Game Multer - Directory created or already exists:',
        uploadPath,
      );
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      const filename = `${Date.now()}-${file.originalname}`;
      console.log('Game Multer - Generated filename:', filename);
      cb(null, filename);
    },
  });

export const uploadGames = multer({
  storage: storage('games'),
  // limits: { fileSize: 10 * 1024 * 1024 },
  // fileFilter: (_req: Request, file, cb) => {
  //   if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/webp') {
  //     cb(null, true);
  //   } else {
  //     cb(new Error('Invalid file type. Only JPEG, PNG, and WEBP are allowed.') as any, false);
  //   }
  // },
});
