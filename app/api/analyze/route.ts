import { analyzeSchema } from "@/lib/schemas";
import { analyzeMessages } from "@/lib/llm/prompts";
import { runLlmRoute } from "@/lib/llm/route";

export async function POST(request: Request) {
  return runLlmRoute({
    request,
    task: "analyze",
    schema: analyzeSchema,
    schemaHint:
      '{ "title": string, "summary": string, "visual": { insight, metaphor, pieces: [{id, role, title, what, sample, startLine, endLine}] }, "annotations": Annotation[], "functions": {name, purpose}[] }',
    messages: analyzeMessages,
  });
}
