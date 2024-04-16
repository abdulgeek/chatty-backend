import { config } from "@root/config";
import { BaseCache } from "@service/redis/base.cache";
import Logging from "@service/logger/logging";

class RedisConnection extends BaseCache {
  constructor() {
    super("redisConnection");
  }

  async connect(): Promise<void> {
    try {
      await this.client.connect();
      Logging.info(`Redis connection: ${await this.client.ping()}`);
    } catch (error) {
      Logging.error(error);
    }
  }
}

export const redisConnection: RedisConnection = new RedisConnection();
