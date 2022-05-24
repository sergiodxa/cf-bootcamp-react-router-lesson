import { useState } from "react";
import { notes } from "./data/notes";

export function App() {
  let [noteId, setNoteId] = useState(null);

  return (
    <Root>
      <NotesLayout setNoteId={setNoteId}>
        {noteId === null ? (
          <h1>Pick a note at the left</h1>
        ) : (
          <NotesDetail noteId={noteId} />
        )}
      </NotesLayout>
    </Root>
  );
}

/**
 *
 * @param {Object} props
 * @param {import("react").ReactNode} props.children
 * @returns
 */
function Root({ children }) {
  return (
    <main>
      <header>
        <h1>codigofacilito Bootcamp React - Clase de React Router</h1>
      </header>
      {children}
    </main>
  );
}

/**
 * @param {Object} props
 * @param {string} props.noteId
 */
function NotesDetail({ noteId }) {
  let note = notes.find((note) => note.id === noteId);

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

/**
 *
 * @param {Object} props
 * @param {import("react").ReactNode} props.children
 * @param {import("react").Dispatch<string>} props.setNoteId
 * @returns
 */
export default function NotesLayout({ children, setNoteId }) {
  let [sort, setSort] = useState("id");
  let [dir, setDir] = useState("desct");

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
            setSort(event.currentTarget.elements.namedItem("sort").value);
            setDir(event.currentTarget.elements.namedItem("dir").value);
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
                <button onClick={() => setNoteId(note.id)}>{note.title}</button>
              </li>
            );
          })}
        </ul>
      </nav>

      {children}
    </section>
  );
}
