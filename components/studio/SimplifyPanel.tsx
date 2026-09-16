import { CodeEditor } from "@/components/studio/CodeEditor";

type Props = {
  original: string;
  simplified: string;
  language: string;
  changes: Array<{ title: string; why: string }>;
};

export function SimplifyPanel({ original, simplified, language, changes }: Props) {
  return (
    <div className="flex h-full min-h-[280px] flex-col border border-black/10">
      <div className="grid flex-1 grid-cols-1 lg:grid-cols-2">
        <div className="border-b border-black/10 lg:border-r lg:border-b-0">
          <p className="meta border-b border-black/10 px-4 py-3 text-muted">Original</p>
          <CodeEditor value={original} language={language} readOnly height="320px" />
        </div>
        <div>
          <p className="meta border-b border-black/10 px-4 py-3 text-muted">Shorter</p>
          <CodeEditor value={simplified} language={language} readOnly height="320px" />
        </div>
      </div>
      {changes.length ? (
        <ul className="border-t border-black/10">
          {changes.map((change) => (
            <li key={change.title} className="hover-card border-b border-black/10 px-4 py-3 last:border-b-0">
              <p className="text-lg tracking-tight">{change.title}</p>
              <p className="text-sm text-secondary">{change.why}</p>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
