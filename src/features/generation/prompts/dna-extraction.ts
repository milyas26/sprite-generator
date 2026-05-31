import type { ArtStyle, DetailLevel, AnimationType, Direction, CharacterDetailsInput } from "@/features/sprites/types";

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
      "visualIdentity": {
        "silhouette": "overall body outline shape in 10-15 words. e.g. 'compact chunky figure with wide shoulders and flowing cape'",
        "headShape": "head shape description in 5-10 words. e.g. 'round head with pointed helmet'",
        "hairShape": "silhouette of hair style in 5-10 words. e.g. 'spiky upward hair with side wings'",
        "recognitionFeatures": ["3-5 unique visual features that identify this character instantly. e.g. 'glowing red eyes', 'gold-trimmed pauldrons', 'flowing red scarf'"],
        "dominantColors": ["list 3-5 main colors that define this character's appearance. e.g. 'crimson red', 'gold', 'dark steel'"],
        "weaponCarryStyle": "how the weapon is held or sheathed in 5-10 words. e.g. 'katana sheathed at left hip'",
        "bodyProportions": "body proportions in 5-10 words. e.g. 'chibi 2-head-tall with large head'"
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
    - visualIdentity fields describe what makes this character visually recognizable — focus on SILHOUETTE and SHAPE, not semantic traits.
    - recognitionFeatures should list 3-5 visual hooks that immediately identify the character (glowing eyes, unique helmet, flowing cape, etc).
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

// ─── Reusable Prompt Section Builders ───────────────────────────────────────

interface DNAFields {
  name?: unknown;
  race?: unknown;
  gender?: unknown;
  class?: unknown;
  physical?: Record<string, { style?: string; color?: string; shape?: string; tone?: string }>;
  equipment?: Record<string, unknown>;
  style?: { artStyle?: string; palette?: string[]; detailLevel?: string };
  directions?: Record<string, string>;
  visualIdentity?: {
    silhouette?: string;
    headShape?: string;
    hairShape?: string;
    recognitionFeatures?: string[];
    dominantColors?: string[];
    weaponCarryStyle?: string;
    bodyProportions?: string;
  };
  tags?: string[];
}

function field(dna: DNAFields, path: string, fallback = ""): string {
  const parts = path.split(".");
  let val: unknown = dna;
  for (const p of parts) {
    val = (val as Record<string, unknown>)?.[p];
    if (val === undefined || val === null) return fallback;
  }
  if (typeof val === "string") return val;
  if (Array.isArray(val)) return (val as string[]).join(", ");
  if (val === true) return "yes";
  if (val === false) return "no";
  return String(val);
}

function join(...parts: string[]): string {
  return parts.filter(Boolean).join("\n");
}

export function buildMasterCharacterReference(reference: string | null): string {
  if (!reference) return "";

  return `MASTER CHARACTER REFERENCE
──────────────────────────────

This is the CANONICAL version of the character. It is the ground truth.

${reference}

RULES — PRESERVE EXACTLY:
- Identical silhouette — do not alter body outline shape
- Identical proportions — head, body, limb ratios unchanged
- Identical color palette — no hue shifts, no new colors
- Identical equipment — same armor, same weapon, same accessories
- Identical hairstyle — same hair shape, same color
- Identical face design — same eyes, same expression style
- Identical weapon placement — same carry position, same angle

ALLOWED CHANGES:
- Limb positions — arms and legs move for animation
- Body tilt — lean forward/backward for motion
- Weapon angle — swing arc during attack
- Head turn — subtle head angle for action

DO NOT:
- Redesign the character
- Add or remove equipment
- Change armor colors
- Alter body proportions
- Change the artistic style`;
}

export function buildCharacterLock(dna: DNAFields): string {
  const visId = dna.visualIdentity || {};
  const palette = dna.style?.palette?.length
    ? dna.style.palette.join(", ")
    : "";

  return `CHARACTER LOCK
──────────────────────────────

This character's identity is FIXED. Preserve ALL of the following across every frame:

IDENTITY:
- Name: ${field(dna, "name")} — ${field(dna, "race")} ${field(dna, "gender")} ${field(dna, "class")}
- Silhouette: ${field(dna, "visualIdentity.silhouette", "consistent across frames")}
- Proportions: ${field(dna, "visualIdentity.bodyProportions", "consistent across frames")}
- Head shape: ${field(dna, "visualIdentity.headShape", "")}
- Hair silhouette: ${field(dna, "visualIdentity.hairShape", "")}
${visId.weaponCarryStyle ? `- Weapon carry: ${visId.weaponCarryStyle}` : ""}

PALETTE: ${palette || field(dna, "style.palette")}
${field(dna, "equipment.body") ? `Body armor: ${field(dna, "equipment.body")}` : ""}
${field(dna, "equipment.head") ? `Head gear: ${field(dna, "equipment.head")}` : ""}
${field(dna, "equipment.legs") ? `Leg wear: ${field(dna, "equipment.legs")}` : ""}
${field(dna, "equipment.mainHand") ? `Weapon: ${field(dna, "equipment.mainHand")}` : ""}
${field(dna, "equipment.offHand") ? `Off-hand: ${field(dna, "equipment.offHand")}` : ""}
${field(dna, "equipment.accessories") ? `Accessories: ${field(dna, "equipment.accessories")}` : ""}
${field(dna, "tags") ? `Tags: ${field(dna, "tags")}` : ""}

DO NOT:
- Redesign armor, helmet, or weapon
- Change any color in the palette
- Invent new equipment or accessories
- Alter body proportions
- Change hairstyle or hair color`;
}

export function buildVisualIdentity(dna: DNAFields): string {
  const visId = dna.visualIdentity || {};
  if (!visId.silhouette && !visId.recognitionFeatures?.length) return "";

  const features = (visId.recognitionFeatures || [])
    .map((f, i) => `${i + 1}. ${f}`)
    .join("\n");

  const colors = (visId.dominantColors || [])
    .map((c, i) => `${i + 1}. ${c}`)
    .join("\n");

  return `VISUAL IDENTITY
──────────────────────────────

Silhouette: ${visId.silhouette || field(dna, "visualIdentity.silhouette", "N/A")}
Head/Helmet shape: ${visId.headShape || field(dna, "visualIdentity.headShape", "N/A")}
Hair silhouette: ${visId.hairShape || field(dna, "visualIdentity.hairShape", "N/A")}
Proportions: ${visId.bodyProportions || field(dna, "visualIdentity.bodyProportions", "N/A")}
${visId.weaponCarryStyle ? `Weapon carry: ${visId.weaponCarryStyle}` : ""}

Recognition features (MUST be visible in every frame):
${features || "N/A"}

Dominant colors:
${colors || "N/A"}

These visual hooks MUST persist across all animation frames. A viewer should instantly recognize the character from any frame.`;
}

export function buildDirectionLock(direction: Direction, _dna: DNAFields): string {
  const locks: Record<Direction, string> = {
    UP: `DIRECTION LOCK — BACK VIEW
──────────────────────────────

FIXED elements visible from this angle:
- Back of head and hair from behind
- Back of helmet/headgear
- Back of shoulders and torso armor
- Back of legs and boots
- Weapon/cape visible from behind

NOT visible from this angle:
- Face
- Front of chest
- Belt buckle`,
    DOWN: `DIRECTION LOCK — FRONT VIEW
──────────────────────────────

FIXED elements visible from this angle:
- Face (eyes, nose, mouth)
- Front of chest armor/clothing
- Belt and waist details
- Front of legs and boots
- Weapon held in front

NOT visible from this angle:
- Back of head
- Back of armor`,
    LEFT: `DIRECTION LOCK — LEFT SIDE VIEW
──────────────────────────────

FIXED elements visible from this angle:
- Left side of face/head
- Left arm (entire length)
- Left side of torso armor
- Left leg
- Weapon on left hip or left hand

NOT visible from this angle:
- Right side of face
- Right arm details`,
    RIGHT: `DIRECTION LOCK — RIGHT SIDE VIEW
──────────────────────────────

FIXED elements visible from this angle:
- Right side of face/head
- Right arm (entire length)
- Right side of torso armor
- Right leg
- Weapon on right hip or right hand

NOT visible from this angle:
- Left side of face
- Left arm details`,
  };

  return locks[direction] || "";
}

interface KeyframeDef {
  label: string;
  frames: Record<number, string>;
  defaultFrames: number;
}

function generateKeyframes(def: KeyframeDef, frameCount: number): string {
  const lines: string[] = [];
  for (let f = 0; f < frameCount; f++) {
    const idx = f % Object.keys(def.frames).length;
    const desc = def.frames[idx];
    lines.push(`  Frame ${f + 1}: ${desc}`);
  }
  return lines.join("\n");
}

const ANIMATION_KEYFRAMES: Record<AnimationType, KeyframeDef> = {
  idle: {
    label: "IDLE",
    defaultFrames: 2,
    frames: {
      0: "Neutral standing pose — arms at sides, weapon at rest position, body at normal height, looking forward",
      1: "Subtle breathing bob — body drops 1-2 pixels, shoulders relax slightly, hair/clothing bounces minimally, weapon unchanged",
    },
  },
  walk: {
    label: "WALK",
    defaultFrames: 4,
    frames: {
      0: "Left leg extends forward, right leg pushes back behind body. RIGHT arm swings forward, LEFT arm swings back. Body at mid-height. Hips shift slightly with stride.",
      1: "Right leg passes left leg at center position. Arms near sides in mid-swing. Body rises 1-2 pixels to peak walking height. Transitional passing pose.",
      2: "Right leg extends forward, left leg pushes back behind body. LEFT arm swings forward, RIGHT arm swings back. Body returns to mid-height. Stride mirrored from Frame 1.",
      3: "Left leg passes right leg at center position. Arms near sides in mid-swing. Body rises 1-2 pixels. Transitional passing pose. Return to Frame 1 cycle.",
    },
  },
  run: {
    label: "RUN",
    defaultFrames: 4,
    frames: {
      0: "Body tilts forward 15 degrees. Left leg stretches far forward, right leg pushes off ground behind. RIGHT arm pumps forward high, LEFT arm drives back. Body at mid-height.",
      1: "Both legs airborne, body at peak height. Arms at maximum pump positions. Forward lean maintained. Dynamic mid-stride pose.",
      2: "Body tilts forward 15 degrees. Right leg stretches far forward, left leg pushes off ground behind. LEFT arm pumps forward high, RIGHT arm drives back. Mirrored contact pose.",
      3: "Both legs airborne, body at peak height. Arms at maximum pump positions. Transitional flying pose. Return to Frame 1 cycle.",
    },
  },
  attack: {
    label: "ATTACK",
    defaultFrames: 4,
    frames: {
      0: "Idle stance — weapon at rest position, neutral body posture, feet shoulder-width apart, weight balanced between both legs",
      1: "Windup phase — weapon pulled back behind body, body rotates 30 degrees away from target, weight shifts to rear foot, front shoulder drops, weapon arm cocks back",
      2: "Maximum windup — weapon at furthest back position, body fully coiled, weight fully on rear foot, weapon arm fully extended back, anticipation peak",
      3: "Strike phase — weapon swings forward in arc, body lunges toward target, weight transfers to front foot, weapon arm extends forward, other arm pulls back for balance",
    },
  },
  hit: {
    label: "HIT",
    defaultFrames: 3,
    frames: {
      0: "Neutral standing pose before impact — arms at sides, body upright, looking forward",
      1: "Impact recoil — body snaps backward, arms fling outward and upward, head tilts back, knees bend, chest pushed back by impact force",
      2: "Stagger recovery — body bent forward slightly, arms dropping back toward sides, knees still bent, head returning to neutral, regaining balance",
    },
  },
  death: {
    label: "DEATH",
    defaultFrames: 4,
    frames: {
      0: "Stagger from final hit — body flinches, arms drop, knees buckle slightly, head tilts, weapon hand loosens",
      1: "Collapse begins — body tilts forward/backward, knees fully buckle, arms go limp, weapon drops or falls to side, body descends",
      2: "Falling — body at 45-degree angle, legs give out completely, arms hang limp, head tilted, body continues descent toward ground",
      3: "Final collapsed pose — body fully on ground, lying face-down or on side, weapon beside character, arms and legs splayed, motionless",
    },
  },
};

export function buildAnimationKeyframes(animation: AnimationType, frameCount: number): string {
  const def = ANIMATION_KEYFRAMES[animation];
  if (!def) return "";

  const keyframeLines = generateKeyframes(def, frameCount);

  return `ANIMATION KEYFRAMES — ${def.label}
──────────────────────────────

${frameCount}-frame ${animation.toUpperCase()} cycle.

FRAME-BY-FRAME POSES (left to right):
${keyframeLines}

MOTION NOTES:
- Each frame is a DISTINCT pose. No two frames should look identical.
- Motion flows smoothly from Frame 1 through Frame ${frameCount}.
- Limbs and body change position in every frame.
- After Frame ${frameCount}, the cycle loops back to Frame 1 seamlessly.`;
}

export function buildFrameDifferenceRules(frameCount: number): string {
  return `FRAME DIFFERENCE RULES
──────────────────────────────

CRITICAL — VIOLATION RUINS THE ANIMATION:

1. Adjacent frames MUST visibly differ.
   - Frame N must look clearly different from Frame N+1.
   - If two frames look identical, the animation is BROKEN.

2. Avoid duplicated poses.
   - No frame may be a copy or near-copy of any other frame.
   - Each of the ${frameCount} frames must show a UNIQUE pose.

3. Motion must be obvious when comparing neighboring frames.
   - Arms and legs must change position throughout the cycle.
   - Body tilt and height must vary across frames.

4. Animation must read clearly left-to-right.
   - A viewer scanning left-to-right should perceive smooth motion.
   - Each frame advances the motion by 1/${frameCount} of the full cycle.

5. Limb visibility varies by direction.
   - FRONT view: both arms visible, both legs visible.
   - BACK view: arms partially visible from behind, legs from behind.
   - SIDE view: one arm fully visible, near leg fully visible, far limbs partially obscured.`;
}

export function buildSpriteSizeLock(frameCount: number): string {
  return `SPRITE SIZE LOCK
──────────────────────────────

- Each frame cell must contain a ${32}x${32} pixel sprite.
- Sprite scale is IDENTICAL across all ${frameCount} frames.
- Character occupies consistent portion of each cell.
- Do NOT zoom in/out across frames — maintain absolute pixel scale.
- Character must stay centered within each cell.
- Frame-to-frame position shifts should reflect movement, not scale changes.`;
}

export function buildGridLayout(rows: number, cols: number, directionLabel?: string): string {
  const directionInfo = directionLabel
    ? `\nDIRECTION: ${directionLabel} only.`
    : "";

  return `GRID LAYOUT
──────────────────────────────

- Strict ${rows} row${rows > 1 ? "s" : ""} × ${cols} column${cols > 1 ? "s" : ""} grid.${directionInfo}
- Equal-sized cells with equal spacing between all cells.
- Character perfectly centered inside each cell.
- Sprite fills its cell evenly — not too small, not cropped.
- Clear separation between adjacent cells.
- No overlapping body parts between cells.
- Reading order: left-to-right within each row, top-to-bottom across rows.`;
}

export function buildBackgroundRequirements(): string {
  return `BACKGROUND — 100% TRANSPARENT
──────────────────────────────

- Alpha channel transparency only — output as PNG with alpha.
- NO green screen background.
- NO solid color background of any kind.
- NO floor, NO ground plane, NO shadow beneath character.
- NO environment, NO scenery, NO props.
- NO lighting effects, NO glow outside character silhouette.
- Every pixel outside the character must be fully transparent (alpha = 0).`;
}

export function buildPixelArtRules(artStyle: string, palette: string): string {
  return `PIXEL ART RULES
──────────────────────────────

- Pure ${artStyle} pixel art style. Every pixel is intentional.
- Sharp pixel edges — NO anti-aliasing, NO smooth edges, NO blur.
- NO gradients, NO soft shading, NO painterly rendering.
- ${palette || "Vibrant limited-color RPG palette with crisp contrast."}
- Hard-edged pixel clusters. Clean readable shapes.
- Strong silhouette from all frames — character outline is clear and distinct.`;
}

// ─── Refactored Prompt Functions ────────────────────────────────────────────

export function buildSpritePackPrompt(
  dna: Record<string, unknown>,
  animation: AnimationType,
  frameCount: number,
  masterSheetReference?: string | null
): string {
  const ref = masterSheetReference ?? null;
  const dnaFields = dna as unknown as DNAFields;
  const artStyle = field(dnaFields, "style.artStyle", "16bit");
  const palette = dnaFields.style?.palette?.length
    ? `Palette: ${dnaFields.style.palette.join(", ")}. Use ONLY these colors.`
    : "";

  return `TASK: Create ${artStyle} pixel art ${animation.toUpperCase()} animation sprite sheet.

${buildMasterCharacterReference(ref)}

${buildCharacterLock(dnaFields)}

${buildVisualIdentity(dnaFields)}

${buildAnimationKeyframes(animation, frameCount)}

${buildFrameDifferenceRules(frameCount)}

${buildSpriteSizeLock(frameCount)}

${buildGridLayout(4, frameCount)}

${buildBackgroundRequirements()}

${buildPixelArtRules(artStyle, palette)}

OUTPUT: Professional RPG ${animation} sprite sheet (4 directions × ${frameCount} frames) ready for game engine import.`;
}

export function buildDirectionalSpritePackPrompt(
  dna: Record<string, unknown>,
  animation: AnimationType,
  direction: Direction,
  frameCount: number,
  masterSheetReference?: string | null
): string {
  const ref = masterSheetReference ?? null;
  const dnaFields = dna as unknown as DNAFields;
  const artStyle = field(dnaFields, "style.artStyle", "16bit");
  const palette = dnaFields.style?.palette?.length
    ? `Palette: ${dnaFields.style.palette.join(", ")}. Use ONLY these colors.`
    : "";

  return `TASK: Create ${artStyle} pixel art ${animation.toUpperCase()} animation strip — ${direction} VIEW ONLY.

${buildMasterCharacterReference(ref)}

${buildCharacterLock(dnaFields)}

${buildVisualIdentity(dnaFields)}

${buildDirectionLock(direction, dnaFields)}

${buildAnimationKeyframes(animation, frameCount)}

${buildFrameDifferenceRules(frameCount)}

${buildSpriteSizeLock(frameCount)}

${buildGridLayout(1, frameCount, direction)}

${buildBackgroundRequirements()}

${buildPixelArtRules(artStyle, palette)}

OUTPUT: Professional RPG ${animation} animation strip (${direction} direction, ${frameCount} frames) ready for game engine import.`;
}
