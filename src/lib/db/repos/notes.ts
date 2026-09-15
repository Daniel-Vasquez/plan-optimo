import { ObjectId } from 'mongodb';
import { notesCollection } from '../collections';
import type { DateStr, Note } from '../../../types/models';

/** Repositorio de la bitácora. `userId` primero y obligatorio. */

export async function listNotes(userId: string, limit = 200): Promise<Note[]> {
  return notesCollection().find({ userId }).sort({ date: -1, createdAt: -1 }).limit(limit).toArray();
}

export async function searchNotes(userId: string, query: string, tag?: string): Promise<Note[]> {
  const filter: Record<string, unknown> = { userId };

  const term = query.trim();
  if (term) {
    // Regex y no índice de texto: con pocas notas basta, y permite buscar
    // fragmentos ("banc" encuentra "press banca"), que es lo que se espera
    // de un buscador dentro de la propia bitácora.
    const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    filter.$or = [
      { title: { $regex: escaped, $options: 'i' } },
      { content: { $regex: escaped, $options: 'i' } },
    ];
  }
  if (tag) filter.tags = tag;

  return notesCollection().find(filter).sort({ date: -1, createdAt: -1 }).limit(200).toArray();
}

export async function getNote(userId: string, id: string): Promise<Note | null> {
  if (!ObjectId.isValid(id)) return null;
  return notesCollection().findOne({ userId, _id: new ObjectId(id) });
}

export interface NoteInput {
  date: DateStr;
  title: string;
  content: string;
  tags: string[];
}

export async function createNote(userId: string, input: NoteInput): Promise<Note> {
  const now = new Date();
  const document: Note = { ...input, userId, createdAt: now, updatedAt: now };
  const result = await notesCollection().insertOne(document);
  return { ...document, _id: result.insertedId };
}

export async function updateNote(
  userId: string,
  id: string,
  input: NoteInput,
): Promise<Note | null> {
  if (!ObjectId.isValid(id)) return null;
  return notesCollection().findOneAndUpdate(
    { userId, _id: new ObjectId(id) },
    { $set: { ...input, updatedAt: new Date() } },
    { returnDocument: 'after' },
  );
}

export async function deleteNote(userId: string, id: string): Promise<boolean> {
  if (!ObjectId.isValid(id)) return false;
  const result = await notesCollection().deleteOne({ userId, _id: new ObjectId(id) });
  return result.deletedCount === 1;
}
