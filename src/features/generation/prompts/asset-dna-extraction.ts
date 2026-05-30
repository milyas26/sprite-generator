import type { ArtStyle, DetailLevel, AssetCategory } from "@/features/assets/types";

export function buildAssetDNAExtractionPrompt(
  prompt: string,
  category: AssetCategory,
  artStyle: ArtStyle,
  detailLevel: DetailLevel
): string {
  return `You are a pixel-art game asset designer for top-down RPG games (Stardew Valley, Pokemon GBA, RPG Maker, Zelda).
Given a user's text description, extract structured Asset DNA as JSON.

User prompt: "${prompt}"
Category: ${category}
Art style: ${artStyle} pixel art
Detail level: ${detailLevel}

Return ONLY valid JSON matching this structure:
{
  "name": "descriptive asset name, 2-5 words max",
  "category": "${category}",
  "pov": "top-down",
  "visual": {
    "colors": ["#hex1", "#hex2", "#hex3", "#hex4", "#hex5"],
    "material": "wood|stone|metal|fabric|glass|organic|crystal|magic",
    "scale": "tiny|small|medium|large|huge",
    "aesthetic": "rustic|medieval|futuristic|fantasy|industrial|natural|ancient|modern"
  },
  "directions": {
    "up": "description of how this asset looks when viewed from above (belakang/back side)",
    "down": "description of how this asset looks when viewed from below (depan/front side)",
    "left": "description of how this asset looks when viewed from left side (kiri)",
    "right": "description of how this asset looks when viewed from right side (kanan)"
  },
  "style": {
    "artStyle": "${artStyle}",
    "palette": ["#hex1", "#hex2", "#hex3", "#hex4", "#hex5"],
    "detailLevel": "${detailLevel}"
  },
  "tags": ["tag1", "tag2", "tag3"]
}

Guidelines:
- name: give a short, descriptive name appropriate for a game asset
- colors palette: choose colors that match the ${category} category and ${artStyle} aesthetic; use 5-8 hex codes
- material: infer the primary material from the description
- scale: estimate the asset's size relative to a 1-tile grid cell
- aesthetic: choose the best-fitting aesthetic era/genre
- tags: relevant keywords for filtering (theme, biome, style)
- directions: describe what this asset looks like from each of the 4 cardinal directions. "up" = belakang (back), "down" = depan (front), "left" = kiri (left), "right" = kanan (right). Be specific about visual elements that would differ across directions.

Output ONLY the JSON object, no markdown wrapping, no explanation.`;
}

export function buildAssetSheetGenerationPrompt(dna: Record<string, unknown>): string {
  const category = dna.category as string;
  const name = dna.name as string;
  const style = dna.style as Record<string, unknown>;
  const visual = dna.visual as Record<string, unknown>;
  const directions = dna.directions as Record<string, string> | undefined;
  const artStyle = style?.artStyle as string || "16bit";
  const material = visual?.material as string || "";
  const aesthetic = visual?.aesthetic as string || "";
  const colors = (visual?.colors as string[])?.join(", ") || "";

  return `Create a pixel-art game asset sprite sheet for "${name}" (${category}).
Art style: ${artStyle} pixel art (clean outlines, limited palette, flat shading).
Material: ${material}. Aesthetic: ${aesthetic}. Colors: ${colors}.

Layout: 2x2 grid of 4 directional views, each tile is exactly 64x64 pixels.
- Top-left (UP/belakang): ${directions?.up || "view from above/back"}
- Bottom-left (DOWN/depan): ${directions?.down || "view from below/front"}
- Bottom-right (LEFT/kiri): ${directions?.left || "view from left side"}
- Top-right (RIGHT/kanan): ${directions?.right || "view from right side"}

Grid must be precise — 4 equal quadrants, no gaps, no labels. Transparent background.
Each direction view should be a distinct sprite based on what you'd see from that perspective.
Consistent size and proportion across all 4 frames.`;
}
