import React from "react";
import {
  Outlet,
  Route,
  Link,
  useSearchParams,
  Navigate,
  DataBrowserRouter,
  json,
  useLoaderData,
  Form,
  useLocation,
  redirect,
  useNavigation,
} from "react-router-dom";
import { getAllNotes, getNoteById, deleteNote } from "./models/notes";

let NoteForm = React.lazy(() => import("./routes/note.new"));

export function App() {
  return (
    <DataBrowserRouter>
      <Route path="/" element={<Navigate to="/notes" replace />} />

      <Route element={<Root />}>
        <Route
          element={<NotesLayout />}
          path="notes"
          loader={notesLayoutLoader}
        >
          <Route element={<h1>Pick a note at the left</h1>} index />
          <Route
            element={
              <React.Suspense fallback={<p>Loading...</p>}>
                <NoteForm />
              </React.Suspense>
            }
            path="new"
            action={async (args) => {
              let { action } = await import("./routes/note.new.action");
              return action(args);
            }}
          />
          <Route
            element={<NotesDetail />}
            path=":noteId"
            loader={noteDetailsLoader}
            action={noteDetailsAction}
          />
        </Route>
      </Route>

      <Route path="*" element={<h1>404</h1>} />
    </DataBrowserRouter>
  );
}

function Root() {
  return (
    <main>
      <header>
        <h1>codigofacilito Bootcamp React - Clase de React Router</h1>
      </header>
      <Outlet />
    </main>
  );
}

function NotesDetail() {
  let [searchParams] = useSearchParams();
  let loaderData = useLoaderData();
  let navigation = useNavigation();

  if (!loaderData) {
    return <h1>Note not found, select another one</h1>;
  }

  let { note } = loaderData;

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
        <button disabled={navigation.state !== "idle"}>Delete</button>
      </Form>
    </article>
  );
}

async function noteDetailsLoader({ params }) {
  let noteId = params.noteId;
  let note = await getNoteById(noteId);
  if (!note) return json(null, { status: 404 });
  return json({ note });
}

async function noteDetailsAction({ params }) {
  let noteId = params.noteId;
  await deleteNote(noteId);
  return redirect("/notes");
}

function NotesLayout() {
  let { notes } = useLoaderData();
  let [searchParams] = useSearchParams();
  let { pathname, search } = useLocation();

  return (
    <section>
      <nav>
        <Form action={pathname}>
          <label>
            Sort by:
            <select name="sort" defaultValue={searchParams.get("sort") || "id"}>
              <option value="id">ID</option>
              <option value="title">Title</option>
              <option value="body">Body</option>
              <option value="createdAt">Created at</option>
            </select>
          </label>

          <label>
            Direction:
            <select name="dir" defaultValue={searchParams.get("dir") || "desc"}>
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>
          </label>

          <button>Sort</button>
        </Form>

        <ul>
          <li>
            <Link to={`new?${search}`}>Create a note</Link>
          </li>

          {notes.map((note) => {
            return (
              <li key={note.id}>
                <Link to={`${note.id}?${search}`}>{note.title}</Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <Outlet />
    </section>
  );
}

async function notesLayoutLoader({ request }) {
  let notes = await getAllNotes();
  let { searchParams } = new URL(request.url);

  let sort = searchParams.get("sort") || "id";
  let dir = searchParams.get("dir") || "desct";

  let sorted = notes.sort((noteA, noteB) => {
    if (sort in noteA) {
      if (dir === "desc") return noteA[sort].localeCompare(noteB[sort]);
      else return noteB[sort].localeCompare(noteA[sort]);
    } else {
      if (dir === "desc") return noteA.id.localeCompare(noteB.id);
      else return noteB.id.localeCompare(noteA.id);
    }
  });

  return { notes: sorted };
}
