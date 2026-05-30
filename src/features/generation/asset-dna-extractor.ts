import { openai } from "@/lib/openai";
import { assetDNASchema } from "@/features/assets/validators";
import type { AssetCategory, ArtStyle, DetailLevel } from "@/features/assets/types";
import { buildAssetDNAExtractionPrompt } from "./prompts/asset-dna-extraction";
import { AI } from "@/lib/constants";

const MAX_VALIDATION_RETRIES = 2;

async function callOpenAI(messages: { role: string; content: string }[]) {
  const response = await openai.chat.completions.create({
    model: AI.DNA_EXTRACTION_MODEL,
    messages: messages as any,
    temperature: AI.DNA_TEMPERATURE,
    response_format: { type: "json_object" },
  });

  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error("No DNA generated from OpenAI");

  return { content, tokens: response.usage?.total_tokens || 0 };
}

export async function extractAssetDNA(
  prompt: string,
  category: AssetCategory,
  artStyle: ArtStyle,
  detailLevel: DetailLevel
): Promise<{ dna: Record<string, unknown>; tokens: number }> {
  const systemPrompt = buildAssetDNAExtractionPrompt(prompt, category, artStyle, detailLevel);

  const messages = [
    { role: "system", content: "You are a precise game asset designer. Output ONLY valid JSON. No markdown, no explanation." },
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
      const parsed = JSON.parse(content);
      parsed.prompt = prompt;
      const validated = assetDNASchema.parse(parsed);
      return { dna: validated as Record<string, unknown>, tokens: totalTokens };
    } catch (err: any) {
      if (err instanceof SyntaxError) {
        lastError = `Invalid JSON: ${err.message}`;
      } else if (err?.issues) {
        lastError = err.issues
          .map((i: any) => `Field "${i.path.join(".")}": ${i.message}`)
          .join("\n");
      } else {
        throw err;
      }

      if (attempt === MAX_VALIDATION_RETRIES) {
        throw new Error(`Asset DNA extraction failed after ${MAX_VALIDATION_RETRIES + 1} attempts:\n${lastError}`);
      }
    }
  }

  throw new Error("Unreachable");
}
