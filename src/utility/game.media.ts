import path from 'path';
import config from '../app/config';

const gameMediaUrl = (filePath: string, userId: string, fileType: 'image' | 'thumbnails'): string => {
  const fileName = path.basename(filePath);
  const subDir = fileType === 'image' ? 'images' : 'thumbnails';
  const relativePath = path
    .join('src', 'uploads', userId, 'games', subDir!, fileName)
    .replace(/\\/g, '/');
  const baseUrl = config.base_url;
  const fileUrl = `${baseUrl}/${relativePath}`;
  return fileUrl;
};

const profileMediaUrl = (filePath: string, userId: string): string => {
  const fileName = path.basename(filePath);
  const relativePath = path
    .join('src', 'uploads', userId, 'profile', fileName)
    .replace(/\\/g, '/');
  const baseUrl = config.base_url;
  const fileUrl = `${baseUrl}/${relativePath}`;
  return fileUrl;
};

const adminMediaUrl = (filePath: string): string => {
  const fileName = path.basename(filePath);
  const relativePath = path
    .join('src', 'uploads', 'admin', fileName)
    .replace(/\\/g, '/');
  const baseUrl = config.base_url;
  const fileUrl = `${baseUrl}/${relativePath}`;
  return fileUrl;
};

const blogMediaUrl = (filePath: string): string => {
  const fileName = path.basename(filePath);
  const relativePath = path
    .join('src', 'uploads', 'blog', fileName)
    .replace(/\\/g, '/');
  const baseUrl = config.base_url;
  const fileUrl = `${baseUrl}/${relativePath}`;
  return fileUrl;
};

const MediaUrl = {
  gameMediaUrl,
  profileMediaUrl,
  adminMediaUrl,
  blogMediaUrl
};

export default MediaUrl;
