import type { ArtStyle, DetailLevel, RiggedSpriteDetailsInput } from "@/features/rigged-sprites/types";

export function buildRiggedDNAExtractionPrompt(
  prompt: string,
  artStyle: ArtStyle,
  detailLevel: DetailLevel,
  details?: RiggedSpriteDetailsInput
): string {
  const constraints: string[] = [];

  if (details) {
    if (details.name) constraints.push(`- Character name MUST be "${details.name}"`);
    if (details.gender) constraints.push(`- Gender MUST be "${details.gender}"`);
    if (details.race) constraints.push(`- Race MUST be "${details.race}"`);
    if (details.class) constraints.push(`- Class MUST be "${details.class}"`);
    if (details.build) constraints.push(`- Build MUST be "${details.build}"`);
    if (details.height) constraints.push(`- Height MUST be "${details.height}"`);
    if (details.skinTone) constraints.push(`- Skin tone MUST be "${details.skinTone}"`);
    if (details.eyeColor) constraints.push(`- Eye color MUST be "${details.eyeColor}"`);
    if (details.pov) constraints.push(`- Point of view MUST be "${details.pov}"`);
  }

  const constraintsBlock = constraints.length > 0
    ? `\nUSER-SPECIFIED CONSTRAINTS — you MUST honor these exactly:\n${constraints.join("\n")}\n`
    : "";

  const pov = details?.pov || "top-down";

  return `You are a pixel-art character designer for ${pov} RPG games. Design a modular character composed of individual body parts that will be generated separately and assembled via rigging.

User prompt: "${prompt}"
Art style: ${artStyle} pixel art
Detail level: ${detailLevel}${constraintsBlock}

Return ONLY valid JSON matching this structure:
{
  "name": "descriptive name, 2-4 words max",
  "race": "human|elf|dwarf|orc|undead|robot|demon|angel|beast|fairy|elemental",
  "gender": "male|female|nonbinary",
  "class": "warrior|mage|rogue|ranger|paladin|ninja|samurai|monk|druid|necromancer|berserker|pirate|hunter|cleric|bard|gunslinger|engineer",
  "pov": "${pov}",
  "physical": {
    "build": "slim|athletic|muscular|heavy|petite|stocky",
    "height": "short|average|tall",
    "skin": { "tone": "pale|fair|olive|tan|brown|dark|blue|green|red" },
    "eyes": { "color": "specific eye color", "shape": "almond|round|narrow|large" }
  },
  "style": {
    "artStyle": "${artStyle}",
    "palette": ["#hex1", "#hex2", "#hex3", "#hex4", "#hex5"],
    "detailLevel": "${detailLevel}"
  },
  "bodyParts": {
    "head": {
      "name": "Head",
      "description": "Brief overall description of the head including face, facial features.",
      "directions": {
        "up": "Back of head seen from ${pov} top. Back hair, back skull. 15-30 words.",
        "down": "Front face seen from ${pov} view. Eyes, nose, mouth, facial expression. 15-30 words.",
        "left": "Left side of head in profile. Left eye, left ear, side hair. 15-30 words.",
        "right": "Right side of head in profile. Right eye, right ear, side hair. 15-30 words."
      },
      "colorPalette": ["#hex1", "#hex2", "#hex3"],
      "zOrder": 5,
      "anchorPoint": { "x": 32, "y": 0 }
    },
    "hair": {
      "name": "Hair",
      "description": "Hairstyle overlay that sits on top of the head.",
      "directions": {
        "up": "Back view of hairstyle. 15-30 words.",
        "down": "Front hair bang/fringe view. 15-30 words.",
        "left": "Left side hair profile. 15-30 words.",
        "right": "Right side hair profile. 15-30 words."
      },
      "colorPalette": ["#hex1", "#hex2"],
      "zOrder": 6,
      "anchorPoint": { "x": 32, "y": 0 }
    },
    "torso": {
      "name": "Torso",
      "description": "Upper body / chest with armor or clothing.",
      "directions": {
        "up": "Back of torso / back armor. Shoulder blades visible. 15-30 words.",
        "down": "Front chest / chest armor. 15-30 words.",
        "left": "Left side profile of torso. Left shoulder, left side of chest armor. 15-30 words.",
        "right": "Right side profile of torso. Right shoulder, right side of chest armor. 15-30 words."
      },
      "colorPalette": ["#hex1", "#hex2", "#hex3"],
      "zOrder": 3,
      "anchorPoint": { "x": 32, "y": 0 }
    },
    "arms": {
      "name": "Arms",
      "description": "Both arms with hands. Left arm on left side, right arm on right side of torso.",
      "directions": {
        "up": "Back of both arms. 15-30 words.",
        "down": "Front of both arms. 15-30 words.",
        "left": "Left side profile showing both arms. 15-30 words.",
        "right": "Right side profile showing both arms. 15-30 words."
      },
      "colorPalette": ["#hex1", "#hex2"],
      "zOrder": 4,
      "anchorPoint": { "x": 0, "y": 0 }
    },
    "legs": {
      "name": "Legs",
      "description": "Both legs with feet, positioned below torso.",
      "directions": {
        "up": "Back of both legs. 15-30 words.",
        "down": "Front of both legs. 15-30 words.",
        "left": "Left side profile showing both legs. 15-30 words.",
        "right": "Right side profile showing both legs. 15-30 words."
      },
      "colorPalette": ["#hex1", "#hex2"],
      "zOrder": 1,
      "anchorPoint": { "x": 0, "y": 0 }
    },
    "weapon": {
      "name": "Weapon",
      "description": "Weapon or tool description. SET TO null IF CHARACTER HAS NO WEAPON.",
      "directions": {
        "up": "Weapon from behind. 15-30 words.",
        "down": "Weapon from front. 15-30 words.",
        "left": "Weapon from left. 15-30 words.",
        "right": "Weapon from right. 15-30 words."
      },
      "colorPalette": [],
      "zOrder": 4,
      "anchorPoint": { "x": 0, "y": 0 }
    },
    "shield": {
      "name": "Shield",
      "description": "Shield description. SET TO null IF CHARACTER HAS NO SHIELD.",
      "directions": {
        "up": "Shield from behind. 15-30 words.",
        "down": "Shield from front. 15-30 words.",
        "left": "Shield from left side. 15-30 words.",
        "right": "Shield from right side. 15-30 words."
      },
      "colorPalette": [],
      "zOrder": 0,
      "anchorPoint": { "x": 0, "y": 0 }
    },
    "accessory": {
      "name": "Accessory",
      "description": "Accessory like cape, wings, backpack. SET TO null IF CHARACTER HAS NO ACCESSORIES.",
      "directions": {
        "up": "Accessory from behind. 15-30 words.",
        "down": "Accessory from front. 15-30 words.",
        "left": "Accessory from left. 15-30 words.",
        "right": "Accessory from right. 15-30 words."
      },
      "colorPalette": [],
      "zOrder": 2,
      "anchorPoint": { "x": 0, "y": 0 }
    }
  },
  "canvas": { "width": 96, "height": 96 },
  "rigging": {
    "zOrder": ["legs", "torso", "arms", "shield", "weapon", "accessory", "head", "hair"],
    "offsets": {
      "head": { "x": 32, "y": 0 },
      "hair": { "x": 32, "y": 0 },
      "torso": { "x": 32, "y": 16 },
      "arms": { "x": 32, "y": 16 },
      "legs": { "x": 32, "y": 48 },
      "weapon": { "x": 8, "y": 32 },
      "shield": { "x": 64, "y": 32 },
      "accessory": { "x": 32, "y": 0 }
    }
  },
  "directions": {
    "up": "Overall character from behind. 20-40 words describing the full assembled character facing up.",
    "down": "Overall character from front. 20-40 words describing the full assembled character facing down.",
    "left": "Overall character from left side. 20-40 words describing the full assembled character facing left.",
    "right": "Overall character from right side. 20-40 words describing the full assembled character facing right."
  },
  "tags": ["keyword1", "keyword2"]
}

CRITICAL RULES:
- artStyle MUST be exactly "${artStyle}" — do not change it.
- detailLevel MUST be exactly "${detailLevel}" — do not change it.
- pov field MUST be "${pov}" — do not change it.
- Palette must contain exactly 5 hex colors suitable for ${artStyle} pixel art. Use these palette colors consistently across ALL body parts.
- Each body part must have its own colorPalette (subset of the main palette).
- weapon, shield, accessory MUST be null (the whole object) if the character does not have them. Use JSON null, not empty strings.
- When a body part is null, do NOT generate it. Omit it from bodyParts entirely or set to null.
- Each body part must have visual continuity with all other parts — same colors, same proportions, same lighting angle.
- All body parts together must form a cohesive character at the same scale.
- zOrder values: higher = drawn on top. Legs(1) < Accessory(2) < Torso(3) < Arms(4) < Weapon(5) < Head(6) < Hair(7).
- Canvas is 96x96 pixels at ${artStyle} resolution. Position offsets assume a character filling roughly 32x48 pixels in the center.
- Direction descriptions for each body part must be specific enough to generate that part in isolation, yet consistent enough to assemble correctly.
- Use concrete, visual pixel-art language throughout. Describe shapes, silhouettes, pixel-level details.
- Infer missing details creatively but stay faithful to the user prompt.`;
}
