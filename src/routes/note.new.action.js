import { redirect } from "react-router-dom";
import { createNote } from "../models/notes";

export async function action({ request }) {
  let { searchParams } = new URL(request.url);
  let formData = await request.formData();

  let { id } = await createNote(formData.get("title"), formData.get("body"));
  return redirect(`/notes/${id}?${searchParams}`);
}
