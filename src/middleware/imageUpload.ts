/** Importing Libraries */
import { Response, NextFunction } from "express";
import fs from "fs";

/** Importing Dependencies */
import Api, { Message } from "../utils/helper";
import { UploadedFile } from "express-fileupload";

/** types of image, videos, music and document files */
const imageTypes: string[] = [
	"image/jpeg",
	"image/png",
	"image/gif",
	"image/webp",
];
const videoTypes: string[] = ["video/mp4", "video/m4v", "video/mov"];
const musicTypes: string[] = ["audio/mp3", "audio/mpeg", "audio/m4a"];
const docTypes: string[] = [
	"application/pdf",
	"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
	"application/vnd.openxmlformats-officedocument.presentationml.presentation",
	"text/plain",
	"application/vnd.ms-excel",
	"application/vnd.ms-word",
];

/**
 * @description - To Remove temporary files/images and videos from the location
 **/
const removeTmp = (path: string) => {
	fs.unlink(path, (err) => {
		if (err) throw err;
	});
};

/**
 * @description - To handle multiple images and size of it
 **/
export const handleFileUpload = async (
	req: any,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		if (!req.files || Object.values(req.files).flat().length === 0) {
			return Api.badRequest(res, "No files selected", Message.ImageNotFound);
		}
		const files = Object.values(req.files).flat() as UploadedFile[];
		files.forEach((file) => {
			if (
				!(
					imageTypes.includes(file.mimetype) ||
					videoTypes.includes(file.mimetype) ||
					musicTypes.includes(file.mimetype) ||
					docTypes.includes(file.mimetype)
				)
			) {
				removeTmp(file.tempFilePath);
				return Api.badRequest(
					res,
					"Unsupported format",
					Message.ValidationError
				);
			}
			if (videoTypes.includes(file.mimetype)) {
				const ext = file?.name?.split(".").pop();
				if (ext && !["mp4", "mov", "avi"].includes(ext.toLowerCase())) {
					removeTmp(file.tempFilePath);
					return Api.badRequest(
						res,
						"Invalid video format. Please upload a valid MP4, MOV or AVI file.",
						Message.ValidationError
					);
				}
				if (file.size > 1024 * 1024 * 50) {
					// set a higher limit for video file size
					removeTmp(file.tempFilePath);
					return Api.badRequest(
						res,
						"Video file size is too large. Maximum file size allowed is 50MB",
						Message.ValidationError
					);
				}
				// add additional validation for video duration if needed
			} else if (file.size > 1024 * 1024 * 10) {
				// set a lower limit for other file types
				removeTmp(file.tempFilePath);
				return Api.badRequest(
					res,
					"File size is too large. Maximum file size allowed is 10MB",
					Message.ValidationError
				);
			}
			// For document files, check if file extension matches the mime type
			// For document files, check if file extension matches the mime type
			if (docTypes.includes(file.mimetype)) {
				const ext: any = file?.name?.split(".").pop();
				const specialCases: any = {
					pdf: "application/pdf",
					docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
					pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
					txt: "text/plain",
					xls: "application/vnd.ms-excel",
					doc: "application/vnd.ms-word",
				};
				if (ext && file.mimetype !== specialCases[ext.toLowerCase()]) {
					removeTmp(file.tempFilePath);
					return Api.badRequest(
						res,
						"Invalid file format. Check file extension and try again.",
						Message.ValidationError
					);
				}
			}

		});
		next();
	} catch (error) {
		return Api.serverError(req, res, error, Message.ServerError);
	}
};
