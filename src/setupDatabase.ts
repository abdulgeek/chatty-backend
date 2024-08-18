import mongoose from 'mongoose';
import Logger from 'bunyan';
import { config } from '@root/config';
import { redisConnection } from '@service/redis/redis.connection';

const log: Logger = config.createLogger('setupDatabase');

export default () => {
  const connect = async () => {
    try {
      await mongoose.connect(`${config.DATABASE_URL}`);
      log.info('Successfully connected to database.');
      console.log('Successfully connected to database ✅ ✅ ✅ 🔱');
      await redisConnection.connect();
    } catch (error) {
      log.error('Error connecting to database', error);
      console.error('Error connecting to database ❌ ❌ ❌ 🔴');
      return process.exit(1);
    }
  };
  connect();

  mongoose.connection.on('disconnected', connect);
};
