// /** Importing Libraries */
// import jwt from "jsonwebtoken";
// import expressAsyncHandler from "express-async-handler";

// /** Importing Dependencies */
// import { redis } from "../config/connectRedis";
// import Api, { Message } from "../utils/helper";
// import { updateAccessToken } from "../controllers/user.controller";
// import { JWT_ACCESS_SECRET_KEY } from "@root/config/env";

// /**
//  * @description - Middleware for user authentication
//  */
// export const isAutheticated = expressAsyncHandler(async (req: any, res, next) => {
//     const access_token = req?.cookies?.access_token;
//     if (!access_token) {
//         return Api.notFound(req, res, 'Please login to access this resource')
//     }
//     const decoded: any = jwt.verify(access_token, JWT_ACCESS_SECRET_KEY as string)
//     if (!decoded) {
//         return Api.notFound(req, res, 'Access token is not valid')
//     }
//     const user = await redis.get(decoded.id)
//     if (!user) {
//         return Api.notFound(req, res, 'User not found')
//     }
//     // check if the access token is expired
//     if (decoded.exp && decoded.exp <= Date.now() / 1000) {
//         try {
//             await updateAccessToken(req, res, next);
//         } catch (error) {
//             return next(error);
//         }
//     } else {
//         const user = await redis.get(decoded.id);

//         if (!user) {
//             return Api.invalid(req, res, null, 'Please login to access this resource')
//         }

//         req.user = JSON.parse(user);
//         next()
//     }
// })

// /**
//  * @description - Validate user role
//  */
// export const authorizeRoles = (...roles: string[]) => {
//     return (req, res, next) => {
//         if (!roles.includes((req.user)?.role || '')) {
//             return next(Api.badRequest(res, `Role: ${(req.user)?.role} is not allowed to access this resource`, Message.AccessDenied))
//         }
//         next()
//     }
// }