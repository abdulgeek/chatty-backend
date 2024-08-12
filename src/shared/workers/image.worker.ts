import { DoneCallback, Job } from 'bull';
import Logging from '@service/logger/logging';
import { imageService } from '@service/db/image.service';


class ImageWorker {
  async addUserProfileImageToDB(job: Job, done: DoneCallback): Promise<void> {
    try {
      const { key, value, imgId, imgVersion } = job.data;
      await imageService.addUserProfileImageToDB(key, value, imgId, imgVersion);
      job.progress(100);
      done(null, job.data);
    } catch (error) {
      Logging.error(error);
      done(error as Error);
    }
  }

  async updateBGImageInDB(job: Job, done: DoneCallback): Promise<void> {
    try {
      const { key, imgId, imgVersion } = job.data;
      await imageService.addBackgroundImageToDB(key, imgId, imgVersion);
      job.progress(100);
      done(null, job.data);
    } catch (error) {
      Logging.error(error);
      done(error as Error);
    }
  }

  async addImageToDB(job: Job, done: DoneCallback): Promise<void> {
    try {
      const { key, imgId, imgVersion } = job.data;
      await imageService.addImage(key, imgId, imgVersion, '');
      job.progress(100);
      done(null, job.data);
    } catch (error) {
      Logging.error(error);
      done(error as Error);
    }
  }

  async removeImageFromDB(job: Job, done: DoneCallback): Promise<void> {
    try {
      const { imageId } = job.data;
      await imageService.removeImageFromDB(imageId);
      job.progress(100);
      done(null, job.data);
    } catch (error) {
      Logging.error(error);
      done(error as Error);
    }
  }
}

export const imageWorker: ImageWorker = new ImageWorker();
