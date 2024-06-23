import { createClient } from "redis";
import { config } from "@root/config";
import { systemLogs } from "@service/logger/logger";

export type RedisClient = ReturnType<typeof createClient>;

export abstract class BaseCache {
  client: RedisClient;
  log: any;

  constructor(cacheName: string) {
    this.client = createClient({ url: config.REDIS_HOST });
    this.log = systemLogs.info(cacheName);
    this.cacheError();
  }

  private cacheError(): void {
    this.client.on("error", (error: unknown) => {
      systemLogs.error(error);
    });
  }
}
