import type { Annotation } from "@/lib/schemas";

function unescapeMermaid(source: string) {
  return source
    .replace(/\\n/g, "\n")
    .replace(/\\t/g, " ")
    .replace(/\\"/g, '"')
    .replace(/\\\\/g, "\\");
}

function cleanLabel(raw: string) {
  return raw
    .replace(/["`\[\]]/g, "")
    .replace(/[(){}]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 42) || "step";
}

function quoteShape(id: string, open: string, close: string, inner: string) {
  const label = cleanLabel(inner.replace(/^["']|["']$/g, ""));
  return `${id}${open}"${label}"${close}`;
}

export function mermaidFromAnnotations(annotations: Annotation[]) {
  const nodes = annotations.length
    ? annotations
    : [{ label: "n0", note: "Code overview", startLine: 1, endLine: 1 }];
  const lines = ["flowchart TD"];
  nodes.forEach((item, index) => {
    const id = /^[A-Za-z][\w-]*$/.test(item.label) ? item.label : `n${index}`;
    lines.push(`  ${id}["${cleanLabel(item.note || item.label)}"]`);
    if (index > 0) {
      const prev = /^[A-Za-z][\w-]*$/.test(nodes[index - 1].label)
        ? nodes[index - 1].label
        : `n${index - 1}`;
      lines.push(`  ${prev} --> ${id}`);
    }
  });
  return lines.join("\n");
}

export function sanitizeMermaid(source: string) {
  let text = unescapeMermaid(source);
  text = text.replace(/```(?:mermaid)?/gi, "").replace(/```/g, "").trim();
  text = text.replace(/<[^>]*>/g, "");
  text = text.replace(/click\s+\S+[^\n]*/gi, "");
  text = text.replace(/javascript:/gi, "");
  text = text.replace(/^(?:classDef|linkStyle|style|click).*$/gim, "");

  const start = text.search(/^(flowchart|graph)\s/im);
  if (start > 0) text = text.slice(start);
  if (!/^(flowchart|graph)\s/i.test(text)) {
    return `flowchart TD\n  n0["Unable to render diagram"]`;
  }

  text = text.replace(
    /^(flowchart|graph)\s+(TD|TB|LR|RL)\s*/i,
    (_match, kind: string, dir: string) => `${kind} ${dir}\n`,
  );

  text = text
    .split("\n")
    .map((line) => {
      let next = line.trimEnd();
      next = next.replace(
        /(\b[A-Za-z][\w-]*)\[(?!")([^\]]*)\]/g,
        (_m, id: string, inner: string) => quoteShape(id, "[", "]", inner),
      );
      next = next.replace(
        /(\b[A-Za-z][\w-]*)\((?!")([^)]*)\)/g,
        (_m, id: string, inner: string) => quoteShape(id, "(", ")", inner),
      );
      next = next.replace(
        /(\b[A-Za-z][\w-]*)\{(?!")([^}]*)\}/g,
        (_m, id: string, inner: string) => quoteShape(id, "{", "}", inner),
      );
      next = next.replace(
        /(\b[A-Za-z][\w-]*)\["([^"]*)"\]/g,
        (_m, id: string, inner: string) => `${id}["${cleanLabel(inner)}"]`,
      );
      return next;
    })
    .join("\n")
    .trim();

  return text;
}
