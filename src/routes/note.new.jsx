import { useSearchParams, Form, useNavigation } from "react-router-dom";

export default function NoteForm() {
  let [searchParams] = useSearchParams();
  let navigation = useNavigation();

  return (
    <Form method="post" action={`?${searchParams}`}>
      <h2>Create a note</h2>

      <label>
        Title:
        <input type="text" name="title" />
      </label>

      <label>
        Body:
        <textarea name="body" />
      </label>

      <button disabled={navigation.state !== "idle"}>Create</button>
    </Form>
  );
}
