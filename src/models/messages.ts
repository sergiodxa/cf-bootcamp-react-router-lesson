import { createInstance } from "localforage";

export interface Message {
  id: string;
  userId: string;
  channelId: string;
  content: string;
  createdAt: number;
}

const db = createInstance({ name: "messages" });

export async function createMessage(
  userId: string,
  channelId: string,
  content: string,
): Promise<Message> {
  await new Promise((r) => setTimeout(r, 200));
  let id = crypto.randomUUID();
  let message = {
    id,
    userId,
    channelId,
    content,
    createdAt: Date.now(),
  } satisfies Message;
  await db.setItem(id, message);
  return message;
}

export async function listMessages(channelId: string) {
  let messageIds = await db.keys();
  let messages: Message[] = [];
  for (let id of messageIds) {
    let message = await db.getItem<Message>(id);
    if (message && message.channelId === channelId) messages.push(message);
  }
  return messages.sort((a, b) => a.createdAt - b.createdAt);
}

export async function getMessage(id: string) {
  return await db.getItem<Message>(id);
}
