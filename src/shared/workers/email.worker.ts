import mailTransport from '@service/emails/mail.transport';
import Logging from '@service/logger/logging';
import { DoneCallback, Job } from 'bull';


class EmailWorker {
  async addNotificationEmail(job: Job, done: DoneCallback): Promise<void> {
    try {
      const { template, receiverEmail, subject } = job.data;
      await mailTransport.sendEmail(receiverEmail, subject, template);
      job.progress(100);
      done(null, job.data);
      Logging.info('Email sent');
    } catch (error) {
      Logging.error(error);
      done(error as Error);
    }
  }
}

export const emailWorker: EmailWorker = new EmailWorker();
