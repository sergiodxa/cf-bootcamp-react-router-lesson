import React from "react";
import ReactDOM from "react-dom/client";
import "./styles.css";

import { createServer } from "./models/servers";
import { createUsers, listUsers } from "./models/users";
import { createChannel } from "./models/channels";
import { createMessage } from "./models/messages";

import { App } from "./initial";
import data from "./data";

if (localStorage.getItem("mocked") !== "true") {
  for await (let user of data.users) await createUsers(user.name, user.avatar);

  let users = await listUsers();

  for await (let server of data.servers) {
    let { id: serverId } = await createServer(server.name, server.logo);
    for await (let channel of server.channels) {
      let { id: channelId } = await createChannel(serverId, channel.name);
      for await (let message of channel.messages) {
        let user = users.find((user) => user.name === message.userId);
        if (user) await createMessage(user.id, channelId, message.content);
      }
    }
  }

  localStorage.setItem("mocked", "true");
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
