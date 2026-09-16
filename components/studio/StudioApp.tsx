"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { LANGUAGES, MAX_CODE_CHARS } from "@/lib/constants";
import { detectLanguage, languageLabel } from "@/lib/detect-language";
import { exampleToLesson, getExample } from "@/lib/examples";
import { LESSONS_EVENT, listLessons, saveLesson } from "@/lib/history";
import { canRunInBrowser, runCode } from "@/lib/run-code";
import type { AnalyzeResult, Annotation, Lesson, SimplifyResult, TraceResult } from "@/lib/schemas";
import { useMediaQuery } from "@/lib/use-media";
import { fillVisual } from "@/lib/visual";
import { CodeEditor } from "@/components/studio/CodeEditor";
import { HistoryList } from "@/components/studio/HistoryList";
import { RunPanel } from "@/components/studio/RunPanel";
import { SimplifyPanel } from "@/components/studio/SimplifyPanel";
import { VisualExplainer } from "@/components/studio/VisualExplainer";
import { WalkthroughPanel } from "@/components/studio/WalkthroughPanel";

type Props = {
  exampleId?: string;
  lessonId?: string;
};

type PanelState<T> = {
  loading: boolean;
  error: string | null;
  data: T | null;
  provider: string | null;
};

type StudioTab = "code" | "walk" | "picture" | "run" | "short";

const idle = { loading: false, error: null, data: null, provider: null };

const TABS: { id: StudioTab; label: string }[] = [
  { id: "code", label: "Code" },
  { id: "walk", label: "Walk" },
  { id: "picture", label: "Picture" },
  { id: "run", label: "Output" },
  { id: "short", label: "Shorter" },
];

async function postJson<T>(url: string, body: unknown): Promise<{ data: T; provider: string }> {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = (await response.json()) as { data?: T; provider?: string; error?: string };
  if (!response.ok || !json.data) {
    throw new Error(json.error || "Request failed.");
  }
  return { data: json.data, provider: json.provider ?? "unknown" };
}

function PanelHead({
  title,
  status,
  provider,
}: {
  title: string;
  status: string;
  provider?: string | null;
}) {
  return (
    <div className="mb-4 flex items-end justify-between gap-4">
      <h2 className="headline text-3xl lowercase md:text-4xl">{title}</h2>
      <p className="meta text-charcoal/40">
        {status}
        {provider ? ` · via ${provider}` : ""}
      </p>
    </div>
  );
}

function seedFromExample(exampleId?: string) {
  if (!exampleId) return null;
  const example = getExample(exampleId);
  return example ? exampleToLesson(example) : null;
}

