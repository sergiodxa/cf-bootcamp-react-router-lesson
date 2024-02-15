import { Server, listServers } from "./models/servers";
import { Channel, listChannels } from "./models/channels";
import { Message, createMessage, listMessages } from "./models/messages";
import clsx from "clsx";
import { User, listUsers } from "./models/users";
import { Spinner } from "./components/spinner";

import {
  Form,
  NavLink,
  Outlet,
  RouterProvider,
  createBrowserRouter,
  redirect,
  useLoaderData,
  useNavigation,
  useParams,
} from "react-router-dom";

const router = createBrowserRouter([
  {
    element: <Root />,
    async loader() {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      let servers = await listServers();
      return { servers };
    },
    children: [
      {
        index: true,
        async loader() {
          let servers = await listServers();
          return redirect(`/${servers[0].id}`);
        },
      },
      {
        path: ":serverId",
        element: <Channels />,
        async loader({ params }) {
          let serverId = params.serverId;
          if (!serverId) return redirect("/");
          let channels = await listChannels(serverId);
          return { channels };
        },
        children: [
          {
            index: true,
            async loader({ params }) {
              let serverId = params.serverId;
              if (!serverId) return redirect("/");
              let channels = await listChannels(serverId);
              return redirect(`/${serverId}/${channels[0].id}`);
            },
          },
          {
            path: ":channelId",
            element: (
              <div className="flex-grow flex flex-col w-full">
                <Messages />
                <CreateMessageForm />
              </div>
            ),
            async loader({ params }) {
              let channelId = params.channelId;
              if (!channelId) return redirect("/");
              let messages = await listMessages(channelId);
              let users = await listUsers();
              return { messages, users };
            },
            async action({ request, params }) {
              let channelId = params.channelId;
              if (!channelId) return redirect("/");

              let users = await listUsers();
              let activeUser = users.find((user) => user.name === "sergiodxa");
              if (!activeUser) throw new Error("Missing active user");

              let formData = await request.formData();

              let content = formData.get("content");
              if (!content) throw new Error("No content");

              let message = await createMessage(
                activeUser.id,
                channelId,
                content as string,
              );

              return { message };
            },
          },
        ],
      },
    ],
  },
]);

export function App() {
  return (
    <RouterProvider
      router={router}
      fallbackElement={
        <div className="flex w-full h-screen bg-slate-50 items-center justify-center">
          <Spinner className="size-20" />
        </div>
      }
    />
  );
}

function Root() {
  let { servers } = useLoaderData() as { servers: Server[] };

  return (
    <div className="flex w-full h-screen bg-slate-50">
      <ul className="flex flex-col gap-4 p-4 bg-slate-100 flex-shrink-0">
        {servers.map((server) => {
          return (
            <li key={server.id}>
              <NavLink to={`/${server.id}`}>
                {({ isActive }) => {
                  return (
                    <img
                      src={server.logo}
                      alt={server.name}
                      className={clsx(
                        "size-12 rounded-full transition-all bg-white",
                        {
                          "ring-4 ring-slate-400": isActive,
                          "ring-2 ring-slate-200 hover:ring-slate-300 hover:ring-4":
                            !isActive,
                        },
                      )}
                    />
                  );
                }}
              </NavLink>
            </li>
          );
        })}
      </ul>

      <Outlet />
    </div>
  );
}

function Channels() {
  let { channels } = useLoaderData() as { channels: Channel[] };
  let { serverId } = useParams<{ serverId: string }>();

  return (
    <>
      <ul className="flex-grow flex-shrink-0 w-full max-w-xs bg-slate-200 text-slate-950 p-4">
        {channels.map((channel) => (
          <li key={channel.id}>
            <NavLink
              to={`/${serverId}/${channel.id}`}
              className={({ isActive }) => clsx({ "font-medium": isActive })}
            >
              {channel.name}
            </NavLink>
          </li>
        ))}
      </ul>

      <Outlet />
    </>
  );
}

function Messages() {
  let { messages, users } = useLoaderData() as {
    messages: Message[];
    users: User[];
  };

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

function CreateMessageForm() {
  let navigation = useNavigation();

  return (
    <Form
      method="post"
      className="p-4 flex flex-shrink-0 w-full items-start gap-4"
    >
      <textarea
        name="content"
        rows={1}
        className="border-2 border-slate-300 px-4 py-2 resize-none rounded-lg flex-grow focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 disabled:bg-slate-200 duration-200 delay-100"
        disabled={navigation.state !== "idle"}
      />
      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded-md flex-shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 disabled:bg-slate-200 disabled:text-slate-950 font-medium duration-200 delay-100"
        disabled={navigation.state !== "idle"}
      >
        Send
      </button>
    </Form>
  );
}
