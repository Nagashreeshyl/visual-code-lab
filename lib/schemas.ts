import { z } from "zod";
import { MAX_CODE_CHARS, MAX_TRACE_STEPS } from "./constants";

export const analyzeRequestSchema = z.object({
  code: z.string().min(1).max(MAX_CODE_CHARS),
  language: z.string().min(1).max(40),
});

export const annotationSchema = z.object({
  startLine: z.coerce.number().int().min(1),
  endLine: z.coerce.number().int().min(1),
  label: z.string(),
  note: z.string(),
});

const VISUAL_ROLES = ["input", "hold", "loop", "transform", "gate", "output", "error"] as const;

export const visualRoleSchema = z.enum(VISUAL_ROLES);

export const visualPieceSchema = z.object({
  id: z.string(),
  role: z
    .string()
    .transform((value) => value.trim().toLowerCase())
    .pipe(visualRoleSchema.catch("transform")),
  title: z.string(),
  what: z.string(),
  sample: z.string().optional().default(""),
  tokens: z.array(z.string()).max(8).optional().default([]),
  before: z.string().optional().default(""),
  after: z.string().optional().default(""),
  startLine: z.coerce.number().int().min(1),
  endLine: z.coerce.number().int().min(1),
});

export const visualSchema = z.object({
  insight: z.string().optional().default(""),
  metaphor: z.string().optional().default(""),
  pieces: z.array(visualPieceSchema).default([]),
});

export const analyzeSchema = z.object({
  title: z.string(),
  summary: z.string(),
  mermaid: z.string().optional().default(""),
  visual: visualSchema.optional(),
  annotations: z.array(annotationSchema).default([]),
  functions: z
    .array(
      z.object({
        name: z.string(),
        purpose: z.string(),
      }),
    )
    .default([]),
});

export const simplifySchema = z.object({
  simplifiedCode: z.string(),
  changes: z
    .array(
      z.object({
        title: z.string(),
        why: z.string(),
      }),
    )
    .default([]),
});

export const traceStepSchema = z.object({
  line: z.coerce.number().int().min(1),
  caption: z.string(),
  action: z.string().optional().default("compute"),
  focus: z.string().optional().default(""),
  picture: z.string().optional().default(""),
  locals: z
    .record(z.string(), z.union([z.string(), z.number(), z.boolean(), z.null()]))
    .default({})
    .transform((value) =>
      Object.fromEntries(
        Object.entries(value).map(([key, item]) => [key, item == null ? "null" : String(item)]),
      ),
    ),
  stdout: z.string().optional().default(""),
});

export const traceSchema = z.object({
  steps: z.array(traceStepSchema).max(MAX_TRACE_STEPS),
});

export type AnalyzeResult = z.infer<typeof analyzeSchema>;
export type SimplifyResult = z.infer<typeof simplifySchema>;
export type TraceResult = z.infer<typeof traceSchema>;
export type TraceStep = z.infer<typeof traceStepSchema>;
export type Annotation = z.infer<typeof annotationSchema>;
export type VisualMap = z.infer<typeof visualSchema>;
export type VisualPiece = z.infer<typeof visualPieceSchema>;
export type VisualRole = z.infer<typeof visualRoleSchema>;

export const lessonSchema = z.object({
  id: z.string(),
  title: z.string(),
  language: z.string(),
  original: z.string(),
  simplified: z.string(),
  mermaid: z.string().optional().default(""),
  visual: visualSchema.optional(),
  summary: z.string().optional().default(""),
  annotations: z.array(annotationSchema).default([]),
  steps: z.array(traceStepSchema).default([]),
  changes: z
    .array(
      z.object({
        title: z.string(),
        why: z.string(),
      }),
    )
    .default([]),
  createdAt: z.number(),
  provider: z.string().optional(),
});

export type Lesson = z.infer<typeof lessonSchema>;
