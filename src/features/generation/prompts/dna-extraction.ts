import type { ArtStyle, DetailLevel, AnimationType } from "../../characters/types";

export function buildDNAExtractionPrompt(prompt: string, artStyle: ArtStyle, detailLevel: DetailLevel): string {
  return `You are a pixel-art character designer for top-down RPG games (like Stardew Valley, Pokemon GBA, RPG Maker).
    Given a user's text description, extract structured Character DNA as JSON.

    User prompt: "${prompt}"
    Art style: ${artStyle}
    Detail level: ${detailLevel}

    Return ONLY valid JSON matching this structure:
    {
      "name": "descriptive name, 2-4 words max",
      "race": "human|elf|dwarf|orc|undead|robot|demon|angel|beast|fairy|elemental",
      "gender": "male|female|nonbinary",
      "class": "warrior|mage|rogue|ranger|paladin|ninja|samurai|monk|druid|necromancer|berserker|pirate|hunter|cleric|bard|gunslinger|engineer",
      "physical": {
        "hair": { "style": "specific hairstyle", "color": "specific color" },
        "eyes": { "color": "specific eye color", "shape": "almond|round|narrow|large" },
        "skin": { "tone": "pale|fair|olive|tan|brown|dark|blue|green|etc" },
        "build": "slim|athletic|muscular|heavy|petite|stocky",
        "height": "short|average|tall"
      },
      "equipment": {
        "head": "headgear name or null",
        "body": "body armor/clothing description",
        "legs": "legwear description",
        "mainHand": "weapon or tool name or null",
        "offHand": "shield or secondary item or null",
        "accessories": ["accessory1", "accessory2"]
      },
      "style": {
        "artStyle": "${artStyle}",
        "palette": ["#hexcolor1", "#hexcolor2", "#hexcolor3", "#hexcolor4", "#hexcolor5"],
        "detailLevel": "${detailLevel}"
      },
      "directions": {
        "up": "Detailed visual description of the character seen from behind in top-down view. Describe what you see: back of head, hair, shoulders, back of armor, back of legs. 25-50 words.",
        "down": "Detailed visual description of the character seen from front in top-down view. Describe what you see: face, chest armor, belt, front of legs. 25-50 words.",
        "left": "Detailed visual description of the character facing left in side profile, top-down view. Describe what you see: left side of face, left arm, left side of body, left leg. 25-50 words.",
        "right": "Detailed visual description of the character facing right in side profile, top-down view. Describe what you see: right side of face, right arm, right side of body, right leg. 25-50 words."
      },
      "tags": ["relevant", "keyword", "tags"]
    }

    Rules:
    - Directions MUST describe the character appearance from the specified viewing angle in top-down pixel-art RPG perspective
    - Keep direction descriptions concise but visually detailed (25-50 words each)
    - The character MUST be visually consistent across all 4 directions
    - Use pixel-art relevant vocabulary (sprite, tile, palette, pixel, chibi)
    - Infer missing details creatively but stay consistent with the user's original prompt
    - Palette must contain exactly 5 hex colors appropriate for pixel art`;
}

export function buildSheetGenerationPrompt(dna: Record<string, unknown>): string {
  const directions = dna.directions as Record<string, string>;
  const physical = dna.physical as Record<string, { style?: string; color?: string; shape?: string; tone?: string }>;
  const equipment = dna.equipment as Record<string, unknown>;
  const style = dna.style as { artStyle?: string };

  return `Create a pixel-art character sprite sheet for a top-down RPG game.
    Arrange the character in a strict 2x2 grid layout:

    * Top-Left: Character seen from the BACK (facing UP / away from viewer)
    * Top-Right: Character seen from the FRONT (facing DOWN / toward viewer)
    * Bottom-Left: Character seen from the LEFT side
    * Bottom-Right: Character seen from the RIGHT side

    Character Details:

    Name: ${dna.name}

    Race: ${dna.race} - ${dna.gender} ${dna.class}

    Hair: ${physical?.hair?.color || ""} ${physical?.hair?.style || ""}

    Build: ${physical?.build || ""} build

    Body Equipment: ${equipment?.body}

    Weapon: ${equipment?.mainHand || "none"}

    Directional Appearance:

    * BACK (Top-Left): ${directions?.up || "Character from behind"}
    * FRONT (Top-Right): ${directions?.down || "Character from front"}
    * LEFT (Bottom-Left): ${directions?.left || "Character facing left"}
    * RIGHT (Bottom-Right): ${directions?.right || "Character facing right"}

    Style:

    * ${style?.artStyle || "16bit"} pixel art RPG style
    * Clean pixel art
    * Sharp pixel edges
    * No anti-aliasing
    * No smoothing
    * No motion blur
    * No painterly rendering
    * No soft shading
    * Consistent sprite proportions across all directions
    * Vibrant RPG palette

    Consistency Requirements:

    * All 4 cells must contain the EXACT SAME character
    * Same face, hair, body proportions, clothing, armor, weapon, and colors
    * Only the viewing angle changes
    * Character scale must remain identical in all directions
    * Equipment must remain identical in every pose

    Layout Requirements:

    * Single image
    * Strict 2x2 grid
    * Equal-sized quadrants
    * Equal spacing
    * Character centered inside each quadrant
    * Each sprite fills its quadrant evenly
    * No cropped body parts
    * No overlapping between quadrants

    Background Requirements:

    * Fully transparent background (alpha channel)
    * Transparent PNG sprite sheet
    * No green screen
    * No solid background color
    * No floor
    * No environment
    * No scenery
    * No shadows
    * No lighting effects outside the character
    * All empty space must be completely transparent

    Important:

    * Character must be clearly readable at game-sprite scale
    * Strong silhouette from all directions
    * Clean separation between character and transparent background
    * Do not use green tones in the character design itself
    * Output as a professional RPG sprite sheet ready for game development
   `;
}

