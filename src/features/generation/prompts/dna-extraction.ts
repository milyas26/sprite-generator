import type { ArtStyle, DetailLevel, AnimationType, CharacterDetailsInput } from "@/features/sprites/types";

export function buildDNAExtractionPrompt(prompt: string, artStyle: ArtStyle, detailLevel: DetailLevel, details?: CharacterDetailsInput): string {
  const constraints: string[] = [];

  if (details) {
    if (details.name) constraints.push(`- Character name MUST be "${details.name}"`);
    if (details.gender) constraints.push(`- Gender MUST be "${details.gender}"`);
    if (details.race) constraints.push(`- Race MUST be "${details.race}"`);
    if (details.class) constraints.push(`- Class MUST be "${details.class}"`);
    if (details.hairStyle) constraints.push(`- Hair style MUST be "${details.hairStyle}"`);
    if (details.hairColor) constraints.push(`- Hair color MUST be "${details.hairColor}"`);
    if (details.skinTone) constraints.push(`- Skin tone MUST be "${details.skinTone}"`);
    if (details.eyeColor) constraints.push(`- Eye color MUST be "${details.eyeColor}"`);
    if (details.build) constraints.push(`- Build MUST be "${details.build}"`);
    if (details.height) constraints.push(`- Height MUST be "${details.height}"`);
    if (details.pov) constraints.push(`- Point of view MUST be "${details.pov}"`);
  }

  const constraintsBlock = constraints.length > 0
    ? `\nUSER-SPECIFIED CONSTRAINTS — you MUST honor these exactly:\n${constraints.join("\n")}\n`
    : "";

  return `You are a pixel-art character designer for top-down RPG games (Stardew Valley, Pokemon GBA, RPG Maker).
    Given a user's text description, extract structured Character DNA as JSON.

    User prompt: "${prompt}"
    Art style: ${artStyle} pixel art
    Detail level: ${detailLevel}${constraintsBlock}
    Return ONLY valid JSON matching this structure:
    {
      "name": "descriptive name, 2-4 words max",
      "race": "human|elf|dwarf|orc|undead|robot|demon|angel|beast|fairy|elemental",
      "gender": "male|female|nonbinary",
      "class": "warrior|mage|rogue|ranger|paladin|ninja|samurai|monk|druid|necromancer|berserker|pirate|hunter|cleric|bard|gunslinger|engineer",
      "pov": "${details?.pov || "top-down"}",
      "physical": {
        "hair": { "style": "specific hairstyle", "color": "specific color name" },
        "eyes": { "color": "specific eye color name", "shape": "almond|round|narrow|large" },
        "skin": { "tone": "pale|fair|olive|tan|brown|dark|blue|green" },
        "build": "slim|athletic|muscular|heavy|petite|stocky",
        "height": "short|average|tall"
      },
      "equipment": {
        "head": "headgear name or null",
        "body": "body armor/clothing description",
        "legs": "legwear description",
        "mainHand": "weapon or tool name or null",
        "offHand": "shield or secondary item or null",
        "accessories": ["accessory1"]
      },
      "style": {
        "artStyle": "${artStyle}",
        "palette": ["#hex1", "#hex2", "#hex3", "#hex4", "#hex5"],
        "detailLevel": "${detailLevel}"
      },
      "directions": {
        "up": "Visual description from behind in top-down view. Back of head, hair, shoulders, back of armor, back of legs. 25-50 words.",
        "down": "Visual description from front in top-down view. Face, chest armor, belt, front of legs. 25-50 words.",
        "left": "Visual description facing left in side profile, top-down view. Left side of face, left arm, left side of body, left leg. 25-50 words.",
        "right": "Visual description facing right in side profile, top-down view. Right side of face, right arm, right side of body, right leg. 25-50 words."
      },
      "tags": ["keyword1", "keyword2"]
    }

    CRITICAL RULES:
    - artStyle MUST be exactly "${artStyle}" — do not change it.
    - detailLevel MUST be exactly "${detailLevel}" — do not change it.
    - pov field MUST be "${details?.pov || "top-down"}" — do not change it.
    - Palette must contain exactly 5 hex colors suitable for ${artStyle} pixel art. Colors must match the character. NO duplicate colors.
    - Directions MUST describe the character appearance from the specified viewing angle in ${details?.pov || "top-down"} pixel-art RPG perspective.
    - Keep direction descriptions concise but visually detailed (25-50 words each).
    - The character MUST be visually consistent across all 4 directions — same clothing, same colors, same proportions.
    - Use pixel-art vocabulary (sprite, tile, palette, pixel, chibi).
    - Infer missing details creatively but stay faithful to the user's original prompt.
    - Describe physical traits using concrete visual language an image generator can render.`;
}

