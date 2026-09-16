import { LANGUAGES, type LanguageId } from "@/lib/constants";

const IDS = LANGUAGES.map((item) => item.id);

export function detectLanguage(code: string): LanguageId {
  const src = code.trim();
  if (!src) return "javascript";

  const scores: Record<LanguageId, number> = {
    javascript: 0,
    typescript: 0,
    python: 0,
    go: 0,
    java: 0,
    rust: 0,
  };

  const bump = (id: LanguageId, amount: number, pattern: RegExp) => {
    if (pattern.test(src)) scores[id] += amount;
  };

  bump("python", 5, /^\s*def\s+\w+\s*\(/m);
  bump("python", 4, /^\s*(from\s+\w+\s+import|import\s+\w+)/m);
  bump("python", 3, /^\s*(elif|except|pass|yield|None|True|False)\b/m);
  bump("python", 2, /\bprint\s*\(/);
  bump("python", 2, /:\s*(#.*)?$/m);

  bump("typescript", 5, /\b(interface|enum)\s+\w+/);
  bump("typescript", 4, /\btype\s+\w+\s*=/);
  bump("typescript", 3, /:\s*(string|number|boolean|void|Promise|Record)\b/);
  bump("typescript", 2, /\bas\s+(const|string|number)\b/);

  bump("javascript", 3, /\b(function|const|let|async|await)\b/);
  bump("javascript", 3, /=>/);
  bump("javascript", 2, /\b(console\.log|document|window|fetch)\b/);
  bump("javascript", 2, /\b(module\.exports|require\s*\()/);

  bump("go", 6, /^\s*package\s+\w+/m);
  bump("go", 4, /\bfunc\s+\w+\s*\(/);
  bump("go", 3, /\bfmt\.(Print|Sprint)/);

  bump("java", 6, /\bpublic\s+class\s+\w+/);
  bump("java", 4, /\bSystem\.out\.print/);
  bump("java", 3, /\bpublic\s+static\s+void\s+main/);

  bump("rust", 5, /\bfn\s+\w+\s*\(/);
  bump("rust", 5, /println!\s*\(/);
  bump("rust", 3, /\blet\s+mut\b/);
  bump("rust", 3, /\bimpl\s+\w+/);

  let best: LanguageId = "javascript";
  let high = -1;
  for (const id of IDS) {
    if (scores[id] > high) {
      high = scores[id];
      best = id;
    }
  }
  return high <= 0 ? "javascript" : best;
}

export function languageLabel(id: string) {
  return LANGUAGES.find((item) => item.id === id)?.label ?? id;
}
