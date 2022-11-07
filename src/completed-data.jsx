import {
  Navigate,
  Link,
  Outlet,
  useSearchParams,
  json,
  useLoaderData,
  Form,
  useLocation,
  redirect,
  useNavigation,
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import {
  createNote,
  deleteNote,
  getAllNotes,
  getNoteById,
} from "./models/notes";

let router = createBrowserRouter([
  {
    element: <Root />,
    children: [
      { index: true, element: <Navigate to="/notes" /> },
      {
        path: "notes",
        element: <NotesLayout />,
        loader: notesLayoutLoader,
        children: [
          { index: true, element: <h1>Pick a note at the left</h1> },
          { path: "new", element: <NoteForm />, action: notesFormAction },
          {
            path: ":noteId",
            element: <NotesDetail />,
            loader: notesDetailsLoader,
            action: notesDetailsAction,
            errorElement: <h1>Note not found, select another one</h1>,
          },
        ],
      },
      { path: "*", element: <h2>Not found</h2> },
    ],
  },
]);

export function App() {
  return <RouterProvider router={router} />;
}

function Root() {
  let navigation = useNavigation();
  return (
    <main>
      <header>
        <h1>codigofacilito Bootcamp React - Clase de React Router</h1>
      </header>
      {navigation.state !== "idle" && <p>Loading...</p>}
      <Outlet />
    </main>
  );
}

function NotesDetail() {
  /**
   * @type {Record<string, import("./models/notes").Note>}
   */
  let { note } = useLoaderData();
  let [searchParams] = useSearchParams();

  if (!note) {
    return <h1>Note not found, select another one</h1>;
  }

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
    </article>
  );
}

/**
 *
 * @param {import("@remix-run/router/utils").DataFunctionArgs} args
 * @returns
 */
async function notesDetailsLoader({ params }) {
  let note = await getNoteById(params.noteId);
  if (!note) return json({ note: null }, { status: 404 });
  return json({ note });
}

/**
 *
 * @param {import("@remix-run/router/utils").DataFunctionArgs} args
 * @returns
 */
async function notesDetailsAction({ request, signal }) {
  let { searchParams } = new URL(request.url);
  let formData = await request.formData();
  await deleteNote(formData.get("id"));
  return redirect(`/notes?${searchParams}`);
}

export default function NotesLayout() {
  /**
   * @type {Record<string, import("./models/notes").Note[]>}
   */
  let { notes } = useLoaderData();
  let [searchParams] = useSearchParams();
  let { pathname } = useLocation();

  return (
    <section>
      <nav>
        <Form method="get" action={pathname}>
          <label>
            Sort by:
            <select name="sort" defaultValue={searchParams.get("sort")}>
              <option value="id">ID</option>
              <option value="title">Title</option>
              <option value="body">Body</option>
              <option value="createdAt">Created at</option>
            </select>
          </label>

          <label>
            Direction:
            <select name="dir" defaultValue={searchParams.get("dir")}>
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
                <Link to={`${note.id}?${searchParams}`}>{note.title}</Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <Outlet />
    </section>
  );
}

/**
 *
 * @param {import("@remix-run/router/utils").DataFunctionArgs} args
 * @returns
 */
async function notesLayoutLoader({ request }) {
  let { searchParams } = new URL(request.url);
  let sort = searchParams.get("sort") || "id";
  let dir = searchParams.get("dir") || "desc";

  let notes = await getAllNotes();

  let sorted = notes.sort((noteA, noteB) => {
    if (sort in noteA) {
      if (dir === "desc") {
        return noteA[sort].localeCompare(noteB[sort]);
      } else return noteB[sort].localeCompare(noteA[sort]);
    } else {
      if (dir === "desc") return noteA.id.localeCompare(noteB.id);
      else return noteB.id.localeCompare(noteA.id);
    }
  });

  return json({ notes: sorted });
}

function NoteForm() {
  let [searchParams] = useSearchParams();

  return (
    <Form method="post" action={`?${searchParams}`}>
      <h2>Create a new note</h2>

      <label>
        Title
        <input type="text" name="title" required />
      </label>

      <label>
        Body
        <textarea name="body" required />
      </label>

      <button>Create</button>
    </Form>
  );
}

/**
 *
 * @param {import("@remix-run/router/utils").DataFunctionArgs} args
 * @returns
 */
async function notesFormAction({ request }) {
  let { searchParams } = new URL(request.url);
  let formData = await request.formData();
  let { id } = await createNote(formData.get("title"), formData.get("body"));
  return redirect(`/notes/${id}?${searchParams}`);
}
