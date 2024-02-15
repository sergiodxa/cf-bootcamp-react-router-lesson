import { createInstance } from "localforage";

export interface Channel {
  id: string;
  serverId: string;
  name: string;
  createdAt: number;
}

const db = createInstance({ name: "channels" });

export async function createChannel(serverId: string, name: string) {
  let id = crypto.randomUUID();
  let channel = { id, serverId, name, createdAt: Date.now() } satisfies Channel;
  await db.setItem(id, channel);
  return channel;
}

export async function listChannels(serverId: string) {
  let channelIds = await db.keys();
  let channels: Channel[] = [];
  for (let id of channelIds) {
    let channel = await db.getItem<Channel>(id);
    if (channel && channel.serverId === serverId) channels.push(channel);
  }
  return channels.sort((a, b) => a.createdAt - b.createdAt);
}

export async function getChannel(id: string) {
  return await db.getItem<Channel>(id);
}
