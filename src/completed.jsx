import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useParams,
  Link,
  Outlet,
  useSearchParams,
} from "react-router-dom";
import { notes } from "./data/notes";

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Root />}>
          <Route element={<Navigate to="/notes" replace />} path="/" />
          <Route element={<NotesLayout />} path="notes">
            <Route element={<h1>Pick a note at the left</h1>} index />
            <Route element={<NotesDetail />} path=":noteId" />
          </Route>
          <Route element={<h2>Not Found</h2>} path="*" />
        </Route>
      </Routes>
    </BrowserRouter>
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
  let params = useParams();
  let note = notes.find((note) => note.id === params.noteId);

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
    </article>
  );
}

export default function NotesLayout() {
  let [searchParams, setSearchParams] = useSearchParams();
  let sort = searchParams.get("sort") || "id";
  let dir = searchParams.get("dir") || "desc";

  let sorted = [...notes].sort((noteA, noteB) => {
    if (sort in noteA) {
      if (dir === "desc") return noteA[sort].localeCompare(noteB[sort]);
      else return noteB[sort].localeCompare(noteA[sort]);
    } else {
      if (dir === "desc") return noteA.id.localeCompare(noteB.id);
      else return noteB.id.localeCompare(noteA.id);
    }
  });

  return (
    <section>
      <nav>
        <form
          method="get"
          onSubmit={(event) => {
            event.preventDefault();
            setSearchParams({
              sort: event.currentTarget.elements.namedItem("sort").value,
              dir: event.currentTarget.elements.namedItem("dir").value,
            });
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
        </form>

        <ul>
          {sorted.map((note) => {
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
