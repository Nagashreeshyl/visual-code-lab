import { MAX_TRACE_STEPS } from "@/lib/constants";

const SHARED_RULES = `You are Visual Code Lab, a teacher for reading complex code.
Rules:
- Reply with a single JSON object only. No markdown fences. No prose outside JSON.
- Do not invent APIs, libraries, or behavior that is not in the source.
- Keep the original language and observable behavior.
- Prefer fewer statements and clearer names when rewriting. Never minify.
- Line numbers are 1-based and must refer to the SOURCE code the user pasted.`;

export function analyzeMessages(code: string, language: string) {
  return [
    { role: "system" as const, content: SHARED_RULES },
    {
      role: "user" as const,
      content: `Explain this ${language} program as a picture a beginner can read in one glance.

Do NOT return a mermaid flowchart, graph, or sequence of boxes-and-arrows. Return a visual map of what the program IS.

Return JSON:
{
  "title": "short lesson title",
  "summary": "2-3 sentence plain-English overview",
  "visual": {
    "insight": "one sentence that makes the whole program obvious",
    "metaphor": "everyday picture, e.g. a teacher walking a gradebook row by row",
    "pieces": [
      {
        "id": "p0",
        "role": "input",
        "title": "2-4 words",
        "what": "what this part does",
        "sample": "a tiny concrete value the reader can see",
        "tokens": ["Ada", "42"],
        "before": "userId = 42",
        "after": "{ id: 42, name: Ada }",
        "startLine": 1,
        "endLine": 4
      }
    ]
  },
  "annotations": [{ "startLine": 1, "endLine": 4, "label": "p0", "note": "what this region does" }],
  "functions": [{ "name": "foo", "purpose": "..." }]
}

Visual rules:
- 4 to 8 pieces, left-to-right as the story of the program (data in → change → result out).
- role must be one of: input, hold, loop, transform, gate, output, error.
- Put REAL sample values in sample and tokens so chips can move across the picture.
- tokens: 1-6 short values that exist at this stage (names, numbers, tiny labels).
- before/after: how the data looks entering and leaving this stage.
- A loop is ONE piece: "for each student, print a report" with one example item. Do not unroll the loop.
- First piece is usually the starting data. Last piece is what is printed or returned.
- annotations[].label must match visual.pieces[].id.
- No mermaid. No flowchart. No node ids like n0["Fetch"].

Source:
\`\`\`${language}
${code}
\`\`\``,
    },
  ];
}

export function simplifyMessages(code: string, language: string) {
  return [
    { role: "system" as const, content: SHARED_RULES },
    {
      role: "user" as const,
      content: `Rewrite this ${language} program. The goal is a REAL rewrite, not minification.

Return JSON:
{
  "simplifiedCode": "full rewritten source",
  "changes": [{ "title": "structural change", "why": "why the code is shorter and easier" }]
}

Hard rules:
- Do NOT delete spaces, squash statements onto one line, or pack dicts/lists/objects into one giant line.
- Keep normal indentation and one idea per line. Wrap long literals across lines.
- Change the STRUCTURE: extract helpers, use the language's idioms, drop redundant variables, merge duplicated logic, fix loop/print placement.
- Same language. Same observable behavior (same prints, same return values, same results).
- Clear names. No comments unless they replace a dense trick.
- If data is long, keep it as a readable multi-line literal or pull it into a small helper — never one 200-character line.

Bad (minified, reject this style):
students={"Akash":[("Math",90),("English",85)]}; total=sum(m for _,m in subjects); print("Student:",name)

Good (rewritten):
def report(name, subjects):
    total = sum(score for _, score in subjects)
    percent = total / len(subjects)
    print("Student:", name)
    print("Total Marks:", total)
    print("Percentage:", percent)

for name, subjects in students.items():
    report(name, subjects)

Source:
\`\`\`${language}
${code}
\`\`\``,
    },
  ];
}

export function minifyRepairMessage(previous: string) {
  return {
    role: "user" as const,
    content: `That rewrite is minified (long packed lines or only whitespace removed). Rewrite again as a structured, readable shorter program. One statement per line. Extract helpers. Do not squash dicts/lists onto one line.

Previous rewrite:
${previous.slice(0, 6000)}

Return ONLY the JSON object with simplifiedCode and changes.`,
  };
}

export function traceMessages(code: string, language: string) {
  return [
    { role: "system" as const, content: SHARED_RULES },
    {
      role: "user" as const,
      content: `Produce a simulated execution walkthrough for this ${language} code. This is a teaching trace, not a debugger.

Return JSON:
{
  "steps": [
    {
      "line": 1,
      "action": "assign",
      "focus": "name",
      "picture": "name is set to Akash",
      "caption": "plain English of what the computer is doing right now",
      "locals": { "name": "Akash" },
      "stdout": ""
    }
  ]
}

- At most ${MAX_TRACE_STEPS} steps.
- Cover the main happy path. Skip tiny bookkeeping.
- action must be one of: assign, loop, branch, call, return, print, fetch, compute.
- picture: 8 words max of what to SHOW (values moving, a loop taking the next item, a print appearing).
- focus: the variable the student should watch this step.
- locals values must be short strings. Include the important values AFTER this step runs.
- stdout is the full printed output so far, not only this line.
- line must exist in the source.

Source:
\`\`\`${language}
${code}
\`\`\``,
    },
  ];
}

export function repairMessages(
  previous: string,
  schemaHint: string,
): { role: "user"; content: string } {
  return {
    role: "user",
    content: `Your previous reply was not valid JSON for this schema:\n${schemaHint}\n\nPrevious reply:\n${previous.slice(0, 8000)}\n\nRespond with ONLY a corrected JSON object.`,
  };
}