export function buildSheetGenerationPrompt(dna: Record<string, unknown>): string {
  const directions = dna.directions as Record<string, string>;
  const physical = dna.physical as Record<string, { style?: string; color?: string; shape?: string; tone?: string }>;
  const equipment = dna.equipment as Record<string, unknown>;
  const style = dna.style as { artStyle?: string; palette?: string[] };

  const paletteInfo = style?.palette?.length ? `Color palette: ${style.palette.join(", ")}. Use ONLY these colors.` : "";

  const skinTone = physical?.skin?.tone ? `Skin: ${physical.skin.tone}` : "";
  const eyeInfo = physical?.eyes?.color ? `Eyes: ${physical.eyes.color}` : "";
  const heightInfo = physical?.height ? `Height: ${physical.height}` : "";
  const headGear = equipment?.head ? `Head: ${equipment.head}` : "";
  const legGear = equipment?.legs ? `Legs: ${equipment.legs}` : "";
  const offHand = equipment?.offHand ? `Off-hand: ${equipment.offHand}` : "";
  const accessories = equipment?.accessories && Array.isArray(equipment.accessories) && equipment.accessories.length > 0
    ? `Accessories: ${(equipment.accessories as string[]).join(", ")}`
    : "";
  const tags = dna.tags && Array.isArray(dna.tags) && (dna.tags as string[]).length > 0
    ? `Tags: ${(dna.tags as string[]).join(", ")}`
    : "";

  return `Create a ${style?.artStyle || "16bit"} pixel art character sprite sheet.
    ABSOLUTE RULES — VIOLATING THESE RUINS THE OUTPUT:
    - This MUST be pure pixel art. Every pixel is intentional.
    - Sharp pixel edges only — NO anti-aliasing, NO smoothing, NO blur of any kind.
    - NO soft shading, NO gradients, NO painterly rendering, NO realistic lighting.
    - ${paletteInfo}
    - Vibrant, limited-color RPG palette with crisp contrast.
    - Consistent sprite proportions across all 4 directions.

    Arrange the character in a strict 2x2 grid:

    * Top-Left: Character seen from BACK (facing UP / away from viewer)
    * Top-Right: Character seen from FRONT (facing DOWN / toward viewer)
    * Bottom-Left: Character seen from LEFT side
    * Bottom-Right: Character seen from RIGHT side

    CHARACTER — visual consistency is mandatory:

    Name: ${dna.name}
    Race: ${dna.race} — ${dna.gender} ${dna.class}
    Hair: ${physical?.hair?.color || ""} ${physical?.hair?.style || ""}
    Build: ${physical?.build || ""} build
    ${heightInfo}
    ${skinTone}
    ${eyeInfo}
    Body: ${equipment?.body || "none"}
    ${legGear}
    ${headGear}
    Weapon: ${equipment?.mainHand || "none"}
    ${offHand}
    ${accessories}
    ${tags}

    DIRECTIONAL APPEARANCE — use these exact descriptions for each cell:

    BACK (Top-Left): ${directions?.up || "Character from behind"}
    FRONT (Top-Right): ${directions?.down || "Character from front"}
    LEFT (Bottom-Left): ${directions?.left || "Character facing left"}
    RIGHT (Bottom-Right): ${directions?.right || "Character facing right"}

    CONSISTENCY — non-negotiable:

    - All 4 cells contain the EXACT SAME character — same face, hair, body, build, clothing, armor, weapon, colors.
    - Only the viewing angle changes. Nothing else.
    - Character scale identical in all 4 directions.
    - Equipment identical in every pose.

    LAYOUT:

    - Single image, strict 2x2 grid
    - Equal-sized quadrants, equal spacing
    - Character centered inside each quadrant
    - Each sprite fills its quadrant evenly
    - No cropped body parts, no overlapping between quadrants

    BACKGROUND — fully transparent:

    - Alpha channel transparency only — PNG sprite sheet
    - NO green screen, NO solid background color
    - NO floor, NO environment, NO scenery, NO shadows
    - NO lighting effects outside the character
    - All empty space must be completely transparent

    OUTPUT:

    - Character clearly readable at game-sprite scale
    - Strong silhouette from all directions
    - Clean separation between character and transparent background
    - Professional RPG sprite sheet ready for game engine import
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

export function buildSpritePackPrompt(
  dna: Record<string, unknown>,
  animation: AnimationType,
  frameCount: number,
  masterSheetReference?: string | null
): string {
  const directions = dna.directions as Record<string, string>;
  const physical = dna.physical as Record<string, { style?: string; color?: string; shape?: string; tone?: string }>;
  const equipment = dna.equipment as Record<string, unknown>;
  const style = dna.style as { artStyle?: string; palette?: string[] };

  const animDesc = animationDescriptions[animation] || "Animation cycle";
  const paletteInfo = style?.palette?.length ? `Color palette: ${style.palette.join(", ")}. Use ONLY these colors.` : "";

  const skinTone = physical?.skin?.tone ? `Skin: ${physical.skin.tone}` : "";
  const eyeInfo = physical?.eyes?.color ? `Eyes: ${physical.eyes.color} (${physical.eyes.shape || "almond"})` : "";
  const heightInfo = physical?.height ? `Height: ${physical.height}` : "";
  const headGear = equipment?.head ? `Head: ${equipment.head}` : "";
  const legGear = equipment?.legs ? `Legs: ${equipment.legs}` : "";
  const offHand = equipment?.offHand ? `Off-hand: ${equipment.offHand}` : "";
  const accessories = equipment?.accessories && Array.isArray(equipment.accessories) && equipment.accessories.length > 0
    ? `Accessories: ${(equipment.accessories as string[]).join(", ")}`
    : "";
  const tags = dna.tags && Array.isArray(dna.tags) && (dna.tags as string[]).length > 0
    ? `Tags: ${(dna.tags as string[]).join(", ")}`
    : "";

  const referenceBlock = masterSheetReference
    ? `\nMASTER SHEET REFERENCE — this is the EXACT character you must recreate in animation form:\n${masterSheetReference}\n\nCRITICAL: Match EVERY visual detail from the reference above. Same colors, same proportions, same outfit, same face, same silhouette. The master sheet IS the ground truth.`
    : "";

  return `Create a ${style?.artStyle || "16bit"} pixel art ${animation.toUpperCase()} animation sprite sheet.${referenceBlock}
    ABSOLUTE RULES — VIOLATING THESE RUINS THE OUTPUT:
    - This MUST be pure pixel art. Every pixel is intentional.
    - Sharp pixel edges only — NO anti-aliasing, NO smoothing, NO blur of any kind.
    - NO soft shading, NO gradients, NO painterly rendering, NO realistic lighting.
    - ${paletteInfo}
    - Vibrant, limited-color RPG palette with crisp contrast.
    - Consistent sprite proportions across ALL frames and directions.

    Arrange the character in a strict grid: 4 rows × ${frameCount} columns.

    Grid Layout:
    * Row 1 (top): Character facing UP / away from viewer — ${frameCount} frames of ${animation} animation from behind
    * Row 2: Character facing DOWN / toward viewer — ${frameCount} frames of ${animation} animation from front
    * Row 3: Character facing LEFT — ${frameCount} frames of ${animation} animation from left side
    * Row 4 (bottom): Character facing RIGHT — ${frameCount} frames of ${animation} animation from right side

    Each column is one frame of the animation, progressing left to right.

    Animation: ${animation.toUpperCase()}
    Description: ${animDesc}
    Frames per direction: ${frameCount}

    CHARACTER — visual consistency is mandatory:

    Name: ${dna.name}
    Race: ${dna.race} — ${dna.gender} ${dna.class}
    Hair: ${physical?.hair?.color || ""} ${physical?.hair?.style || ""}
    Build: ${physical?.build || ""} build
    ${heightInfo}
    ${skinTone}
    ${eyeInfo}
    Body: ${equipment?.body || "none"}
    ${legGear}
    ${headGear}
    Weapon: ${equipment?.mainHand || "none"}
    ${offHand}
    ${accessories}
    ${tags}

    DIRECTIONAL APPEARANCE — use these exact descriptions for each row:

    UP (Row 1 / Back): ${directions?.up || "Character from behind"}
    DOWN (Row 2 / Front): ${directions?.down || "Character from front"}
    LEFT (Row 3): ${directions?.left || "Character facing left"}
    RIGHT (Row 4): ${directions?.right || "Character facing right"}

    CONSISTENCY — non-negotiable:
    - All frames contain the EXACT SAME character — same face, hair, body, build, clothing, armor, weapon, colors.
    - Only the viewing angle and animation frame change. Nothing else.
    - Each row shows a smooth, coherent ${frameCount}-frame ${animation} cycle.
    - Animation reads clearly left-to-right within each row.
    - Character scale identical across all frames and directions.
    - Equipment identical in every frame.
    - Only the pose/animation frame changes.

    GRID LAYOUT:
    - Single image, strict 4×${frameCount} grid
    - Equal-sized cells, equal spacing
    - Character centered inside each cell
    - Each sprite fills its cell evenly
    - No cropped body parts, no overlapping between cells

    BACKGROUND — fully transparent:
    - Alpha channel transparency only — PNG sprite sheet
    - NO green screen, NO solid background color
    - NO floor, NO environment, NO scenery, NO shadows
    - NO lighting effects outside the character
    - All empty space must be completely transparent

    OUTPUT:
    - Character clearly readable at game-sprite scale
    - Strong silhouette from all directions in all frames
    - Clean separation between character and transparent background
    - Professional RPG animation sprite sheet ready for game engine import
   `;
}
