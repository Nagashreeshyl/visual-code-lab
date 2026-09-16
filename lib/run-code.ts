export type RunResult = {
  stdout: string;
  error: string | null;
  timedOut?: boolean;
};

const JS_TIMEOUT_MS = 4000;
const PY_TIMEOUT_MS = 12000;

type Pyodide = {
  runPythonAsync: (code: string) => Promise<unknown>;
  setStdout: (opts: { batched: (text: string) => void }) => void;
  setStderr: (opts: { batched: (text: string) => void }) => void;
  globals: { set: (name: string, value: unknown) => void };
};

let pyodidePromise: Promise<Pyodide> | null = null;

function stripTypeScript(code: string) {
  return code
    .replace(/^\s*import\s+type\s+[^;]+;?/gm, "")
    .replace(/\b(public|private|protected|readonly|abstract|declare)\s+/g, "")
    .replace(/\bas\s+const\b/g, "")
    .replace(/\bas\s+[A-Za-z_][\w.<>,\s[\]|&?]*/g, "")
    .replace(/interface\s+[A-Za-z_]\w*[\s\S]*?\{[\s\S]*?\n\}/g, "")
    .replace(/type\s+[A-Za-z_]\w*\s*=\s*[^;]+;/g, "")
    .replace(/:\s*[A-Za-z_[\].<>,\s|&?']+(?=\s*[=),;{}])/g, "");
}

function runJavaScript(code: string): Promise<RunResult> {
  return new Promise((resolve) => {
    const workerSource = `
      self.onmessage = function (event) {
        var logs = [];
        var write = function () {
          logs.push(Array.prototype.slice.call(arguments).map(String).join(" "));
        };
        console.log = write;
        console.info = write;
        console.warn = write;
        console.error = write;
        try {
          var result = (0, eval)(event.data);
          if (result !== undefined) logs.push(String(result));
          self.postMessage({ ok: true, stdout: logs.join("\\n") });
        } catch (err) {
          self.postMessage({
            ok: false,
            stdout: logs.join("\\n"),
            error: err && err.message ? String(err.message) : String(err),
          });
        }
      };
    `;
    const blob = new Blob([workerSource], { type: "text/javascript" });
    const url = URL.createObjectURL(blob);
    const worker = new Worker(url);
    const timer = window.setTimeout(() => {
      worker.terminate();
      URL.revokeObjectURL(url);
      resolve({ stdout: "", error: "The program ran too long and was stopped.", timedOut: true });
    }, JS_TIMEOUT_MS);

    worker.onmessage = (event: MessageEvent<{ ok: boolean; stdout?: string; error?: string }>) => {
      window.clearTimeout(timer);
      worker.terminate();
      URL.revokeObjectURL(url);
      const payload = event.data;
      resolve({
        stdout: payload.stdout ?? "",
        error: payload.ok ? null : payload.error || "The program crashed.",
      });
    };
    worker.onerror = (event) => {
      window.clearTimeout(timer);
      worker.terminate();
      URL.revokeObjectURL(url);
      resolve({ stdout: "", error: event.message || "The program crashed." });
    };
    worker.postMessage(code);
  });
}

async function loadPyodide(): Promise<Pyodide> {
  if (pyodidePromise) return pyodidePromise;
  pyodidePromise = (async () => {
    const global = window as unknown as { loadPyodide?: (opts: { indexURL: string }) => Promise<Pyodide> };
    if (!global.loadPyodide) {
      await new Promise<void>((resolve, reject) => {
        const script = document.createElement("script");
        script.src = "https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.js";
        script.onload = () => resolve();
        script.onerror = () => reject(new Error("Could not load the Python runtime."));
        document.head.appendChild(script);
      });
    }
    if (!global.loadPyodide) {
      throw new Error("Could not load the Python runtime.");
    }
    return global.loadPyodide({
      indexURL: "https://cdn.jsdelivr.net/pyodide/v0.26.4/full/",
    });
  })();
  return pyodidePromise;
}

async function runPython(code: string): Promise<RunResult> {
  const pyodide = await loadPyodide();
  let stdout = "";
  pyodide.setStdout({ batched: (text) => { stdout += text; } });
  pyodide.setStderr({ batched: (text) => { stdout += text; } });
  pyodide.globals.set("input", () => "");

  const run = pyodide.runPythonAsync(code);
  const timeout = new Promise<never>((_, reject) => {
    window.setTimeout(() => reject(new Error("timed-out")), PY_TIMEOUT_MS);
  });

  try {
    const result = await Promise.race([run, timeout]);
    if (result !== undefined && result !== null && String(result) && String(result) !== "undefined") {
      stdout = stdout ? `${stdout}\n${String(result)}` : String(result);
    }
    return { stdout: stdout.trim(), error: null };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (message === "timed-out") {
      return { stdout: stdout.trim(), error: "The program ran too long and was stopped.", timedOut: true };
    }
    return { stdout: stdout.trim(), error: message };
  }
}

export function canRunInBrowser(language: string) {
  return language === "javascript" || language === "typescript" || language === "python";
}

export async function runCode(code: string, language: string): Promise<RunResult> {
  const source = code.trim();
  if (!source) return { stdout: "", error: "Paste some code first." };

  if (language === "javascript") return runJavaScript(source);
  if (language === "typescript") return runJavaScript(stripTypeScript(source));
  if (language === "python") return runPython(source);

  return {
    stdout: "",
    error: "Run in the browser works for JavaScript, TypeScript, and Python.",
  };
}
