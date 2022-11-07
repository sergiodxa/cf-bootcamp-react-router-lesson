import { notes } from "../data/notes";

const KEY = "notes";

/**
 * @typedef Note
 * @property {string} id
 * @property {string} title
 * @property {string} body
 * @property {string} createdAt
 */

export function generateId() {
  return crypto.randomUUID();
}

export function populate() {
  localStorage.setItem(KEY, JSON.stringify(notes));
}

/**
 * @param {number} ms
 * @returns {Promise<void>}
 */
let sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Get all notes in the DB
 * @returns {Promise<Note[]>}
 */
export async function getAllNotes() {
  await fakeNetwork();
  let storedValue = localStorage.getItem(KEY);
  if (!storedValue) return [];
  return JSON.parse(storedValue);
}

/**
 * Get a single note by ID
 * @param {string} id The ID of the note to get
 * @returns {Promise<Note> | Promise<null>}
 */
export async function getNoteById(id) {
  await fakeNetwork();
  let notes = await getAllNotes();
  let note = notes.find((note) => note.id === id);
  if (!note) return null;
  return note;
}

/**
 * Create a new note and save it
 * @param {string} title The title of the new note
 * @param {string} body The body of the new note
 * @returns {Promise<Note>}
 */
export async function createNote(title, body) {
  await fakeNetwork();
  let id = generateId();
  let createdAt = new Date().toISOString();

  /**
   * @type {Note}
   */
  let note = { id, title, body, createdAt };

  let notes = await getAllNotes();
  notes.push(note);
  localStorage.setItem(KEY, JSON.stringify(notes));
  return note;
}

/**
 * Deletes a note by ID
 * @param {string} id The ID of the note to delete
 * @returns {Promise<void>}
 */
export async function deleteNote(id) {
  await fakeNetwork();
  let notes = await getAllNotes();
  let filteredNotes = notes.filter((note) => note.id !== id);
  localStorage.setItem(KEY, JSON.stringify(filteredNotes));
}

async function fakeNetwork() {
  await sleep(Math.random() * 500);
}