export function StudioApp({ exampleId, lessonId }: Props) {
  const seeded = seedFromExample(exampleId);
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const [tab, setTab] = useState<StudioTab>("code");
  const [code, setCode] = useState(seeded?.original ?? "");
  const [language, setLanguage] = useState(seeded?.language ?? "javascript");
  const [languageLocked, setLanguageLocked] = useState(Boolean(seeded));
  const [analyze, setAnalyze] = useState<PanelState<AnalyzeResult>>(
    seeded
      ? {
          loading: false,
          error: null,
          data: {
            title: seeded.title,
            summary: seeded.summary ?? "",
            mermaid: seeded.mermaid,
            visual: seeded.visual,
            annotations: seeded.annotations,
            functions: [],
          },
          provider: "example",
        }
      : idle,
  );
  const [simplify, setSimplify] = useState<PanelState<SimplifyResult>>(
    seeded
      ? {
          loading: false,
          error: null,
          data: { simplifiedCode: seeded.simplified, changes: seeded.changes ?? [] },
          provider: "example",
        }
      : idle,
  );
  const [trace, setTrace] = useState<PanelState<TraceResult>>(
    seeded
      ? {
          loading: false,
          error: null,
          data: { steps: seeded.steps },
          provider: "example",
        }
      : idle,
  );
  const [stepIndex, setStepIndex] = useState(0);
  const [selected, setSelected] = useState<Annotation | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [runStdout, setRunStdout] = useState("");
  const [runError, setRunError] = useState<string | null>(null);
  const [running, setRunning] = useState(false);

  const truncated = code.length > MAX_CODE_CHARS;
  const payloadCode = truncated ? code.slice(0, MAX_CODE_CHARS) : code;
  const detected = detectLanguage(code);

  const refreshLessons = useCallback(() => {
    void listLessons().then(setLessons);
  }, []);

  useEffect(() => {
    refreshLessons();
    window.addEventListener(LESSONS_EVENT, refreshLessons);
    return () => window.removeEventListener(LESSONS_EVENT, refreshLessons);
  }, [refreshLessons]);

  const applyLesson = useCallback((lesson: Lesson, provider?: string) => {
    setCode(lesson.original);
    setLanguage(lesson.language);
    setLanguageLocked(true);
    setSelected(null);
    setStepIndex(0);
    setAnalyze({
      loading: false,
      error: null,
      data: {
        title: lesson.title,
        summary: lesson.summary ?? "",
        mermaid: lesson.mermaid,
        visual: lesson.visual,
        annotations: lesson.annotations,
        functions: [],
      },
      provider: provider ?? lesson.provider ?? null,
    });
    setSimplify({
      loading: false,
      error: null,
      data: { simplifiedCode: lesson.simplified, changes: lesson.changes ?? [] },
      provider: provider ?? lesson.provider ?? null,
    });
    setTrace({
      loading: false,
      error: null,
      data: { steps: lesson.steps },
      provider: provider ?? lesson.provider ?? null,
    });
  }, []);

  useEffect(() => {
    if (!lessonId) return;
    void listLessons().then((items) => {
      const found = items.find((item) => item.id === lessonId);
      if (found) applyLesson(found);
    });
  }, [lessonId, applyLesson]);

  const highlightLine = selected ? null : (trace.data?.steps[stepIndex]?.line ?? null);
  const highlightRange = selected
    ? { startLine: selected.startLine, endLine: selected.endLine }
    : null;

  const busy = analyze.loading || simplify.loading || trace.loading;
  const visualMap = analyze.data
    ? fillVisual(analyze.data.summary, analyze.data.annotations, analyze.data.visual)
    : null;
  const editorHeight = "360px";
  const pane = (id: StudioTab) => `${tab === id ? "block" : "hidden"} lg:block`;
  const show = pane;

  function handleCode(next: string) {
    setCode(next);
    if (!languageLocked) setLanguage(detectLanguage(next));
  }

  async function explain() {
    if (!payloadCode.trim()) return;
    setSelected(null);
    setStepIndex(0);
    setSaveMessage(null);
    setAnalyze({ loading: true, error: null, data: null, provider: null });
    setSimplify({ loading: true, error: null, data: null, provider: null });
    setTrace({ loading: true, error: null, data: null, provider: null });
    if (!isDesktop) setTab("picture");

    const body = { code: payloadCode, language };
    await Promise.all([
      postJson<AnalyzeResult>("/api/analyze", body)
        .then((result) =>
          setAnalyze({ loading: false, error: null, data: result.data, provider: result.provider }),
        )
        .catch((error: unknown) =>
          setAnalyze({
            loading: false,
            error: error instanceof Error ? error.message : "Analyze failed.",
            data: null,
            provider: null,
          }),
        ),
      postJson<SimplifyResult>("/api/simplify", body)
        .then((result) =>
          setSimplify({ loading: false, error: null, data: result.data, provider: result.provider }),
        )
        .catch((error: unknown) =>
          setSimplify({
            loading: false,
            error: error instanceof Error ? error.message : "Simplify failed.",
            data: null,
            provider: null,
          }),
        ),
      postJson<TraceResult>("/api/trace", body)
        .then((result) =>
          setTrace({ loading: false, error: null, data: result.data, provider: result.provider }),
        )
        .catch((error: unknown) =>
          setTrace({
            loading: false,
            error: error instanceof Error ? error.message : "Walkthrough failed.",
            data: null,
            provider: null,
          }),
        ),
    ]);
  }

  async function onRun() {
    if (!payloadCode.trim()) return;
    setRunning(true);
    setRunError(null);
    setRunStdout("");
    if (!isDesktop) setTab("run");
    try {
      const result = await runCode(payloadCode, language);
      setRunStdout(result.stdout);
      setRunError(result.error);
    } catch (error) {
      setRunError(error instanceof Error ? error.message : "Could not run this program.");
    } finally {
      setRunning(false);
    }
  }

  async function onSave() {
    if (!analyze.data) return;
    const lesson: Lesson = {
      id: crypto.randomUUID(),
      title: analyze.data.title || "Untitled lesson",
      language,
      original: payloadCode,
      simplified: simplify.data?.simplifiedCode ?? "",
      mermaid: analyze.data.mermaid ?? "",
      visual: visualMap ?? analyze.data.visual,
      summary: analyze.data.summary,
      annotations: analyze.data.annotations,
      steps: trace.data?.steps ?? [],
      changes: simplify.data?.changes ?? [],
      createdAt: Date.now(),
      provider: analyze.provider ?? simplify.provider ?? trace.provider ?? undefined,
    };
    await saveLesson(lesson);
    setSaveMessage("Saved on this device.");
  }

  const emptyHint = useMemo(() => "Paste code, then explain visually.", []);

  const walkthrough = trace.error ? (
    <ErrorBlock message={trace.error} onRetry={() => void explain()} />
  ) : trace.data ? (
    <WalkthroughPanel
      steps={trace.data.steps}
      index={stepIndex}
      onIndexChange={(next) => {
        setSelected(null);
        setStepIndex(next);
      }}
    />
  ) : (
    <EmptyBlock text={trace.loading ? "Watching the happy path…" : emptyHint} />
  );

  const picture = analyze.error ? (
    <ErrorBlock message={analyze.error} onRetry={() => void explain()} />
  ) : analyze.data ? (
    <>
      <p className="mb-4 max-w-2xl text-base text-charcoal/70 md:text-lg">{analyze.data.summary}</p>
      <VisualExplainer
        insight={analyze.data.summary}
        visual={analyze.data.visual}
        annotations={analyze.data.annotations}
        activeLine={highlightLine}
        selectedId={selected?.label ?? null}
        onSelect={setSelected}
      />
    </>
  ) : (
    <EmptyBlock text={analyze.loading ? "Reading the program…" : emptyHint} />
  );

  const shorter = simplify.error ? (
    <ErrorBlock message={simplify.error} onRetry={() => void explain()} />
  ) : simplify.data ? (
    <SimplifyPanel
      original={payloadCode}
      simplified={simplify.data.simplifiedCode}
      language={language}
      changes={simplify.data.changes}
    />
  ) : (
    <EmptyBlock text={simplify.loading ? "Shortening…" : emptyHint} />
  );

  return (
    <div className="flex flex-col gap-8 px-4 pt-24 pb-16 md:px-6 md:pt-32 md:pb-24 lg:flex-row lg:gap-16">
      <aside className="w-full shrink-0 lg:w-64">
        <details className="lg:hidden">
          <summary className="meta flex min-h-11 cursor-pointer list-none items-center text-charcoal/50">
            History
          </summary>
          <div className="mt-4">
            <HistoryList lessons={lessons} activeId={lessonId} />
          </div>
        </details>
        <div className="hidden lg:block">
          <p className="meta mb-6 text-charcoal/40">History</p>
          <HistoryList lessons={lessons} activeId={lessonId} />
        </div>
      </aside>

      <div className="min-w-0 flex-1 space-y-10 overflow-x-hidden lg:space-y-16">
        <section>
          <p className="meta text-charcoal/40">Studio</p>
          <h1 className="headline mt-3 text-4xl lowercase sm:text-5xl md:text-7xl">Explain visually</h1>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <label className="meta flex min-h-11 items-center text-charcoal/40">
              Language
              <select
                className="ml-3 min-h-11 border-0 bg-transparent font-sans text-base tracking-tight text-black uppercase"
                value={language}
                onChange={(event) => {
                  setLanguage(event.target.value);
                  setLanguageLocked(true);
                }}
              >
                {LANGUAGES.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>
            <p className="text-sm text-charcoal/50">
              {languageLocked ? (
                <button type="button" className="hover-link min-h-11" onClick={() => {
                  setLanguageLocked(false);
                  setLanguage(detectLanguage(code));
                }}>
                  Auto-detect {languageLabel(detected)}
                </button>
              ) : (
                <>Detected {languageLabel(language)}</>
              )}
            </p>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
            <button
              type="button"
              onClick={() => void explain()}
              disabled={busy || !code.trim()}
              className="min-h-11 rounded-full bg-charcoal px-5 text-sm text-white disabled:opacity-40"
            >
              {busy ? "Working" : "Explain"}
            </button>
            <button
              type="button"
              onClick={() => void onRun()}
              disabled={running || !code.trim()}
              className="min-h-11 rounded-full bg-accent px-5 text-sm text-charcoal disabled:opacity-40"
            >
              {running ? "Running" : "Run code"}
            </button>
            <button
              type="button"
              onClick={() => void onSave()}
              disabled={!analyze.data}
              className="min-h-11 rounded-full border border-charcoal/15 px-5 text-sm disabled:opacity-40"
            >
              Save
            </button>
          </div>

          {truncated ? (
            <p className="mt-4 text-sm text-charcoal/60">
              Paste is over 12,000 characters. Only the first 12,000 will be sent.
            </p>
          ) : null}
          {saveMessage ? <p className="mt-4 text-sm text-charcoal/60">{saveMessage}</p> : null}
          {!canRunInBrowser(language) ? (
            <p className="mt-4 text-sm text-charcoal/60">
              Run works in-browser for JavaScript, TypeScript, and Python.
            </p>
          ) : null}
        </section>

        <div className="sticky top-20 z-30 -mx-4 border-b border-charcoal/10 bg-white/95 px-4 py-2 backdrop-blur lg:hidden">
          <div className="flex gap-1 overflow-x-auto">
            {TABS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id)}
                className={`min-h-11 shrink-0 rounded-full px-4 text-sm ${
                  tab === item.id ? "bg-charcoal text-white" : "text-charcoal/70"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid items-stretch gap-4 lg:grid-cols-2">
          <div className={`min-w-0 ${pane("code")}`}>
              <p className="meta mb-3 text-charcoal/40">Your code</p>
              <CodeEditor
                value={code}
                onChange={handleCode}
                language={language}
                highlightLine={highlightLine}
                highlightRange={highlightRange}
                height={editorHeight}
              />
          </div>
          <div className={`min-w-0 ${pane("walk")}`}>
              <p className="meta mb-3 text-charcoal/40">
                {trace.loading ? "Building walkthrough" : "What is happening"}
                {trace.provider ? ` · ${trace.provider}` : ""}
              </p>
              {walkthrough}
          </div>
        </div>

        <div className={pane("run")}>
          <RunPanel stdout={runStdout} error={runError} running={running} language={language} />
        </div>

        <section className={pane("picture")}>
            <PanelHead
              title="The picture"
              status={analyze.loading ? "loading" : analyze.error ? "error" : analyze.data ? "ready" : "idle"}
              provider={analyze.provider}
            />
            {picture}
        </section>

        <section className={pane("short")}>
            <PanelHead
              title="Shorter"
              status={simplify.loading ? "loading" : simplify.error ? "error" : simplify.data ? "ready" : "idle"}
              provider={simplify.provider}
            />
            {shorter}
        </section>
      </div>
    </div>
  );
}

function EmptyBlock({ text }: { text: string }) {
  return (
    <div className="flex min-h-[240px] items-center border border-charcoal/10 px-4 text-charcoal/60 md:min-h-[520px]">
      {text}
    </div>
  );
}

function ErrorBlock({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="border border-charcoal/10 px-4 py-6">
      <p className="text-lg">{message}</p>
      <button type="button" onClick={onRetry} className="hover-link mt-4 min-h-11 text-xl tracking-tight">
        try again
      </button>
    </div>
  );
}
