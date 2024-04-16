import { createClient } from "redis";
import { config } from "@root/config";
import Logging from "@service/logger/logging";

export type RedisClient = ReturnType<typeof createClient>;

export abstract class BaseCache {
  client: RedisClient;

  constructor(cacheName: string) {
    this.client = createClient({ url: config.REDIS_HOST });
    this.cacheError();
  }

  private cacheError(): void {
    this.client.on("error", (error: unknown) => {
      Logging.error(error);
    });
  }
}
