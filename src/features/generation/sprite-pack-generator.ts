import { openai } from "@/lib/openai";
import type { CharacterDNA, AnimationType, SpritePackConfig } from "@/features/characters/types";
import { buildSpritePackPrompt } from "./prompts/dna-extraction";
import { AI } from "@/lib/constants";

export interface AnimationSheetResult {
  animation: AnimationType;
  frameCount: number;
  imageBuffer: Buffer;
  revisedPrompt: string;
}

export async function analyzeMasterSheet(imageUrl: string): Promise<string | null> {
  try {
    const response = await openai.chat.completions.create({
      model: AI.VISION_MODEL,
      messages: [
        {
          role: "system",
          content: "You are a pixel-art sprite analyst. Examine the master sheet image and extract every visual detail needed to faithfully reproduce the character in animation frames. Output a dense, structured description. NO markdown, NO fluff.",
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Analyze this pixel-art RPG character master sheet (2×2 grid: up/down/left/right). Extract: hair (style + color), face/eyes, skin tone, body build, clothing/armor (head, body, legs, accessories), weapon(s), any unique marks or details, overall silhouette, exact color palette (list hex codes), art style, character scale/proportions. Describe what the character looks like from each direction — back (facing up), front (facing down), left, right. Be specific enough that an image generator can recreate this EXACT character in animation frames.",
            },
            {
              type: "image_url",
              image_url: { url: imageUrl, detail: "high" },
            },
          ],
        },
      ],
      max_tokens: 800,
      temperature: 0.1,
    });

    return response.choices[0]?.message?.content || null;
  } catch {
    return null;
  }
}

export async function generateAnimationSheet(
  dna: CharacterDNA,
  animation: AnimationType,
  frameCount: number,
  masterSheetReference?: string | null
): Promise<AnimationSheetResult> {
  const imagePrompt = buildSpritePackPrompt(
    dna as unknown as Record<string, unknown>,
    animation,
    frameCount,
    masterSheetReference
  );

  const response = await openai.images.generate({
    model: 'gpt-image-1.5',
    prompt: imagePrompt,
    n: 1,
    size: AI.SHEET_SIZE as "1024x1024",
    quality: "medium",
    background: "transparent",
  });

  const imageData = response.data?.[0];
  const revisedPrompt = imageData?.revised_prompt ?? imagePrompt;
  const imageUrl = imageData?.url;
  const b64Json = imageData?.b64_json;

  let imageBuffer: Buffer;
  if (b64Json) {
    imageBuffer = Buffer.from(b64Json, "base64");
  } else if (imageUrl) {
    const imageResponse = await fetch(imageUrl);
    imageBuffer = Buffer.from(await imageResponse.arrayBuffer());
  } else {
    throw new Error("No animation sheet generated from OpenAI");
  }

  return { animation, frameCount, imageBuffer, revisedPrompt };
}

export async function generateSpritePack(
  dna: CharacterDNA,
  configs: SpritePackConfig[],
  masterSheetReference?: string | null
): Promise<AnimationSheetResult[]> {
  const results: AnimationSheetResult[] = [];

  for (const config of configs) {
    const result = await generateAnimationSheet(dna, config.animation, config.frameCount, masterSheetReference);
    results.push(result);
  }

  return results;
}
