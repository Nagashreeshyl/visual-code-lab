import type { Annotation, VisualMap, VisualPiece, VisualRole } from "@/lib/schemas";

export const ROLE_META: Record<
  VisualRole,
  { label: string; hint: string; tone: string }
> = {
  input: { label: "Starts with", hint: "the data you already have", tone: "bg-accent text-charcoal" },
  hold: { label: "Holds", hint: "a value sitting in memory", tone: "bg-paper text-charcoal" },
  loop: { label: "Repeats", hint: "does this for each item", tone: "bg-charcoal text-accent" },
  transform: { label: "Changes", hint: "turns one thing into another", tone: "bg-ink text-white" },
  gate: { label: "Decides", hint: "keeps some, skips others", tone: "bg-sage text-charcoal" },
  output: { label: "Ends with", hint: "what you see or return", tone: "bg-accent text-charcoal" },
  error: { label: "If it fails", hint: "the unhappy path", tone: "bg-[#ff5f57] text-white" },
};

export const ACTION_META: Record<string, { label: string; verb: string }> = {
  assign: { label: "Assign", verb: "writes a value" },
  loop: { label: "Loop", verb: "walks the next item" },
  branch: { label: "Decide", verb: "picks a path" },
  call: { label: "Call", verb: "jumps into a function" },
  return: { label: "Return", verb: "sends a value back" },
  print: { label: "Print", verb: "writes to output" },
  fetch: { label: "Fetch", verb: "waits for data" },
  compute: { label: "Compute", verb: "does the math" },
};

export function normalizeRole(value: string): VisualRole {
  const key = value.trim().toLowerCase();
  if (key in ROLE_META) return key as VisualRole;
  if (/(loop|each|while|for)/.test(key)) return "loop";
  if (/(if|check|filter|gate|branch)/.test(key)) return "gate";
  if (/(print|return|result|output|end)/.test(key)) return "output";
  if (/(error|catch|throw|fail)/.test(key)) return "error";
  if (/(input|data|start|source)/.test(key)) return "input";
  if (/(hold|store|memory|keep)/.test(key)) return "hold";
  return "transform";
}

export function tokensFromPiece(piece: Pick<VisualPiece, "sample" | "tokens" | "after" | "before">) {
  if (piece.tokens && piece.tokens.length > 0) {
    return piece.tokens.map((item) => item.trim()).filter(Boolean).slice(0, 6);
  }
  const source = piece.after || piece.sample || piece.before;
  if (!source) return [];
  return source
    .split(/,|→|->|\n/)
    .map((item) => item.replace(/^[\s{["']+|[\s}[\];'"]+$/g, "").trim())
    .filter((item) => item.length > 0 && item.length < 40)
    .slice(0, 6);
}

export function fillVisual(
  insight: string,
  annotations: Annotation[],
  visual?: VisualMap | null,
): VisualMap {
  if (visual && visual.pieces.length > 0) {
    return {
      insight: visual.insight || insight,
      metaphor: visual.metaphor,
      pieces: visual.pieces.map((piece, index) => ({
        ...piece,
        id: piece.id || `p${index}`,
        role: normalizeRole(piece.role),
        tokens: tokensFromPiece(piece),
        before: piece.before || "",
        after: piece.after || piece.sample || "",
      })),
    };
  }

  const pieces: VisualPiece[] = annotations.map((item, index) => ({
    id: item.label || `p${index}`,
    role: index === 0 ? "input" : index === annotations.length - 1 ? "output" : "transform",
    title: item.note.slice(0, 42),
    what: item.note,
    sample: "",
    tokens: [],
    before: "",
    after: "",
    startLine: item.startLine,
    endLine: item.endLine,
  }));

  return {
    insight: insight || "This program takes input, changes it, and produces a result.",
    metaphor: "",
    pieces,
  };
}

export function pieceForLine(pieces: VisualPiece[], line: number | null) {
  if (!line) return null;
  return (
    pieces.find((piece) => line >= piece.startLine && line <= piece.endLine) ?? null
  );
}
