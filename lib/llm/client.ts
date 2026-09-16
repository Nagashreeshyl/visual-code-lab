import type { ZodType } from "zod";
import {
  GROQ_ANALYZE_MODEL,
  GROQ_TRACE_MODEL,
  OPENROUTER_FREE_MODEL,
} from "@/lib/constants";
import { repairMessages } from "@/lib/llm/prompts";

export type LlmProvider = "groq" | "openrouter";
export type LlmTask = "analyze" | "simplify" | "trace";

export type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export class LlmError extends Error {
  status: number;
  constructor(message: string, status = 502) {
    super(message);
    this.name = "LlmError";
    this.status = status;
  }
}

function groqModelFor(task: LlmTask) {
  return task === "trace" ? GROQ_TRACE_MODEL : GROQ_ANALYZE_MODEL;
}

function extractJsonText(raw: string) {
  const trimmed = raw.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  const body = fenced ? fenced[1].trim() : trimmed;
  const start = body.indexOf("{");
  const end = body.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) {
    throw new LlmError("Model did not return JSON.", 502);
  }
  return body.slice(start, end + 1);
}

function contentFromChoice(payload: unknown): string {
  if (!payload || typeof payload !== "object") return "";
  const choices = (payload as { choices?: Array<{ message?: { content?: unknown } }> })
    .choices;
  const content = choices?.[0]?.message?.content;
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    return content
      .map((part) =>
        typeof part === "string"
          ? part
          : part && typeof part === "object" && "text" in part
            ? String((part as { text: unknown }).text)
            : "",
      )
      .join("");
  }
  return "";
}

async function postChat(
  url: string,
  headers: Record<string, string>,
  body: unknown,
  timeoutMs: number,
): Promise<{ ok: boolean; status: number; json: unknown; text: string }> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...headers },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    const text = await res.text();
    let json: unknown = null;
    try {
      json = JSON.parse(text);
    } catch {
      json = { raw: text };
    }
    return { ok: res.ok, status: res.status, json, text };
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new LlmError("The model timed out.", 504);
    }
    throw new LlmError("Network error talking to the model.", 502);
  } finally {
    clearTimeout(timer);
  }
}

function errorMessageFrom(json: unknown, fallback: string) {
  if (json && typeof json === "object") {
    const err = (json as { error?: { message?: string } | string }).error;
    if (typeof err === "string") return err;
    if (err && typeof err.message === "string") return err.message;
  }
  return fallback;
}

async function chatOnce(
  provider: LlmProvider,
  model: string,
  messages: ChatMessage[],
  timeoutMs: number,
  jsonMode = true,
): Promise<string> {
  if (provider === "groq") {
    const key = process.env.GROQ_API_KEY;
    if (!key) throw new LlmError("GROQ_API_KEY is missing.", 500);
    const body: Record<string, unknown> = {
      model,
      temperature: 0.2,
      messages,
    };
    if (jsonMode) body.response_format = { type: "json_object" };
    const result = await postChat(
      "https://api.groq.com/openai/v1/chat/completions",
      { Authorization: `Bearer ${key}` },
      body,
      timeoutMs,
    );
    if (!result.ok) {
      throw new LlmError(
        errorMessageFrom(result.json, `Groq error (${result.status})`),
        result.status,
      );
    }
    const text = contentFromChoice(result.json);
    if (!text) throw new LlmError("Groq returned an empty response.", 502);
    return text;
  }

  const key = process.env.OPENROUTER_API_KEY;
  if (!key) throw new LlmError("OPENROUTER_API_KEY is missing.", 500);
  const body: Record<string, unknown> = {
    model,
    temperature: 0.2,
    messages,
  };
  if (jsonMode) body.response_format = { type: "json_object" };
  const result = await postChat(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      Authorization: `Bearer ${key}`,
      "HTTP-Referer": process.env.OPENROUTER_SITE_URL ?? "http://localhost:3000",
      "X-Title": "Visual Code Lab",
    },
    body,
    timeoutMs,
  );
  if (!result.ok) {
    throw new LlmError(
      errorMessageFrom(result.json, `OpenRouter error (${result.status})`),
      result.status,
    );
  }
  const text = contentFromChoice(result.json);
  if (!text) throw new LlmError("OpenRouter returned an empty response.", 502);
  return text;
}

function isRetryableStatus(status: number) {
  return status === 404 || status === 408 || status === 429 || status >= 500;
}

async function completeWithProvider(
  provider: LlmProvider,
  model: string,
  messages: ChatMessage[],
  timeoutMs: number,
): Promise<string> {
  try {
    return await chatOnce(provider, model, messages, timeoutMs, true);
  } catch (error) {
    const status = error instanceof LlmError ? error.status : 502;
    if (status === 400) {
      return chatOnce(provider, model, messages, timeoutMs, false);
    }
    throw error;
  }
}

export async function completeJson<T>(options: {
  task: LlmTask;
  messages: ChatMessage[];
  schema: ZodType<T>;
  schemaHint: string;
}): Promise<{ data: T; provider: LlmProvider }> {
  const groqKey = process.env.GROQ_API_KEY;
  const openrouterKey = process.env.OPENROUTER_API_KEY;
  if (!groqKey && !openrouterKey) {
    throw new LlmError(
      "Add GROQ_API_KEY or OPENROUTER_API_KEY in .env.local.",
      500,
    );
  }

  const timeoutMs = options.task === "trace" ? 60_000 : 90_000;
  const queue: Array<{ provider: LlmProvider; model: string }> = [];
  if (groqKey) {
    queue.push({ provider: "groq", model: groqModelFor(options.task) });
  }
  if (openrouterKey) {
    queue.push({ provider: "openrouter", model: OPENROUTER_FREE_MODEL });
  }

  let lastError: unknown;

  for (const attempt of queue) {
    try {
      const first = await completeWithProvider(
        attempt.provider,
        attempt.model,
        options.messages,
        timeoutMs,
      );
      const parsed = tryParse(first, options.schema);
      if (parsed) return { data: parsed, provider: attempt.provider };

      const repairedText = await completeWithProvider(
        attempt.provider,
        attempt.model,
        [
          ...options.messages,
          { role: "assistant", content: first },
          repairMessages(first, options.schemaHint),
        ],
        timeoutMs,
      );
      const repaired = tryParse(repairedText, options.schema);
      if (repaired) return { data: repaired, provider: attempt.provider };

      lastError = new LlmError(`Invalid JSON from ${attempt.provider}.`, 502);
    } catch (error) {
      lastError = error;
      const status = error instanceof LlmError ? error.status : 502;
      const canFallback =
        attempt.provider === "groq" &&
        (isRetryableStatus(status) || status === 400 || status === 401 || status === 403);
      if (!canFallback && attempt.provider === "openrouter") break;
      continue;
    }
  }

  if (lastError instanceof LlmError) throw lastError;
  throw new LlmError("Both Groq and OpenRouter failed. Try again shortly.", 429);
}

function tryParse<T>(raw: string, schema: ZodType<T>): T | null {
  try {
    const json: unknown = JSON.parse(extractJsonText(raw));
    const result = schema.safeParse(json);
    return result.success ? result.data : null;
  } catch {
    return null;
  }
}
