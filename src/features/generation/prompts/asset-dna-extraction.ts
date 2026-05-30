import type { ArtStyle, DetailLevel, AssetCategory } from "@/features/assets/types";

export function buildAssetDNAExtractionPrompt(
  prompt: string,
  category: AssetCategory,
  artStyle: ArtStyle,
  detailLevel: DetailLevel
): string {
  const needDirections = ["WALL", "FURNITURE", "BUILDING"].includes(category);

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
  },${needDirections ? `
  "directions": {
    "up": "description of how this asset looks when viewed from above (back side)",
    "down": "description of how this asset looks when viewed from below (front side)",
    "left": "description of how this asset looks when viewed from left side",
    "right": "description of how this asset looks when viewed from right side"
  },` : ""}
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

${needDirections
  ? "- directions: describe what this asset looks like from each of the 4 cardinal directions (up/north, down/south, left/west, right/east). Be specific about visual elements that would differ across directions."
  : ""}

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

  const needDirections = ["WALL", "FURNITURE", "BUILDING"].includes(category);

  if (needDirections && directions) {
    return `Create a pixel-art game asset sprite sheet for "${name}" (${category}).
Art style: ${artStyle} pixel art (clean outlines, limited palette, flat shading).
Material: ${material}. Aesthetic: ${aesthetic}. Colors: ${colors}.

Layout: 2x2 grid of 4 directional views (UP/DOWN/LEFT/RIGHT), each tile is exactly 64x64 pixels.
- Top-left (UP): ${directions.up}
- Bottom-left (DOWN): ${directions.down} 
- Bottom-right (LEFT): ${directions.left}
- Top-right (RIGHT): ${directions.right}

Grid must be precise — 4 equal quadrants, no gaps, no labels. Transparent background.
Each direction view should be a distinct sprite based on what you'd see from that perspective.
Consistent size and proportion across all 4 frames.`;
  }

  return `Create a pixel-art game asset for "${name}" (${category}).
Art style: ${artStyle} pixel art (clean outlines, limited palette, flat shading).
Material: ${material}. Aesthetic: ${aesthetic}. Colors: ${colors}.

Create a single, centered asset image on a transparent background.
The asset should fill most of the frame with clean pixel edges.
No text, no labels, no UI elements. Just the pixel art asset.
Consistent pixel size — no anti-aliasing, no gradients.`;
}
