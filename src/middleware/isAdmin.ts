/** Importing Libraries */
// import { NextFunction } from "express";
// import jwt from "jsonwebtoken";
// import expressAsyncHandler from "express-async-handler";

/** Importing Dependencies */
// import User from "../models/User";
// import Api, { Message } from "../utils/helper";
// import { JwtPayload } from "../interfaces/Jwt";

// export const isAdmin = expressAsyncHandler(
// 	async (req: any, res: any, next: NextFunction) => {
// 		let token: string | null;
// 		if (req?.headers?.authorization?.startsWith("Bearer")) {
// 			try {
// 				token = req.headers.authorization?.split(" ")[1];
// 				if (!token) {
// 					return Api.unauthorized(
// 						req,
// 						res,
// 						"There is no token attached to the header"
// 					);
// 				}
// 				const decoded = jwt.verify(
// 					token,
// 					String(process.env.JWT_KEY)
// 				) as JwtPayload;
// 				// find the user by ID
// 				const user = await User.findById(decoded?._id).select("-password");
// 				req.user = user as JwtPayload;
// 				if (req.user.role !== "Admin") {
// 					return Api.unauthorized(req, res, "Not authorized as admin");
// 				}
// 				next();
// 			} catch (error: any) {
// 				Api.serverError(req, res, error, Message.ServerError);
// 			}
// 		} else {
// 			return Api.unauthorized(
// 				req,
// 				res,
// 				"There is no token attached to the header"
// 			);
// 		}
// 	}
// );
