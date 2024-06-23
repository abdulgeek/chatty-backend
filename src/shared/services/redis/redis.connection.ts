import { BaseCache } from "@service/redis/base.cache";
import Logging from "@service/logger/logging";
import { systemLogs } from "@service/logger/logger";

class RedisConnection extends BaseCache {
  constructor() {
    super("redisConnection");
  }

  async connect(): Promise<void> {
    try {
      await this.client.connect();
      const message = await this.client.ping()
      Logging.info(`Redis connection: ${message}`);
      systemLogs.info(message);
    } catch (error) {
      systemLogs.error(error);
      Logging.error(error);
    }
  }
}

export const redisConnection: RedisConnection = new RedisConnection();
