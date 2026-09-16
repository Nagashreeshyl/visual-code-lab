"use client";

import { useEffect, useMemo, useState } from "react";
import { ACTION_META } from "@/lib/visual";
import type { TraceStep } from "@/lib/schemas";

type Props = {
  steps: TraceStep[];
  index: number;
  onIndexChange: (index: number) => void;
};

function MemoryBox({
  name,
  value,
  focused,
  changed,
}: {
  name: string;
  value: string;
  focused: boolean;
  changed: boolean;
}) {
  return (
    <div
      className={`min-w-[96px] rounded-xl border px-3 py-3 transition-colors duration-200 ${
        focused
          ? "border-charcoal bg-accent"
          : changed
            ? "border-charcoal bg-white"
            : "border-charcoal/10 bg-white"
      }`}
    >
      <p className="meta text-charcoal/50">{name}</p>
      <p className="mt-2 font-mono text-sm break-all">{value}</p>
    </div>
  );
}

export function WalkthroughPanel({ steps, index, onIndexChange }: Props) {
  const [playing, setPlaying] = useState(false);
  const step = steps[index];
  const previous = index > 0 ? steps[index - 1] : null;

  useEffect(() => {
    if (!playing || steps.length === 0) return;
    const timer = window.setInterval(() => {
      onIndexChange(index + 1 >= steps.length ? 0 : index + 1);
    }, 1600);
    return () => window.clearInterval(timer);
  }, [playing, index, steps.length, onIndexChange]);

  const changedKeys = useMemo(() => {
    if (!step) return new Set<string>();
    const keys = new Set<string>();
    for (const [key, value] of Object.entries(step.locals)) {
      if (!previous || previous.locals[key] !== value) keys.add(key);
    }
    return keys;
  }, [previous, step]);

  if (!steps.length) {
    return (
      <div className="flex h-full min-h-[320px] items-center border border-charcoal/10 px-4 text-charcoal/60 md:min-h-[520px]">
        Play a walkthrough to watch values move.
      </div>
    );
  }

  const action = ACTION_META[step.action] ?? ACTION_META.compute;
  const headline = step.picture || step.caption;

  return (
      <div className="flex h-full min-h-[320px] flex-col border border-charcoal/10 bg-paper md:min-h-[520px]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-charcoal/10 bg-white px-3 py-3 md:px-4">
        <p className="meta text-charcoal/50">
          Now · {index + 1}/{steps.length} · line {step.line}
        </p>
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="hover-link min-h-11 px-2 text-sm"
            onClick={() => onIndexChange(Math.max(0, index - 1))}
          >
            Prev
          </button>
          <button
            type="button"
            className="min-h-11 rounded-full bg-charcoal px-4 text-sm text-white"
            onClick={() => setPlaying((value) => !value)}
          >
            {playing ? "Pause" : "Play"}
          </button>
          <button
            type="button"
            className="hover-link min-h-11 px-2 text-sm"
            onClick={() => onIndexChange(Math.min(steps.length - 1, index + 1))}
          >
            Next
          </button>
        </div>
      </div>

      <div className="flex-1 px-5 py-5">
        <span className="meta inline-flex rounded-full bg-charcoal px-3 py-1 text-accent">
          {action.label}
        </span>
        <p className="mt-4 text-2xl leading-snug tracking-tight text-charcoal md:text-3xl">{headline}</p>
        <p className="mt-3 max-w-md text-charcoal/70">{step.caption}</p>
        <p className="mt-2 text-sm text-charcoal/50">This line {action.verb}.</p>

        <div className="mt-6">
          <p className="meta mb-3 text-charcoal/40">Memory</p>
          {Object.keys(step.locals).length === 0 ? (
            <p className="text-sm text-charcoal/50">Nothing stored yet.</p>
          ) : (
            <div className="flex flex-wrap gap-3">
              {Object.entries(step.locals).map(([key, value]) => (
                <MemoryBox
                  key={key}
                  name={key}
                  value={value}
                  focused={step.focus === key}
                  changed={changedKeys.has(key)}
                />
              ))}
            </div>
          )}
        </div>

        <div className="mt-6">
          <p className="meta mb-3 text-charcoal/40">Printed so far</p>
          <pre className="min-h-[72px] rounded-xl bg-charcoal p-4 font-mono text-sm leading-6 text-accent whitespace-pre-wrap">
            {step.stdout || "—"}
          </pre>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 border-t border-charcoal/10 bg-white px-4 py-3">
        {steps.map((item, stepIndex) => (
          <button
            key={`${item.line}-${stepIndex}`}
            type="button"
            aria-label={`Step ${stepIndex + 1}`}
            aria-current={stepIndex === index ? "true" : undefined}
            onClick={() => onIndexChange(stepIndex)}
            className={`min-h-11 min-w-11 rounded-full transition-all duration-200 ${
              stepIndex === index ? "w-8 bg-charcoal" : "w-2.5 bg-charcoal/20 hover:bg-charcoal/50"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
