import { NextResponse } from "next/server";
import { z } from "zod";
import { completeJson, LlmError, type ChatMessage, type LlmTask } from "@/lib/llm/client";
import { analyzeRequestSchema } from "@/lib/schemas";
import type { ZodType } from "zod";

export async function runLlmRoute<T>(options: {
  request: Request;
  task: LlmTask;
  schema: ZodType<T>;
  schemaHint: string;
  messages: (code: string, language: string) => ChatMessage[];
}) {
  let json: unknown;
  try {
    json = await options.request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = analyzeRequestSchema.safeParse(json);
  if (!parsed.success) {
    const tooLong = parsed.error.issues.some((issue) => issue.code === "too_big");
    return NextResponse.json(
      {
        error: tooLong
          ? "Paste is too long. Trim it under 12,000 characters."
          : "Provide code and a language.",
      },
      { status: tooLong ? 413 : 400 },
    );
  }

  try {
    const result = await completeJson({
      task: options.task,
      schema: options.schema,
      schemaHint: options.schemaHint,
      messages: options.messages(parsed.data.code, parsed.data.language),
    });
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof LlmError) {
      const status =
        error.status === 401 || error.status === 403 ? 502 : error.status;
      const message =
        error.status === 401 || error.status === 403
          ? "The model provider rejected this request. Try again in a moment."
          : error.message;
      return NextResponse.json({ error: message }, { status });
    }
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Unexpected model shape." }, { status: 502 });
    }
    return NextResponse.json(
      { error: "Something went wrong talking to the model." },
      { status: 502 },
    );
  }
}
