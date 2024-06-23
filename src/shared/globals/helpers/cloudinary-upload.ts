import Logging from "@service/logger/logging";
import cloudinary, { UploadApiResponse, UploadApiErrorResponse } from "cloudinary";

export const uploads = (file: string, public_id?: string, overwrite?: boolean, invalidate?: boolean): Promise<UploadApiResponse | UploadApiErrorResponse | undefined> => {
  const options: { public_id?: string, overwrite?: boolean, invalidate?: boolean } = {};
  if (public_id) options.public_id = public_id;
  if (overwrite !== undefined) options.overwrite = overwrite;
  if (invalidate !== undefined) options.invalidate = invalidate;

  return new Promise((resolve, reject) => {
    cloudinary.v2.uploader.upload(file, options)
      .then(result => resolve(result))
      .catch(error => {
        if (error) console.error(error);
        Logging.error(error);
        reject(error);
      });
  });
};
