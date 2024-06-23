import Logging from "@service/logger/logging";
import Queue, { Job } from "bull";
import { createBullBoard } from "@bull-board/api";
import { BullAdapter } from "@bull-board/api/bullAdapter";
import { ExpressAdapter } from "@bull-board/express";
import { config } from "@root/config";
import { systemLogs } from "@service/logger/logger";
import { IAuthJob } from "@auth/interfaces/auth.interface";

type IBaseJobData = | IAuthJob

let bullAdapters: BullAdapter[] = [];

export let serverAdapter: ExpressAdapter;

export abstract class BaseQueue {
  queue: Queue.Queue;

  constructor(queueName: string) {
    this.queue = new Queue(queueName, `${config.REDIS_HOST}`);
    bullAdapters.push(new BullAdapter(this.queue));
    bullAdapters = [...new Set(bullAdapters)];
    serverAdapter = new ExpressAdapter();
    serverAdapter.setBasePath('/queues')

    createBullBoard({
      queues: bullAdapters,
      serverAdapter
    })

    systemLogs.info(`Queue ${queueName} created`);
    Logging.info(`Queue ${queueName} created`);

    this.queue.on('global:completed', (job: Job) => {
      systemLogs.info(`Job ${job.name} completed`);
      Logging.info(`Job ${job.name} completed`);
    })

    this.queue.on('global:stalled', (job: Job) => {
      systemLogs.info(`Job ${job.name} stalled`);
      Logging.info(`Job ${job.name} stalled`);
    })
  }

  protected addJob(name: string, data: any): void {
    this.queue.add(name, data, { attempts: 3, backoff: { type: 'fixed', delay: 5000 } });
  }

  protected processJob(name: string, concurrency: number, callback: Queue.ProcessCallbackFunction<void>): void {
    this.queue.process(name, concurrency, callback);
  }

}
