import { useEffect, useState } from "react";
import { Server, listServers } from "./models/servers";
import { Channel, listChannels } from "./models/channels";
import { Message, createMessage, listMessages } from "./models/messages";
import clsx from "clsx";
import { User, listUsers } from "./models/users";
import { Spinner } from "./components/spinner";
import { flushSync } from "react-dom";

export function App() {
  let [users, setUsers] = useState<User[]>([]);
  let [activeServer, setActiveServer] = useState<Server["id"] | null>(null);
  let [activeChannel, setActiveChannel] = useState<Channel["id"] | null>(null);

  let [revalidateMessages, setRevalidateMessages] = useState(Symbol());

  useEffect(() => {
    listUsers().then(setUsers);
  }, []);

  let activeUser = users.find((user) => user.name === "sergiodxa");

  if (users.length === 0 || !activeUser) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <Spinner className="size-20" />
      </div>
    );
  }

  return (
    <div className="flex w-full h-screen bg-slate-50">
      <ServerList serverId={activeServer} onServerSelect={setActiveServer} />

      {activeServer && (
        <ChannelList
          channelId={activeChannel}
          serverId={activeServer}
          onChannelSelect={setActiveChannel}
        />
      )}

      {activeChannel && (
        <div className="flex-grow flex flex-col w-full">
          <MessageList
            channelId={activeChannel}
            users={users}
            revalidate={revalidateMessages}
          />
          <CreateMessageForm
            channelId={activeChannel}
            userId={activeUser.id}
            onMessageCreated={() => setRevalidateMessages(Symbol())}
          />
        </div>
      )}
    </div>
  );
}

type ServerListProps = {
  serverId: Server["id"] | null;
  onServerSelect(serverId: Server["id"]): void;
};

function ServerList({ serverId, onServerSelect }: ServerListProps) {
  let [servers, setServers] = useState<Server[]>([]);

  useEffect(() => {
    listServers().then(setServers);
  }, []);

  return (
    <ul className="flex flex-col gap-4 p-4 bg-slate-100 flex-shrink-0">
      {servers.map((server) => {
        let isActive = server.id === serverId;
        return (
          <li key={server.id} onClick={() => onServerSelect(server.id)}>
            <img
              src={server.logo}
              alt={server.name}
              className={clsx("size-12 rounded-full transition-all bg-white", {
                "ring-4 ring-slate-400": isActive,
                "ring-2 ring-slate-200 hover:ring-slate-300 hover:ring-4":
                  !isActive,
              })}
            />
          </li>
        );
      })}
    </ul>
  );
}

type ChannelListProps = {
  serverId: Server["id"];
  channelId: Channel["id"] | null;
  onChannelSelect(channelId: Channel["id"]): void;
};

function ChannelList({
  serverId,
  channelId,
  onChannelSelect,
}: ChannelListProps) {
  let [channels, setChannels] = useState<Channel[]>([]);

  useEffect(() => {
    listChannels(serverId).then(setChannels);
  }, [serverId]);

  return (
    <ul className="flex-grow flex-shrink-0 w-full max-w-xs bg-slate-200 text-slate-950 p-4">
      {channels.map((channel) => (
        <li
          key={channel.id}
          onClick={() => onChannelSelect(channel.id)}
          className={clsx({ "font-medium": channel.id === channelId })}
        >
          {channel.name}
        </li>
      ))}
    </ul>
  );
}

type MessageListProps = {
  channelId: Channel["id"];
  users: User[];
  revalidate: symbol;
};

function MessageList({ channelId, users, revalidate }: MessageListProps) {
  let [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    if (channelId) {
      listMessages(channelId).then(setMessages);
    }
  }, [channelId, revalidate]);

  return (
    <ul className="flex-grow flex flex-col gap-2 p-4 overflow-auto">
      {messages.map((message) => {
        let user = users.find((user) => message.userId === user.id);
        return (
          <li
            key={message.id}
            className="flex flex-col gap-0.5"
            id={message.id}
          >
            <strong className="font-medium">{user?.name ?? "Unknown"}:</strong>
            <p className="pl-4">{message.content}</p>
          </li>
        );
      })}
    </ul>
  );
}

type CreateMessageFormProps = {
  channelId: Channel["id"];
  userId: User["id"];
  onMessageCreated(): void;
};

function CreateMessageForm({
  channelId,
  userId,
  onMessageCreated,
}: CreateMessageFormProps) {
  let [status, setStatus] = useState<"idle" | "pending">("idle");

  return (
    <form
      method="post"
      onSubmit={handleForm}
      className="p-4 flex flex-shrink-0 w-full items-start gap-4"
    >
      <textarea
        name="content"
        rows={1}
        className="border-2 border-slate-300 px-4 py-2 resize-none rounded-lg flex-grow focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 disabled:bg-slate-200 duration-200 delay-100"
        disabled={status === "pending"}
      />
      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded-md flex-shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 disabled:bg-slate-200 disabled:text-slate-950 font-medium duration-200 delay-100"
        disabled={status === "pending"}
      >
        Send
      </button>
    </form>
  );

  async function handleForm(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    let form = event.currentTarget;
    let formData = new FormData(form);
    let content = formData.get("content") as string;
    setStatus("pending");
    await createMessage(userId, channelId, content);
    onMessageCreated();
    flushSync(() => setStatus("idle"));
    form.reset();
  }
}
