import mongoose from "mongoose";
import { config } from "@root/config";
import { redisConnection } from "@service/redis/redis.connection";
import Logging from "@service/logger/logging";

export const dbConnect = () => {
  const connect = async () => {
    try {
      const mongooseOptions = {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 5000
      };
      await mongoose.connect(config.DATABASE_URL as string, mongooseOptions);
      Logging.info("Successfully connected to MongoDB database 🫙  🚀.");
      await redisConnection.connect();
      Logging.info("Successfully connected to Redis database 🫙  🚀.");
    } catch (error: any) {
      Logging.error(`Error connecting to database: ${error.message}`);
      process.exit(1);
    }
  };
  connect();
  mongoose.connection.on("disconnected", connect);
};
