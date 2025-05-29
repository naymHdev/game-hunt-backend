import axios from 'axios';
import config from '../app/config';
import fs from 'fs';
import AppError from '../app/error/AppError';
import httpStatus from 'http-status';

export const uploadFileToBunny = async (
  localFilePath: string,
  remoteFilePath: string,
) => {
  const uri = `https://${config.bunny_hostname}/${config.bunny_storage_zone}/${remoteFilePath}`;
  const bunny_access_key = config.bunny_access_key;

  const fileStream = fs.createReadStream(localFilePath);

  const axiosPut = await axios.put(uri, fileStream, {
    headers: {
      AccessKey: bunny_access_key,
      'Content-Type': 'application/octet-stream',
    },
    maxBodyLength: Infinity,
  });
  if (!axiosPut) {
    throw new AppError(
      httpStatus.NOT_IMPLEMENTED,
      'File not uploaded on BUnny CDN',
      '',
    );
  }
  return `https://${config.bunny_pull_zone}/${remoteFilePath}`;
};
