import { get, set } from "idb-keyval";
import { MAX_SAVED_LESSONS } from "@/lib/constants";
import { lessonSchema, type Lesson } from "@/lib/schemas";

const KEY = "visual-code-lab:lessons";
export const LESSONS_EVENT = "vl-lessons";

let memory: Lesson[] = [];

function notify() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(LESSONS_EVENT));
  }
}

function parseList(raw: unknown): Lesson[] {
  const parsed = Array.isArray(raw) ? raw : [];
  return parsed
    .map((item) => lessonSchema.safeParse(item))
    .filter((item) => item.success)
    .map((item) => item.data)
    .sort((a, b) => b.createdAt - a.createdAt);
}

export async function listLessons(): Promise<Lesson[]> {
  try {
    const raw = await get(KEY);
    const lessons = parseList(raw);
    memory = lessons;
    return lessons;
  } catch {
    try {
      const raw = window.localStorage.getItem(KEY);
      const lessons = parseList(raw ? JSON.parse(raw) : []);
      memory = lessons;
      return lessons;
    } catch {
      return memory;
    }
  }
}

async function persist(next: Lesson[]) {
  memory = next;
  try {
    await set(KEY, next);
  } catch {
    try {
      window.localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      // Edge tracking prevention can block both stores.
    }
  }
  notify();
}

export async function saveLesson(lesson: Lesson) {
  const current = await listLessons();
  await persist(
    [lesson, ...current.filter((item) => item.id !== lesson.id)].slice(0, MAX_SAVED_LESSONS),
  );
}

export async function getLesson(id: string) {
  const lessons = await listLessons();
  return lessons.find((item) => item.id === id);
}

export async function deleteLesson(id: string) {
  const current = await listLessons();
  await persist(current.filter((item) => item.id !== id));
}
