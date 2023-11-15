// /** Importing Libraries */
// import * as dotenv from "dotenv";

// /** Importing dependencies */
// import Logging from "../utils/logging";
// import { systemLogs } from "../utils/Logger";
// import { Redis } from "ioredis";
// import { REDIS_URL } from "./env";

// dotenv.config();

// const redistClient = () => {
//     if (REDIS_URL) {
//         Logging.info("Successfully Connected to Redis 🛟  ✅");
//         systemLogs.info("Successfully Connected to Redis 🛟  ✅");
//         return REDIS_URL;
//     } else {
//         Logging.error(`Redis Connection Failed  ❌`);
//         systemLogs.error(`Redis Connection Failed  ❌`);
//     }
// }

// export const redis = new Redis(redistClient())