"use client";

import Link from "next/link";
import { deleteLesson } from "@/lib/history";
import type { Lesson } from "@/lib/schemas";

export function HistoryList({
  lessons,
  activeId,
}: {
  lessons: Lesson[];
  activeId?: string | null;
}) {
  if (!lessons.length) {
    return <p className="text-sm text-charcoal/60">Saved lessons will live here.</p>;
  }

  return (
    <ul>
      {lessons.map((lesson) => (
        <li key={lesson.id} className="hover-card border-b border-charcoal/10 px-2 py-4 -mx-2">
          <div className="flex items-start justify-between gap-3">
            <Link
              href={`/studio?lesson=${lesson.id}`}
              className={`block ${activeId === lesson.id ? "underline" : ""}`}
            >
              <p className="text-lg tracking-tight transition-colors duration-200 hover:text-charcoal/70">
                {lesson.title}
              </p>
              <p className="meta mt-2 text-charcoal/40">
                {lesson.language} · {new Date(lesson.createdAt).toISOString().slice(0, 10)}
              </p>
            </Link>
            <button
              type="button"
              className="hover-link meta text-charcoal/40"
              onClick={() => void deleteLesson(lesson.id)}
            >
              Delete
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
