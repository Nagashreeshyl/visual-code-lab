"use client";

type Props = {
  stdout: string;
  error: string | null;
  running: boolean;
  language: string;
};

export function RunPanel({ stdout, error, running, language }: Props) {
  return (
    <div className="overflow-hidden border border-charcoal/10">
      <div className="flex items-center justify-between border-b border-charcoal/10 px-4 py-3">
        <p className="meta text-charcoal/40">Program output</p>
        <p className="meta text-charcoal/40">{running ? "running" : language}</p>
      </div>
      <pre
        className={`min-h-[140px] max-h-[280px] overflow-auto p-4 font-mono text-sm leading-6 whitespace-pre-wrap ${
          error ? "bg-[#2b1210] text-[#ffb4a8]" : "bg-charcoal text-accent"
        }`}
      >
        {running
          ? language === "python"
            ? "Loading Python runtime…"
            : "Running…"
          : error
            ? error
            : stdout || "Run the code to see prints and return values here."}
      </pre>
    </div>
  );
}
