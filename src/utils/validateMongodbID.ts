/** Importing Libraries */
import { Response } from "express";
import mongoose from "mongoose";

/** Importing Dependencies */
import Api from "./helper";

/** Function to Validate MongoDB ID */
export const validateMongodbID = (req: any, res: Response, id: any) => {
	if (!mongoose.Types.ObjectId.isValid(id))
		Api.notFound(req, res, "ID is not valid or found");
};
