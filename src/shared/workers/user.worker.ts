import { userService } from '@service/db/user.service';
import Logging from '@service/logger/logging';
import { DoneCallback, Job } from 'bull';


class UserWorker {
  async addUserToDB(job: Job, done: DoneCallback): Promise<void> {
    try {
      const { value } = job.data;
      // Add method to send data to DB
      await userService.addUserData(value);
      job.progress(100);
      done(null, job.data);
      Logging.info('Adding user to DB');
    } catch (error) {
      Logging.error(error);
      done(error as Error);
    }
  }
}

export const userWorker: UserWorker = new UserWorker();
