import { openai } from "@/lib/openai";
import type { RiggedSpriteDNA, BodyPartDNA, BodyPartName } from "@/features/rigged-sprites/types";
import { AI } from "@/lib/constants";

export function buildBodyPartGenerationPrompt(
  dna: RiggedSpriteDNA,
  partName: BodyPartName,
  part: BodyPartDNA
): string {
  const style = dna.style;
  const palette = part.colorPalette.length > 0 ? part.colorPalette : style.palette;
  const paletteStr = palette.length > 0
    ? `Color palette: ${palette.join(", ")}. Use ONLY these colors.`
    : "";

  const dirs = part.directions;
  const physical = dna.physical;

  return `Create a ${style.artStyle || "16bit"} pixel art sprite sheet for a SINGLE BODY PART: ${partName.toUpperCase()}.

This is ONE ISOLATED body part of a modular ${dna.pov || "top-down"} RPG character.
Context: ${dna.race} ${dna.gender}, ${dna.class} class, ${physical.build} build, ${physical.height} height, skin tone: ${physical.skin?.tone || "default"}.

IMPORTANT: Generate ONLY the "${partName}" body part. Nothing else. No background character, no other body parts.

ABSOLUTE RULES — VIOLATING THESE RUINS THE OUTPUT:
- This MUST be pure pixel art. Every pixel is intentional.
- Sharp pixel edges only — NO anti-aliasing, NO smoothing, NO blur.
- NO soft shading, NO gradients, NO painterly rendering.
- ${paletteStr}
- Vibrant, limited-color RPG palette with crisp contrast.
- GENERATE ONLY THE SPECIFIED BODY PART. Do not draw the whole character.

ARRANGEMENT — strict 2x2 grid:
- Top-Left: ${partName.toUpperCase()} from BACK (facing UP / away from viewer) — ${dirs?.up || `Back view of ${partName}`}
- Top-Right: ${partName.toUpperCase()} from FRONT (facing DOWN / toward viewer) — ${dirs?.down || `Front view of ${partName}`}
- Bottom-Left: ${partName.toUpperCase()} from LEFT side — ${dirs?.left || `Left view of ${partName}`}
- Bottom-Right: ${partName.toUpperCase()} from RIGHT side — ${dirs?.right || `Right view of ${partName}`}

CONSISTENCY:
- Same ${partName} in all 4 angles — only viewing angle changes
- Same colors, same proportions across all quadrants
- ${partName} centered in each quadrant

SIZE:
- The ${partName} should fill roughly 60-80% of each quadrant
- Reasonable pixel dimensions for a ${style.artStyle || "16bit"} RPG sprite ${partName}
- NOT a tiny detail, NOT overflowing the quadrant

BACKGROUND — fully transparent:
- Alpha channel transparency only — PNG sprite sheet
- NO green screen, NO solid background color
- NO floor, NO environment, NO scenery
- All empty space must be completely transparent

OUTPUT:
- Cleanly separated ${partName} sprite ready to be composited with other body parts via rigging
- Strong silhouette from all directions
- ${partName} is clearly readable and recognizable in isolation`;
}

export async function generateBodyPartSheet(
  dna: RiggedSpriteDNA,
  partName: BodyPartName,
  part: BodyPartDNA
): Promise<{ imageUrl?: string; imageBuffer?: Buffer; revisedPrompt: string }> {
  const imagePrompt = buildBodyPartGenerationPrompt(dna, partName, part);

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
