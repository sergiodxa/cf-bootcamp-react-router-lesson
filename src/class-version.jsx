import {
  createBrowserRouter,
  Form,
  json,
  Link,
  Navigate,
  NavLink,
  Outlet,
  redirect,
  RouterProvider,
  useActionData,
  useLoaderData,
  useLocation,
  useNavigation,
  useSearchParams,
  useSubmit,
} from "react-router-dom";
import { Spinner } from "./components/spinner";
import {
  createNote,
  deleteNote,
  getAllNotes,
  getNoteById,
  populate,
  updateNote,
} from "./models/notes";

populate();

const router = createBrowserRouter([
  {
    element: <Root />,
    children: [
      { index: true, element: <Navigate to="notes" /> },
      {
        path: "notes",
        element: <NotesLayout />,
        async loader({ request }) {
          let notes = await getAllNotes();

          let url = new URL(request.url);

          let sort = url.searchParams.get("sort") ?? "id";
          let dir = url.searchParams.get("dir") ?? "desc";

          let sorted = [...notes].sort((noteA, noteB) => {
            if (sort in noteA) {
              if (dir === "desc") return noteA[sort].localeCompare(noteB[sort]);
              else return noteB[sort].localeCompare(noteA[sort]);
            } else {
              if (dir === "desc") return noteA.id.localeCompare(noteB.id);
              else return noteB.id.localeCompare(noteA.id);
            }
          });

          return json(sorted);
        },
        children: [
          { index: true, element: <h1>Pick a note at the left</h1> },
          {
            path: "new",
            element: <NoteForm />,
            async action({ request }) {
              let { searchParams } = new URL(request.url);

              let formData = await request.formData();

              let title = formData.get("title");

              if (title.length < 3) {
                return json({ message: "Title is too short" });
              }

              let body = formData.get("body");

              let note = await createNote(title, body);

              return redirect(`/notes/${note.id}?${searchParams}`);
            },
          },
          {
            path: ":noteId",
            element: <NotesDetail />,
            async loader({ params }) {
              let note = await getNoteById(params.noteId);
              return json(note);
            },
            async action({ request }) {
              let formData = await request.formData();
              let noteId = formData.get("id");
              await deleteNote(noteId);

              let { searchParams } = new URL(request.url);
              return redirect(`/notes?${searchParams}`);
            },
            errorElement: <h1>Note not found</h1>,
          },
          {
            path: ":noteId/edit",
            element: <NoteForm />,
            async loader({ params }) {
              let note = await getNoteById(params.noteId);
              return json(note);
            },
            async action({ request, params }) {
              let formData = await request.formData();
              let noteId = params.noteId;
              let title = formData.get("title");
              let body = formData.get("body");

              if (title.length < 3) {
                return json({ message: "Title is too short" });
              }

              await updateNote(noteId, title, body);

              let { searchParams } = new URL(request.url);

              return redirect(`/notes/${noteId}?${searchParams}`);
            },
          },
        ],
      },
      { path: "*", element: <h1>Not found</h1> },
    ],
  },
]);

export function App() {
  return <RouterProvider router={router} />;
  // let [noteId, setNoteId] = useState(null);

  // return (
  //   <Root>
  //     <NotesLayout setNoteId={setNoteId}>
  //       {noteId === null ? (
  //         <h1>Pick a note at the left</h1>
  //       ) : (
  //         <NotesDetail noteId={noteId} />
  //       )}
  //     </NotesLayout>
  //   </Root>
  // );
}

/**
 *
 * @param {Object} props
 * @param {import("react").ReactNode} props.children
 * @returns
 */
function Root() {
  let { state } = useNavigation();

  return (
    <main>
      <header>
        <h1>codigofacilito Bootcamp React - Clase de React Router</h1>
      </header>

      {state !== "idle" ? <Spinner /> : null}
      <Outlet />
    </main>
  );
}

/**
 *
 * @param {Object} props
 * @param {import("react").ReactNode} props.children
 * @param {import("react").Dispatch<string>} props.setNoteId
 * @returns
 */
function NotesLayout() {
  let notes = useLoaderData();
  let { pathname } = useLocation();
  let [searchParams] = useSearchParams();
  let submit = useSubmit();

  let sort = searchParams.get("sort") ?? "id";
  let dir = searchParams.get("dir") ?? "desc";

  return (
    <section>
      <nav>
        <Form
          action={pathname}
          onChange={(event) => {
            submit(event.currentTarget, { action: pathname });
          }}
        >
          <label>
            Sort by:
            <select name="sort" defaultValue={sort}>
              <option value="id">ID</option>
              <option value="title">Title</option>
              <option value="body">Body</option>
              <option value="createdAt">Created at</option>
            </select>
          </label>

          <label>
            Direction:
            <select name="dir" defaultValue={dir}>
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>
          </label>

          <button>Sort</button>
        </Form>

        <ul>
          <li>
            <Link to={`new?${searchParams}`}>Create a note</Link>
          </li>

          {notes.map((note) => {
            return (
              <li key={note.id}>
                <NavLink to={`${note.id}?${searchParams}`}>
                  {note.title}
                </NavLink>
              </li>
            );
          })}

          <li>
            <button onClick={() => setNoteId("RANDOM")}>
              Not found example
            </button>
          </li>
        </ul>
      </nav>

      <Outlet />
    </section>
  );
}

function NotesDetail() {
  let note = useLoaderData();
  let [searchParams] = useSearchParams();

  let date = new Date(note.createdAt);

  return (
    <article>
      <h2>{note.title}</h2>
      <p>{note.body}</p>
      <time dateTime={note.createdAt}>
        {date.toLocaleDateString(window.navigator.languages, {
          year: "numeric",
          month: "long",
          day: "2-digit",
        })}
      </time>

      <Form method="post" action={`?${searchParams}`}>
        <input type="hidden" name="id" value={note.id} />
        <button>Delete</button>
      </Form>

      <Link to={`edit?${searchParams}`}>Edit note</Link>
    </article>
  );
}

function NoteForm() {
  let note = useLoaderData();
  let [searchParams] = useSearchParams();
  let actionData = useActionData();
  let { key } = useLocation();

  return (
    <Form method="post" action={`?${searchParams}`}>
      <h2>Note form</h2>

      {actionData ? <p>{actionData.message}</p> : null}

      <label>
        Title
        <input
          type="text"
          name="title"
          required
          defaultValue={note?.title}
          key={key}
        />
      </label>

      <label>
        Body
        <textarea name="body" required defaultValue={note?.body} key={key} />
      </label>

      <button>Submit</button>
    </Form>
  );
}
