"use client";

import { useEffect, useRef, useState } from "react";
import { fillVisual, pieceForLine, ROLE_META, tokensFromPiece } from "@/lib/visual";
import type { Annotation, VisualMap, VisualPiece } from "@/lib/schemas";

type Props = {
  insight?: string;
  visual?: VisualMap | null;
  annotations: Annotation[];
  activeLine?: number | null;
  selectedId?: string | null;
  onSelect?: (annotation: Annotation) => void;
};

const STEP_WORD: Record<string, string> = {
  input: "First",
  hold: "It keeps",
  loop: "For each one",
  transform: "Then",
  gate: "It checks",
  output: "Finally",
  error: "If it fails",
};

function annotationFor(piece: VisualPiece, annotations: Annotation[]): Annotation {
  return (
    annotations.find((item) => item.label === piece.id) ?? {
      startLine: piece.startLine,
      endLine: piece.endLine,
      label: piece.id,
      note: piece.what,
    }
  );
}

function ChangeView({ piece }: { piece: VisualPiece }) {
  const tokens = tokensFromPiece(piece);
  const before = piece.before;
  const after = piece.after || piece.sample;

  if (before && after && before !== after) {
    return (
      <div className="mt-4 grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:gap-3">
        <div className="rounded-xl bg-white px-3 py-3">
          <p className="text-xs text-charcoal/50">This</p>
          <p className="mt-1 font-mono text-sm break-all text-charcoal">{before}</p>
        </div>
        <span className="text-xl text-charcoal/40" aria-hidden>
          →
        </span>
        <div className="rounded-xl bg-charcoal px-3 py-3 text-accent">
          <p className="text-xs text-accent/70">Becomes</p>
          <p className="mt-1 font-mono text-sm break-all">{after}</p>
        </div>
      </div>
    );
  }

  if (after || tokens.length) {
    return (
      <div className="mt-4 rounded-xl bg-charcoal px-3 py-3 text-accent">
        <p className="text-xs text-accent/70">Looks like</p>
        <p className="mt-1 font-mono text-sm break-all">{after || tokens.join(" · ")}</p>
      </div>
    );
  }

  return null;
}

export function VisualExplainer({
  insight,
  visual,
  annotations,
  activeLine,
  selectedId,
  onSelect,
}: Props) {
  const map = fillVisual(insight ?? "", annotations, visual);
  const linePiece = pieceForLine(map.pieces, activeLine ?? null);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const cardRefs = useRef<Array<HTMLButtonElement | null>>([]);

  useEffect(() => {
    if (!map.pieces.length) return;
    if (selectedId) {
      const found = map.pieces.findIndex((piece) => piece.id === selectedId);
      if (found >= 0) setIndex(found);
      return;
    }
    if (linePiece) {
      const found = map.pieces.findIndex((piece) => piece.id === linePiece.id);
      if (found >= 0) setIndex(found);
    }
  }, [selectedId, linePiece, map.pieces]);

  useEffect(() => {
    if (!playing || map.pieces.length === 0) return;
    const timer = window.setInterval(() => {
      setIndex((current) => {
        const next = current + 1 >= map.pieces.length ? 0 : current + 1;
        const piece = map.pieces[next];
        if (piece) onSelect?.(annotationFor(piece, annotations));
        return next;
      });
    }, 2200);
    return () => window.clearInterval(timer);
  }, [playing, map.pieces, annotations, onSelect]);

  useEffect(() => {
    cardRefs.current[index]?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [index]);

  const piece = map.pieces[index];

  if (!map.pieces.length || !piece) {
    return (
      <div className="flex min-h-[180px] items-center border border-charcoal/10 px-4 text-charcoal/60">
        Paste code, then explain visually.
      </div>
    );
  }

  function jump(next: number) {
    const clamped = Math.max(0, Math.min(map.pieces.length - 1, next));
    setPlaying(false);
    setIndex(clamped);
    const nextPiece = map.pieces[clamped];
    if (nextPiece) onSelect?.(annotationFor(nextPiece, annotations));
  }

  return (
    <div className="overflow-hidden border border-charcoal/10">
      <div className="bg-paper px-4 py-5 md:px-8 md:py-6">
        <p className="text-sm text-charcoal/50">In plain English</p>
        <h3 className="mt-2 max-w-3xl text-xl leading-snug tracking-tight sm:text-2xl">{map.insight}</h3>
        {map.metaphor ? (
          <p className="mt-3 max-w-2xl text-charcoal/70">Like {map.metaphor}.</p>
        ) : null}

        <div className="mt-5 flex flex-wrap items-center gap-2">
          <button
            type="button"
            className="min-h-11 rounded-full bg-charcoal px-5 text-sm text-white"
            onClick={() => {
              setPlaying((value) => {
                if (!value) onSelect?.(annotationFor(piece, annotations));
                return !value;
              });
            }}
          >
            {playing ? "Pause" : "Play the story"}
          </button>
          <p className="text-sm text-charcoal/50">
            Step {index + 1} of {map.pieces.length} · tap a card
          </p>
        </div>
      </div>

      <ol className="space-y-0 px-3 py-4 md:px-6">
        {map.pieces.map((item, pieceIndex) => {
          const open = pieceIndex === index;
          const word = STEP_WORD[item.role] ?? ROLE_META[item.role].label;
          return (
            <li key={item.id} className="relative pl-10">
              {pieceIndex < map.pieces.length - 1 ? (
                <span className="absolute top-12 bottom-0 left-[19px] w-px bg-charcoal/15" aria-hidden />
              ) : null}
              <span
                className={`absolute top-3 left-0 flex h-10 w-10 items-center justify-center rounded-full text-sm ${
                  open ? "bg-charcoal text-accent" : "bg-paper text-charcoal"
                }`}
              >
                {pieceIndex + 1}
              </span>
              <button
                ref={(node) => {
                  cardRefs.current[pieceIndex] = node;
                }}
                type="button"
                onClick={() => jump(pieceIndex)}
                className={`mb-3 w-full rounded-2xl border p-4 text-left transition-colors duration-200 ${
                  open ? "border-charcoal bg-accent/35" : "border-charcoal/10 bg-white"
                }`}
              >
                <p className="text-xs font-medium tracking-wide text-charcoal/50 uppercase">{word}</p>
                <p className="mt-1 text-lg tracking-tight">{item.title}</p>
                {open ? (
                  <>
                    <p className="mt-2 text-charcoal/75">{item.what}</p>
                    <ChangeView piece={item} />
                    <p className="mt-4 text-xs text-charcoal/50">
                      Your code, lines {item.startLine}–{item.endLine}
                    </p>
                  </>
                ) : (
                  <p className="mt-1 truncate text-sm text-charcoal/55">{item.what}</p>
                )}
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
