import { openai } from "@/lib/openai";
import type { CharacterDNA, AnimationType, Direction, SpritePackConfig } from "@/features/sprites/types";
import { buildSpritePackPrompt, buildDirectionalSpritePackPrompt } from "./prompts/dna-extraction";
import { AI } from "@/lib/constants";

export interface AnimationSheetResult {
  animation: AnimationType;
  frameCount: number;
  imageBuffer: Buffer;
  revisedPrompt: string;
}

export interface DirectionalAnimationSheetResult {
  animation: AnimationType;
  direction: Direction;
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
          content: "You are a pixel-art sprite analyst. Analyze the master sheet and output a structured visual identity report. Be SPECIFIC and CONCRETE. List exact visual details an image generator needs to reproduce this character in ANY pose. NO markdown, NO fluff, NO vague descriptions.",
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analyze this pixel-art RPG character master sheet (2x2 grid: back/front/left/right views).

Output a structured visual identity report with these sections:

SILHOUETTE: Overall body outline shape (5-10 words)
HEAD: Head and helmet shape, hairstyle from all angles (10-20 words)
FACE: Eye shape, expression, facial features visible from front (5-10 words)
ARMOR/CLOTHING: Every piece of armor and clothing, exact design details (15-30 words)
WEAPON: Weapon type, size, carry position, visible from which angles (10-15 words)
PALETTE: List exact hex color codes visible (at least 5)
PROPORTIONS: Head-to-body ratio, limb thickness (5-10 words)
RECOGNITION: 3-5 unique visual hooks that instantly identify this character
DIRECTIONS:
- BACK: What is visible from behind
- FRONT: What is visible from front
- LEFT: What is visible from left side
- RIGHT: What is visible from right side

Be specific enough that an image generator can recreate this EXACT character in animation frames with different poses.`,
            },
            {
              type: "image_url",
              image_url: { url: imageUrl, detail: "high" },
            },
          ],
        },
      ],
      max_tokens: 1000,
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

export async function generateDirectionalAnimationSheet(
  dna: CharacterDNA,
  animation: AnimationType,
  direction: Direction,
  frameCount: number,
  masterSheetReference?: string | null
): Promise<DirectionalAnimationSheetResult> {
  const imagePrompt = buildDirectionalSpritePackPrompt(
    dna as unknown as Record<string, unknown>,
    animation,
    direction,
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
    throw new Error("No directional animation sheet generated from OpenAI");
  }

  return { animation, direction, frameCount, imageBuffer, revisedPrompt };
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
