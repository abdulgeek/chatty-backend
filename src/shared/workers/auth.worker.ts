import { authService } from '@service/db/auth.service';
import { systemLogs } from '@service/logger/logger';
import Logging from '@service/logger/logging';
import { DoneCallback, Job } from 'bull';


class AuthWorker {
  async addAuthUserToDB(job: Job, done: DoneCallback): Promise<void> {
    try {
      const { value } = job.data;
      // Add method to send data to DB
      await authService.createAuthUser(value);
      job.progress(100);
      done(null, job.data);
      systemLogs.info('Adding auth user to DB')
      Logging.info('Adding auth user to DB');
    } catch (error) {
      systemLogs.error('Error adding auth user to DB')
      Logging.error(error);
      done(error as Error);
    }
  }
}

export const authWorker: AuthWorker = new AuthWorker();
