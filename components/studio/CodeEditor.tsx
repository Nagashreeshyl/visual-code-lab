"use client";

import Editor, { type OnMount } from "@monaco-editor/react";
import { useEffect, useRef, useState } from "react";
import type { editor as MonacoEditor } from "monaco-editor";
import { useMediaQuery } from "@/lib/use-media";

type Props = {
  value: string;
  onChange?: (value: string) => void;
  language: string;
  readOnly?: boolean;
  highlightLine?: number | null;
  highlightRange?: { startLine: number; endLine: number } | null;
  height?: string;
};

function lineHighlighted(
  line: number,
  highlightLine?: number | null,
  highlightRange?: { startLine: number; endLine: number } | null,
) {
  if (highlightRange) return line >= highlightRange.startLine && line <= highlightRange.endLine;
  return highlightLine === line;
}

export function CodeEditor({
  value,
  onChange,
  language,
  readOnly,
  highlightLine,
  highlightRange,
  height = "100%",
}: Props) {
  const editorRef = useRef<MonacoEditor.IStandaloneCodeEditor | null>(null);
  const decorationsRef = useRef<string[]>([]);
  const [ready, setReady] = useState(false);
  const isMobile = useMediaQuery("(max-width: 767px)");

  useEffect(() => {
    setReady(true);
  }, []);

  const onMount: OnMount = (editor) => {
    editorRef.current = editor;
  };

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;

    const ranges: MonacoEditor.IModelDeltaDecoration[] = [];
    if (highlightRange) {
      ranges.push({
        range: {
          startLineNumber: highlightRange.startLine,
          startColumn: 1,
          endLineNumber: highlightRange.endLine,
          endColumn: 1,
        },
        options: { isWholeLine: true, className: "vl-line-highlight" },
      });
    } else if (highlightLine) {
      ranges.push({
        range: {
          startLineNumber: highlightLine,
          startColumn: 1,
          endLineNumber: highlightLine,
          endColumn: 1,
        },
        options: { isWholeLine: true, className: "vl-line-highlight" },
      });
    }

    decorationsRef.current = editor.deltaDecorations(decorationsRef.current, ranges);
    if (highlightLine) {
      editor.revealLineInCenter(highlightLine);
    }
  }, [highlightLine, highlightRange, value]);

  if (isMobile) {
    const lines = value.split("\n");
    return (
      <div className="flex min-h-[240px] overflow-hidden border border-charcoal/10 bg-white">
        <div className="select-none bg-paper px-2 py-3 font-mono text-xs leading-6 text-charcoal/40">
          {lines.map((_, index) => {
            const line = index + 1;
            const on = lineHighlighted(line, highlightLine, highlightRange);
            return (
              <div key={line} className={on ? "rounded bg-accent px-1 text-charcoal" : "px-1"}>
                {line}
              </div>
            );
          })}
        </div>
        <textarea
          value={value}
          readOnly={readOnly}
          spellCheck={false}
          onChange={(event) => onChange?.(event.target.value)}
          className="min-h-[240px] w-full resize-y bg-white px-3 py-3 font-mono text-base leading-6 text-charcoal outline-none"
          style={{ height }}
          aria-label={readOnly ? "Code" : "Code editor"}
        />
      </div>
    );
  }

  if (!ready) {
    return (
      <div className="h-full min-h-[240px] overflow-hidden border border-charcoal/10 bg-white" style={{ height }} />
    );
  }

  return (
    <div className="h-full min-h-[240px] overflow-hidden border border-charcoal/10">
      <Editor
        height={height}
        language={language === "javascript" ? "javascript" : language}
        value={value}
        onChange={(next) => onChange?.(next ?? "")}
        onMount={onMount}
        theme="vs"
        options={{
          readOnly,
          minimap: { enabled: false },
          fontSize: 14,
          lineHeight: 22,
          fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
          scrollBeyondLastLine: false,
          renderLineHighlight: "none",
          padding: { top: 16, bottom: 16 },
          automaticLayout: true,
          wordWrap: "on",
          overviewRulerLanes: 0,
        }}
      />
    </div>
  );
}
