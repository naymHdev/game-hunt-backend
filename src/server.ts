import { Server } from 'http';
import mongoose from 'mongoose';

import app from './app';
import config from './app/config';

let server: Server;

async function main() {
  //await mongoose.connect('mongodb://127.0.0.1:27017/test');
  try {
    await mongoose.connect(config.database_url as string);
    console.log('successfully run');
    server = app.listen(config.port, () => {
      console.log(`Example app listening on port ${config.port}`);
    });
  } catch (err) {
    console.log(err);
  }
}
main().then(() => {
  console.log('Successfully Server Running');
});

// server error unhandle rejection
//userName:shoes_management
//password:6e3VSMxRxRHjgZYQ
process.on('unhandledRejection', function () {
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  }
  process.exit(1);
});
// undefined or human error is uncaughtException
process.on('uncaughtException', function () {
  process.exit(1);
});
