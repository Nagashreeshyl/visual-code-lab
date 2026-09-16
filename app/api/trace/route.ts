import { traceSchema } from "@/lib/schemas";
import { traceMessages } from "@/lib/llm/prompts";
import { runLlmRoute } from "@/lib/llm/route";

export async function POST(request: Request) {
  return runLlmRoute({
    request,
    task: "trace",
    schema: traceSchema,
    schemaHint:
      '{ "steps": [{ "line": number, "action": "assign|loop|branch|call|return|print|fetch|compute", "focus": string, "picture": string, "caption": string, "locals": Record<string,string>, "stdout": string }] }',
    messages: traceMessages,
  });
}
