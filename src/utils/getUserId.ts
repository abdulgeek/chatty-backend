/** Importing Libraries */
import { Response } from "express";
import Api from "../utils/helper";

/** Importing Dependencies */
import { ObjectId } from "mongoose";

/**
 * @description - To get a user from request body
 **/
export function getUserId(req: any, res: Response): ObjectId | any {
	const user = req?.user
	if (user && user?._id) {
		return user?._id;
	} else {
		return Api.notFound(req, res, "User ID not found in request");
	}
}
