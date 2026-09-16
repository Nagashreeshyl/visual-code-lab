export const MAX_CODE_CHARS = 12_000;
export const MAX_TRACE_STEPS = 40;
export const MAX_SAVED_LESSONS = 50;

export const EASE_EDITORIAL = [0.16, 1, 0.3, 1] as const;

export const LANGUAGES = [
  { id: "javascript", label: "JavaScript" },
  { id: "typescript", label: "TypeScript" },
  { id: "python", label: "Python" },
  { id: "go", label: "Go" },
  { id: "java", label: "Java" },
  { id: "rust", label: "Rust" },
] as const;

export type LanguageId = (typeof LANGUAGES)[number]["id"];

export const GROQ_ANALYZE_MODEL = "openai/gpt-oss-120b";
export const GROQ_TRACE_MODEL = "openai/gpt-oss-120b";
export const OPENROUTER_FREE_MODEL = "openrouter/free";
