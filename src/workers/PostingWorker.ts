import { Job, Queue, Worker } from "bullmq";
import { redis } from "config/redis";
import { TelegramAPI } from "services/telegramApi";

export const POSTING_WORKER = "PostingWorker";
export const SEND_MESSAGE_JOB = "sendMessage";
type PostingMessage = {
  text: string,
  entities: any[],
  buttonText: string,
  buttonUrl: string
}

const postingWorker = new Worker(POSTING_WORKER, async (job: Job<{ message: PostingMessage, channelId: string, botToken: string }>) => {
  console.log("Processing job", job.id);

  const { message, channelId, botToken } = job.data;

  try {
    const api = new TelegramAPI(botToken);
    await api.sendMessage(channelId, message.text, {
      entities: message.entities,
      reply_markup: {
        inline_keyboard: message.buttonText && message.buttonUrl ? [
          [{ text: message.buttonText, url: message.buttonUrl }]
        ] : []
      },
      disable_web_page_preview: true,
    });
  } catch (error) {
    console.error("Error while sending message", error);
  }
}, {
  connection: redis,
  concurrency: 2,
  removeOnComplete: {
    age: 3600,
    count: 100
  },
  removeOnFail: {
    age: 3600,
    count: 100
  }
});

postingWorker.on("error", (error) => {
  console.error("Error in posting worker", error);
});

export async function createMessageJob(message: PostingMessage, channelId: number, botToken: string, delayInSeconds: number) {
  const myQueue = new Queue(POSTING_WORKER, { connection: redis });

  await myQueue.add(SEND_MESSAGE_JOB, { message, channelId, botToken }, { delay: delayInSeconds * 1000 });
  console.log("Job added to queue");
}