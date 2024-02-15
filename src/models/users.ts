import { createInstance } from "localforage";

export interface User {
  id: string;
  name: string;
  avatar: string;
  createdAt: number;
}

const db = createInstance({ name: "users" });

export async function createUsers(name: string, avatar: string) {
  let id = crypto.randomUUID();
  let user = { id, name, avatar, createdAt: Date.now() } satisfies User;
  await db.setItem(id, user);
  return user;
}

export async function listUsers() {
  let userIds = await db.keys();
  let users: User[] = [];
  for (let id of userIds) {
    let user = await db.getItem<User>(id);
    if (user) users.push(user);
  }
  return users.sort((a, b) => a.createdAt - b.createdAt);
}

export async function getUser(id: string) {
  return await db.getItem<User>(id);
}
