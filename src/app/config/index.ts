import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

export default {
  port: process.env.PORT,
  base_url: process.env.BASE_URL,
  database_url: process.env.DATABASE_URL,
  bcrypt_salt_rounds: process.env.BCRYPT_SALT_ROUNDS,
  NODE_ENV: process.env.NODE_ENV,

  admin_jwt_access_secret: process.env.ADMIN_JWT_ACCESS_SECRET,
  jwt_access_secret: process.env.JWT_ACCESS_SECRET,
  expires_in: process.env.EXPIRES_IN,
  jwt_refresh_secret: process.env.JWT_REFRESH_SECRET,
  refresh_expires_in: process.env.REFRESH_EXPIRES_IN,

  smtp_host: process.env.SMTP_HOST,
  smtp_port: process.env.SMTP_PORT,
  owner_mail: process.env.OWNER_MAIL!,
  mail_password: process.env.MAIL_PASSWORD!,

  bunny_port: process.env.BUNNY_CDN_PORT,
  bunny_region: process.env.BUNNY_CDN_REGION,
  bunny_base_hostname: process.env.BUNNY_CDN_BASE_HOSTNAME,
  bunny_hostname: process.env.BUNNY_CDN_HOSTNAME,
  bunny_storage_zone: process.env.BUNNY_CDN_STORAGE_ZONE_NAME,
  bunny_pull_zone: process.env.BUNNY_CDN_PULL_ZONE_NAME,
  bunny_access_key: process.env.BUNNY_CDN_ACCESS_KEY,

  server_file_path: process.env.FILE_PATH,
};
