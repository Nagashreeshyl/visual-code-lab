import { fillVisual } from "@/lib/visual";
import type { Annotation, Lesson, TraceStep, VisualMap, VisualRole } from "@/lib/schemas";

type ExamplePiece = {
  id: string;
  role: VisualRole;
  title: string;
  what: string;
  sample?: string;
  tokens?: string[];
  before?: string;
  after?: string;
  startLine: number;
  endLine: number;
};

export type ExampleLesson = Omit<Lesson, "id" | "createdAt" | "visual" | "annotations" | "steps"> & {
  id: string;
  year: string;
  preview: string[];
  category: string;
  visual?: {
    insight: string;
    metaphor: string;
    pieces: ExamplePiece[];
  };
  annotations: Annotation[];
  steps: TraceStep[];
};

export const EXAMPLES: ExampleLesson[] = [
  {
    id: "nested-fetch",
    title: "Nested fetch callbacks",
    category: "JavaScript",
    language: "javascript",
    year: "2026",
    preview: [
      "fetch(url).then(function (res) {",
      "  return res.json().then(function (user) {",
      "    fetch('/posts/' + user.id)",
      "  })",
      "})",
    ],
    original: `function fetchUserData(userId, cb) {
  fetch("/api/users/" + userId)
    .then(function (res) {
      return res.json().then(function (user) {
        fetch("/api/posts/" + user.id)
          .then(function (res2) {
            return res2.json().then(function (posts) {
              cb(null, {
                user: user,
                posts: posts.filter(function (p) {
                  return p.published;
                }),
              });
            });
          })
          .catch(function (err) {
            cb(err);
          });
      });
    })
    .catch(function (err) {
      cb(err);
    });
}`,
    simplified: `async function fetchUserData(userId) {
  const user = await fetch(\`/api/users/\${userId}\`).then((res) => res.json());
  const posts = await fetch(\`/api/posts/\${user.id}\`).then((res) => res.json());
  return { user, posts: posts.filter((post) => post.published) };
}`,
    mermaid: "",
    visual: {
      insight: "Load a user, then their posts, then keep only the published ones.",
      metaphor: "a receptionist who looks up a person, then their folder, then throws away drafts",
      pieces: [
        {
          id: "p0",
          role: "input",
          title: "User id",
          what: "The function starts with one id and a callback.",
          sample: "userId = 42",
          startLine: 1,
          endLine: 1,
        },
        {
          id: "p1",
          role: "transform",
          title: "Fetch the user",
          what: "Ask the server for that person, then parse JSON.",
          sample: "{ id: 42, name: 'Ada' }",
          startLine: 2,
          endLine: 4,
        },
        {
          id: "p2",
          role: "transform",
          title: "Fetch their posts",
          what: "Use the user's id to load the post list.",
          sample: "GET /api/posts/42",
          startLine: 5,
          endLine: 9,
        },
        {
          id: "p3",
          role: "gate",
          title: "Keep published",
          what: "Drop drafts. Only published posts survive.",
          sample: "posts.filter(p => p.published)",
          startLine: 10,
          endLine: 14,
        },
        {
          id: "p4",
          role: "output",
          title: "Hand it back",
          what: "Call the callback with user plus filtered posts, or with an error.",
          sample: "{ user, posts: [2 published] }",
          startLine: 15,
          endLine: 24,
        },
      ],
    },
    summary:
      "A callback-heavy fetch chain loads a user, then their posts, then keeps published ones. Errors are forwarded through nested catch handlers.",
    annotations: [
      { startLine: 1, endLine: 1, label: "p0", note: "Entry: callback-style helper." },
      { startLine: 2, endLine: 4, label: "p1", note: "Load the user record." },
      { startLine: 5, endLine: 9, label: "p2", note: "Load posts for that user." },
      { startLine: 10, endLine: 14, label: "p3", note: "Keep published posts only." },
      { startLine: 15, endLine: 24, label: "p4", note: "Callback with the result or an error." },
    ],
    steps: [
      { line: 1, action: "call", focus: "userId", picture: "Call starts with user 42", caption: "Call fetchUserData with a user id and a callback.", locals: { userId: "42" }, stdout: "" },
      { line: 2, action: "fetch", focus: "userId", picture: "Waiting for /api/users/42", caption: "Request /api/users/42.", locals: { userId: "42" }, stdout: "" },
      { line: 4, action: "assign", focus: "user", picture: "user becomes Ada", caption: "Parse the user JSON.", locals: { user: "{ id: 42, name: Ada }" }, stdout: "" },
      { line: 5, action: "fetch", focus: "user.id", picture: "Waiting for that user's posts", caption: "Request /api/posts/42.", locals: { "user.id": "42" }, stdout: "" },
      { line: 9, action: "branch", focus: "posts", picture: "Drafts drop, two posts remain", caption: "Parse posts and keep published items.", locals: { posts: "[2 published]" }, stdout: "" },
      { line: 10, action: "return", focus: "posts", picture: "Callback gets the combined result", caption: "Invoke the callback with the combined result.", locals: { err: "null" }, stdout: "" },
    ],
    changes: [
      { title: "async/await", why: "Removes nested then/catch and reads top to bottom." },
      { title: "Return a value", why: "Callers can await instead of passing a callback." },
    ],
    provider: "example",
  },
  {
    id: "naive-fib",
    title: "Naive recursive fibonacci",
    category: "Python",
    language: "python",
    year: "2026",
    preview: [
      "def fib(n):",
      "    if n <= 1:",
      "        return n",
      "    return fib(n-1) + fib(n-2)",
    ],
    original: `def fib(n):
    if n < 0:
        raise ValueError("n must be >= 0")
    if n <= 1:
        return n
    return fib(n - 1) + fib(n - 2)

def first_n(count):
    values = []
    i = 0
    while i < count:
        values.append(fib(i))
        i = i + 1
    return values`,
    simplified: `def fib(n, memo={}):
    if n < 0:
        raise ValueError("n must be >= 0")
    if n <= 1:
        return n
    if n not in memo:
        memo[n] = fib(n - 1, memo) + fib(n - 2, memo)
    return memo[n]

def first_n(count):
    return [fib(i) for i in range(count)]`,
    mermaid: "",
    visual: {
      insight: "Each fib call splits into two smaller calls, so the same numbers are computed again and again.",
      metaphor: "a family tree that keeps drawing the same cousins",
      pieces: [
        {
          id: "p0",
          role: "input",
          title: "How many",
          what: "first_n wants the first count Fibonacci numbers.",
          sample: "count = 4",
          startLine: 8,
          endLine: 8,
        },
        {
          id: "p1",
          role: "loop",
          title: "Walk 0..count",
          what: "For each i, compute fib(i) and append it.",
          sample: "i = 0, 1, 2, 3",
          startLine: 9,
          endLine: 14,
        },
        {
          id: "p2",
          role: "gate",
          title: "Tiny n stops",
          what: "If n is 0 or 1, return n. No more splitting.",
          sample: "fib(1) → 1",
          startLine: 2,
          endLine: 5,
        },
        {
          id: "p3",
          role: "transform",
          title: "Split in two",
          what: "Otherwise call fib(n-1) and fib(n-2) and add them.",
          sample: "fib(3) = fib(2) + fib(1)",
          startLine: 6,
          endLine: 6,
        },
        {
          id: "p4",
          role: "output",
          title: "A list",
          what: "The loop returns the collected values.",
          sample: "[0, 1, 1, 2]",
          startLine: 14,
          endLine: 14,
        },
      ],
    },
    summary:
      "first_n builds a list by calling a recursive fibonacci helper. The helper branches twice per step, so it repeats a lot of work.",
    annotations: [
      { startLine: 1, endLine: 6, label: "p3", note: "Recursive fib with two base cases." },
      { startLine: 8, endLine: 14, label: "p1", note: "Collect the first count values in a loop." },
    ],
    steps: [
      { line: 8, action: "call", focus: "count", picture: "first_n starts with 4 slots", caption: "Start first_n with count = 4.", locals: { count: "4", values: "[]" }, stdout: "" },
      { line: 11, action: "loop", focus: "i", picture: "i is 0, ask fib(0)", caption: "i = 0. Compute fib(0).", locals: { i: "0" }, stdout: "" },
      { line: 4, action: "return", focus: "n", picture: "n is 0 so return 0", caption: "Base case: n is 0, return 0.", locals: { n: "0" }, stdout: "" },
      { line: 12, action: "assign", focus: "values", picture: "values becomes [0]", caption: "Append 0. i becomes 1.", locals: { values: "[0]", i: "1" }, stdout: "" },
      { line: 6, action: "compute", focus: "n", picture: "fib(3) splits into 2 and 1", caption: "Later calls split into fib(n-1) and fib(n-2).", locals: { n: "3" }, stdout: "" },
    ],
    changes: [
      { title: "Memoization", why: "Stops recomputing the same n over and over." },
      { title: "List comprehension", why: "first_n becomes one obvious line." },
    ],
    provider: "example",
  },
  {
    id: "verbose-client",
    title: "Verbose HTTP client class",
    category: "TypeScript",
    language: "typescript",
    year: "2026",
    preview: [
      "class ApiClient {",
      "  constructor(base: string) {",
      "    this.baseUrl = base;",
      "  }",
    ],
    original: `class ApiClient {
  baseUrl: string;
  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }
  getJson(path: string, callback: (error: Error | null, data?: unknown) => void) {
    const url = this.baseUrl.replace(/\\/$/, "") + "/" + path.replace(/^\\//, "");
    fetch(url)
      .then((response) => {
        if (!response.ok) {
          callback(new Error("Request failed: " + response.status));
          return;
        }
        return response.json();
      })
      .then((data) => {
        if (data !== undefined) {
          callback(null, data);
        }
      })
      .catch((error) => {
        callback(error);
      });
  }
}`,
    simplified: `class ApiClient {
  constructor(private baseUrl: string) {}

  async getJson<T>(path: string): Promise<T> {
    const url = new URL(path, this.baseUrl).toString();
    const response = await fetch(url);
    if (!response.ok) throw new Error(\`Request failed: \${response.status}\`);
    return response.json() as Promise<T>;
  }
}`,
    mermaid: "",
    visual: {
      insight: "Join a base URL with a path, fetch JSON, and report success or failure.",
      metaphor: "a clerk who writes an address, waits for the mail, then opens the envelope",
      pieces: [
        {
          id: "p0",
          role: "input",
          title: "API root",
          what: "The client stores the base URL.",
          sample: "https://api.test",
          startLine: 1,
          endLine: 5,
        },
        {
          id: "p1",
          role: "transform",
          title: "Build the URL",
          what: "Glue base and path together by hand.",
          sample: "https://api.test/users",
          startLine: 6,
          endLine: 8,
        },
        {
          id: "p2",
          role: "transform",
          title: "Fetch",
          what: "Send GET and wait.",
          sample: "GET /users",
          startLine: 9,
          endLine: 9,
        },
        {
          id: "p3",
          role: "gate",
          title: "Status check",
          what: "If not ok, callback with an error. Else parse JSON.",
          sample: "200 → json, 404 → Error",
          startLine: 10,
          endLine: 16,
        },
        {
          id: "p4",
          role: "output",
          title: "Callback",
          what: "Hand data or the caught error to the caller.",
          sample: "callback(null, data)",
          startLine: 17,
          endLine: 24,
        },
      ],
    },
    summary:
      "A small HTTP helper concatenates URLs, fetches JSON, and reports success or failure through a Node-style callback.",
    annotations: [
      { startLine: 1, endLine: 5, label: "p0", note: "Store the API root." },
      { startLine: 6, endLine: 8, label: "p1", note: "Join base URL and path by hand." },
      { startLine: 9, endLine: 24, label: "p2", note: "Fetch, check status, parse, callback." },
    ],
    steps: [
      { line: 3, action: "assign", focus: "baseUrl", picture: "Client remembers the API root", caption: "Construct the client with a base URL.", locals: { baseUrl: "https://api.test" }, stdout: "" },
      { line: 7, action: "compute", focus: "url", picture: "Path glued onto the root", caption: "Join base URL and path.", locals: { url: "https://api.test/users" }, stdout: "" },
      { line: 8, action: "fetch", focus: "path", picture: "Waiting on GET /users", caption: "Send the GET request.", locals: { path: "users" }, stdout: "" },
      { line: 10, action: "branch", focus: "status", picture: "200, so parse JSON", caption: "Response is ok, so parse JSON.", locals: { status: "200" }, stdout: "" },
      { line: 18, action: "return", focus: "data", picture: "Callback receives the payload", caption: "Callback with the payload.", locals: { error: "null" }, stdout: "" },
    ],
    changes: [
      { title: "Promises over callbacks", why: "Callers can await and use try/catch." },
      { title: "URL constructor", why: "Stops fragile string splicing." },
      { title: "Generics", why: "The JSON result is typed." },
    ],
    provider: "example",
  },
];

export function getExample(id: string) {
  return EXAMPLES.find((item) => item.id === id);
}

export function exampleToLesson(example: ExampleLesson): Lesson {
  return {
    id: example.id,
    title: example.title,
    language: example.language,
    original: example.original,
    simplified: example.simplified,
    mermaid: example.mermaid,
    visual: example.visual
      ? fillVisual(example.summary ?? "", example.annotations, example.visual as VisualMap)
      : undefined,
    summary: example.summary,
    annotations: example.annotations,
    steps: example.steps,
    changes: example.changes,
    createdAt: 0,
    provider: example.provider,
  };
}
