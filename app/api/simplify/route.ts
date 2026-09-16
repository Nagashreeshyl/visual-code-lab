import { NextResponse } from "next/server";
import { simplifySchema } from "@/lib/schemas";
import { minifyRepairMessage, simplifyMessages } from "@/lib/llm/prompts";
import { completeJson, LlmError } from "@/lib/llm/client";
import { analyzeRequestSchema } from "@/lib/schemas";
import { looksLikeMinify } from "@/lib/simplify";

export async function POST(request: Request) {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = analyzeRequestSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Provide code and a language." }, { status: 400 });
  }

  const schemaHint =
    '{ "simplifiedCode": string, "changes": [{ "title": string, "why": string }] }';
  const baseMessages = simplifyMessages(parsed.data.code, parsed.data.language);

  try {
    let result = await completeJson({
      task: "simplify",
      schema: simplifySchema,
      schemaHint,
      messages: baseMessages,
    });

    if (looksLikeMinify(parsed.data.code, result.data.simplifiedCode)) {
      result = await completeJson({
        task: "simplify",
        schema: simplifySchema,
        schemaHint,
        messages: [
          ...baseMessages,
          { role: "assistant", content: JSON.stringify(result.data) },
          minifyRepairMessage(result.data.simplifiedCode),
        ],
      });
    }

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof LlmError) {
      const status = error.status === 401 || error.status === 403 ? 502 : error.status;
      return NextResponse.json(
        {
          error:
            error.status === 401 || error.status === 403
              ? "The model provider rejected this request. Try again in a moment."
              : error.message,
        },
        { status },
      );
    }
    return NextResponse.json({ error: "Simplify failed." }, { status: 502 });
  }
}
