import { createInstance } from "localforage";

export interface Server {
  id: string;
  name: string;
  logo: string;
  createdAt: number;
}

const db = createInstance({ name: "servers" });

export async function createServer(name: string, logo: string) {
  let id = crypto.randomUUID();
  let server = { id, name, logo, createdAt: Date.now() } satisfies Server;
  await db.setItem(id, server);
  return server;
}

export async function listServers() {
  let serverIds = await db.keys();
  let servers: Server[] = [];
  for (let id of serverIds) {
    let server = await db.getItem<Server>(id);
    if (server) servers.push(server);
  }
  return servers.sort((a, b) => a.createdAt - b.createdAt);
}

export async function getServer(id: string) {
  return await db.getItem<Server>(id);
}
