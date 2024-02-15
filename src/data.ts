import { Channel } from "./models/channels";
import { Message } from "./models/messages";
import { Server } from "./models/servers";
import { User } from "./models/users";

export default {
  users: [
    { name: "sergiodxa", avatar: "https://github.com/sergiodxa.png" },
    { name: "kentcdodds", avatar: "https://github.com/kentcdodds.png" },
    { name: "ryanflorence", avatar: "https://github.com/ryanflorence.png" },
  ],
  servers: [
    {
      name: "Remix.run",
      logo: "https://pbs.twimg.com/profile_images/1425897037602586625/ID6pueIo_400x400.png",
      channels: [
        {
          name: "General",
          messages: [
            { userId: "sergiodxa", content: "Hello, world!" },
            { userId: "ryanflorence", content: "Welcome" },
            { userId: "kentcdodds", content: "Hi there!" },
          ],
        },
        {
          name: "Help",
          messages: [
            {
              userId: "kentcdodds",
              content:
                "Quick question! How can I migrate this application to React Router?",
            },
            {
              userId: "sergiodxa",
              content: "@kentcdodds first start creating each route...",
            },
          ],
        },
      ],
    },
    {
      name: "Daffy",
      logo: "https://cdn.daffy.org/build/_assets/isotype-EYP45MR5.svg",
      channels: [
        { name: "General", messages: [] },
        { name: "Help", messages: [] },
      ],
    },
    {
      name: "Vite",
      logo: "https://vitejs.dev/logo.svg",
      channels: [
        { name: "General", messages: [] },
        { name: "Help", messages: [] },
      ],
    },
  ],
} satisfies {
  users: Array<Omit<User, "id" | "createdAt">>;
  servers: Array<
    Omit<Server, "id" | "createdAt"> & {
      channels: Array<
        Omit<Channel, "id" | "serverId" | "createdAt"> & {
          messages: Array<Omit<Message, "id" | "channelId" | "createdAt">>;
        }
      >;
    }
  >;
};
