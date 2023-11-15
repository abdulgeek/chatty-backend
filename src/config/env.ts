import dotenv from "dotenv";
dotenv.config();

export const MONGO_USERNAME = process.env.MONGO_USERNAME || ""
export const MONGO_PASSWORD = process.env.MONGO_PASSWORD || ""
export const MONGO_DB = process.env.MONGO_DB
export const SERVER_PORT = process.env.SERVER_PORT || 5001
export const CLOUD_API_KEY = process.env.CLOUD_API_KEY
export const CLOUD_API_SECRET = process.env.CLOUD_API_SECRET
export const CLOUD_NAME = process.env.CLOUD_NAME
export const EMAIL = process.env.EMAIL
export const PASSWORD = process.env.PASSWORD
export const NODE_ENV = process.env.NODE_ENV
export const DOMAIN = process.env.DOMAIN
export const JWT_ACCESS_SECRET_KEY = process.env.JWT_ACCESS_SECRET_KEY
export const JWT_REFRESH_SECRET_KEY = process.env.JWT_REFRESH_SECRET_KEY
export const ACCESS_TOKEN_EXPIRE = process.env.ACCESS_TOKEN_EXPIRE
export const REFRESH_TOKEN_EXPIRE = process.env.REFRESH_TOKEN_EXPIRE
export const DEFAULT_STATUS = process.env.DEFAULT_STATUS
export const DEFAULT_PICTURE = process.env.DEFAULT_PICTURE
export const CLIENT_ENDPOINT = process.env.CLIENT_ENDPOINT
export const DEFAULT_GROUP_PICTURE = process.env.DEFAULT_GROUP_PICTURE
export const REDIS_URL = process.env.REDIS_URL
export const VDOCIPHER_API_SECRET = process.env.VDOCIPHER_API_SECRET
export const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY
export const STRIPE_PUBLISHABLE_KEY = process.env.STRIPE_PUBLISHABLE_KEY
export const SECRET_ONE = process.env.SECRET_ONE
export const SECRET_TWO = process.env.SECRET_TWO
export const REDIS_HOST = process.env.REDIS_HOST