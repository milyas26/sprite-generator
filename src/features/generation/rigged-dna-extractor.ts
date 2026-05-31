import { openai } from "@/lib/openai";
import { riggedSpriteDNASchema } from "@/features/rigged-sprites/validators";
import type { RiggedSpriteDNA, ArtStyle, DetailLevel, RiggedSpriteDetailsInput } from "@/features/rigged-sprites/types";
import { buildRiggedDNAExtractionPrompt } from "./prompts/rigged-dna-extraction";
import { AI } from "@/lib/constants";

const MAX_VALIDATION_RETRIES = 2;

async function callOpenAI(messages: { role: string; content: string }[]) {
  const response = await openai.chat.completions.create({
    model: AI.DNA_EXTRACTION_MODEL,
    messages: messages as unknown as Array<{ role: "system" | "user" | "assistant"; content: string }>,
    temperature: AI.DNA_TEMPERATURE,
    response_format: { type: "json_object" },
  });

  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error("No DNA generated from OpenAI");

  return { content, tokens: response.usage?.total_tokens || 0 };
}

function processBodyParts(raw: Record<string, unknown>): Record<string, unknown> {
  const parts: Record<string, unknown> = {};
  const expected = ["head", "hair", "torso", "arms", "legs", "weapon", "shield", "accessory"];

  for (const key of expected) {
    const part = raw[key];
    if (part === null || part === undefined) continue;
    parts[key] = part;
  }

  return parts;
}

export async function extractRiggedSpriteDNA(
  prompt: string,
  artStyle: ArtStyle,
  detailLevel: DetailLevel,
  details?: RiggedSpriteDetailsInput
): Promise<{ dna: RiggedSpriteDNA; tokens: number }> {
  const systemPrompt = buildRiggedDNAExtractionPrompt(prompt, artStyle, detailLevel, details);

  const messages = [
    { role: "system", content: "You are a precise RPG character designer. Output ONLY valid JSON. No markdown, no explanation." },
    { role: "user", content: systemPrompt },
  ];

  let totalTokens = 0;
  let lastError: string | null = null;

  for (let attempt = 0; attempt <= MAX_VALIDATION_RETRIES; attempt++) {
    const attemptMessages = [...messages];
    if (lastError) {
      attemptMessages.push({
        role: "user",
        content: `Your previous JSON was invalid. Fix these validation errors and output ONLY the corrected JSON:\n${lastError}`,
      });
    }

    const { content, tokens } = await callOpenAI(attemptMessages);
    totalTokens += tokens;

    try {
      const parsed: Record<string, unknown> = JSON.parse(content);

      if (parsed.bodyParts && typeof parsed.bodyParts === "object") {
        parsed.bodyParts = processBodyParts(parsed.bodyParts as Record<string, unknown>);
      }

      parsed.prompt = prompt;
      const validated = riggedSpriteDNASchema.parse(parsed);
      return { dna: validated as unknown as RiggedSpriteDNA, tokens: totalTokens };
    } catch (err: unknown) {
      if (err instanceof SyntaxError) {
        lastError = `Invalid JSON: ${err.message}`;
      } else if (typeof err === "object" && err !== null && "issues" in err) {
        const zodErr = err as { issues: Array<{ path: (string | number)[]; message: string }> };
        lastError = zodErr.issues
          .map((i: { path: (string | number)[]; message: string }) => `Field "${i.path.join(".")}": ${i.message}`)
          .join("\n");
      } else {
        throw err;
      }

      if (attempt === MAX_VALIDATION_RETRIES) {
        throw new Error(`Rigged DNA extraction failed after ${MAX_VALIDATION_RETRIES + 1} attempts:\n${lastError}`);
      }
    }
  }

  throw new Error("Unreachable");
}