const animationDescriptions: Record<AnimationType, string> = {
  idle: "Character standing still with a subtle 2-frame idle bob/breathing cycle. Slight body movement, hair sway, or cape flutter",
  walk: "Full walk cycle. Legs alternate stepping forward, arms swing opposite to legs, body bobs slightly up/down with each step",
  run: "Fast run cycle. Longer stride, more dynamic arm swing, body leaning forward into the run, legs extended further",
  attack: "Weapon swing or melee attack cycle. Wind-up, strike, follow-through. If no weapon, a punch or kick combo",
  hit: "Taking damage reaction. Character flinches, recoils backward, staggers from impact. Brief hurt animation",
  death: "Death sequence. Character collapses, falls to ground, final pose. Melodramatic RPG death sprite",
};

export function buildSpritePackPrompt(dna: Record<string, unknown>, animation: AnimationType, frameCount: number): string {
  const directions = dna.directions as Record<string, string>;
  const physical = dna.physical as Record<string, { style?: string; color?: string; shape?: string; tone?: string }>;
  const equipment = dna.equipment as Record<string, unknown>;
  const style = dna.style as { artStyle?: string; palette?: string[] };

  const animDesc = animationDescriptions[animation] || "Animation cycle";
  const paletteInfo = style?.palette?.length ? `Color Palette: ${style.palette.join(", ")}` : "";

  return `Create a pixel-art character ${animation.toUpperCase()} animation sprite sheet for a top-down RPG game.
    Arrange the character in a strict grid layout: 4 rows × ${frameCount} columns.

    Grid Layout:
    * Row 1 (top): Character facing UP / away from viewer — ${frameCount} frames of ${animation} animation from behind
    * Row 2: Character facing DOWN / toward viewer — ${frameCount} frames of ${animation} animation from front
    * Row 3: Character facing LEFT — ${frameCount} frames of ${animation} animation from left side
    * Row 4 (bottom): Character facing RIGHT — ${frameCount} frames of ${animation} animation from right side

    Each column represents one frame of the animation sequence, progressing from left to right.

    Animation: ${animation.toUpperCase()}
    Description: ${animDesc}
    Frames per direction: ${frameCount}

    Character Details:
    Name: ${dna.name}
    Race: ${dna.race} — ${dna.gender} ${dna.class}
    Hair: ${physical?.hair?.color || ""} ${physical?.hair?.style || ""}
    Build: ${physical?.build || ""} build
    Body Equipment: ${equipment?.body}
    Weapon: ${equipment?.mainHand || "none"}

    Directional Appearance:
    * UP (Row 1): ${directions?.up || "Character from behind"}
    * DOWN (Row 2): ${directions?.down || "Character from front"}
    * LEFT (Row 3): ${directions?.left || "Character facing left"}
    * RIGHT (Row 4): ${directions?.right || "Character facing right"}

    Style:
    * ${style?.artStyle || "16bit"} pixel art RPG style
    * Clean pixel art, sharp pixel edges
    * No anti-aliasing, no smoothing, no motion blur, no painterly rendering, no soft shading
    * ${paletteInfo}
    * Vibrant RPG palette
    * Consistent sprite proportions across ALL frames and directions

    Consistency Requirements:
    * All frames must contain the EXACT SAME character — same face, hair, body, clothing, armor, weapon, colors
    * Each row must show a smooth, coherent ${frameCount}-frame ${animation} cycle
    * Animation should read clearly left-to-right within each row
    * Character scale must remain identical across all frames
    * Equipment must remain identical in every frame
    * Only the pose/animation frame changes

    Grid Layout Requirements:
    * Single image, strict 4×${frameCount} grid
    * Equal-sized cells, equal spacing between cells
    * Character centered inside each cell
    * Each sprite fills its cell evenly
    * No cropped body parts
    * No overlapping between cells

    Background Requirements:
    * Fully transparent background (alpha channel)
    * Transparent PNG sprite sheet
    * No green screen, no solid background color
    * No floor, no environment, no scenery
    * No shadows, no lighting effects outside character
    * All empty space must be completely transparent

    Important:
    * Character must be clearly readable at game-sprite scale
    * Strong silhouette from all directions in all frames
    * Clean separation between character and transparent background
    * Do not use green tones in the character design itself
    * Output as a professional RPG animation sprite sheet ready for game development
   `;
}
