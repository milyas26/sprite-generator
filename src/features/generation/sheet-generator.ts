import { openai } from "@/lib/openai";
import type { CharacterDNA } from "@/features/characters/types";
import { buildSheetGenerationPrompt } from "./prompts/dna-extraction";
import { AI } from "@/lib/constants";

export async function generateCharacterSheet(
  dna: CharacterDNA
): Promise<{ imageUrl?: string; imageBuffer?: Buffer; revisedPrompt: string }> {
  const imagePrompt = buildSheetGenerationPrompt(dna as unknown as Record<string, unknown>);

  const response = await openai.images.generate({
    model: 'gpt-image-1.5',
    prompt: imagePrompt,
    n: 1,
    size: AI.SHEET_SIZE as "1024x1024",
    quality: "medium",
    background: "transparent",
  });

  const imageData = response.data?.[0];
  const revisedPrompt = imageData?.revised_prompt;
  const imageUrl = imageData?.url;
  const b64Json = imageData?.b64_json;

  if (imageUrl) {
    return { imageUrl, revisedPrompt: revisedPrompt || imagePrompt };
  }

  if (b64Json) {
    return { imageBuffer: Buffer.from(b64Json, "base64"), revisedPrompt: revisedPrompt || imagePrompt };
  }

  throw new Error("No image generated from OpenAI");
}
