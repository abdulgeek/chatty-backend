import mongoose from "mongoose";
import { config } from "@root/config";
import { redisConnection } from "@service/redis/redis.connection";
import Logging from "@service/logger/logging";

export const dbConnect = () => {
  const connect = async () => {
    try {
      await mongoose.connect(config.DATABASE_URL as string);
      Logging.info("Successfully connected to database.");
      await redisConnection.connect();
      Logging.info("Redis connection established successfully.");
    } catch (error: any) {
      Logging.error(`Error connecting to database: ${error.message}`);
      process.exit(1);
    }
  };
  connect();
  mongoose.connection.on("disconnected", connect);
};
