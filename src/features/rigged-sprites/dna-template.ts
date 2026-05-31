import type { RiggedSpriteDNA, BodyPartDNA, BodyPartName, RiggingConfig } from "./types";
import { CORE_BODY_PARTS, OPTIONAL_BODY_PARTS } from "./types";

function emptyBodyPart(name: BodyPartName, zOrder: number): BodyPartDNA {
  return {
    name,
    description: "",
    directions: { up: "", down: "", left: "", right: "" },
    colorPalette: [],
    zOrder,
    anchorPoint: { x: 0, y: 0 },
  };
}

const DEFAULT_Z_ORDER: Record<BodyPartName, number> = {
  shield: 0,
  legs: 1,
  accessory: 2,
  torso: 3,
  arms: 4,
  weapon: 5,
  head: 6,
  hair: 7,
};

const DEFAULT_RIGGING_Z_ORDER: BodyPartName[] = [
  "legs", "torso", "arms", "shield", "weapon", "accessory", "head", "hair",
];

function buildDefaultRigging(): RiggingConfig {
  const offsets: Record<BodyPartName, { x: number; y: number }> = {
    head: { x: 0, y: 0 },
    hair: { x: 0, y: 0 },
    torso: { x: 0, y: 0 },
    arms: { x: 0, y: 0 },
    legs: { x: 0, y: 0 },
    weapon: { x: 0, y: 0 },
    shield: { x: 0, y: 0 },
    accessory: { x: 0, y: 0 },
  };
  return { zOrder: DEFAULT_RIGGING_Z_ORDER, offsets };
}

export function createEmptyRiggedDNA(overrides: Partial<RiggedSpriteDNA> = {}): RiggedSpriteDNA {
  const bodyParts: Record<string, BodyPartDNA> = {};

  for (const name of [...CORE_BODY_PARTS, ...OPTIONAL_BODY_PARTS]) {
    bodyParts[name] = emptyBodyPart(name, DEFAULT_Z_ORDER[name] ?? 0);
  }

  return {
    prompt: "",
    name: "Untitled Character",
    race: "human",
    gender: "male",
    class: "adventurer",
    pov: "top-down",
    physical: {
      build: "",
      height: "",
      skin: { tone: "" },
      eyes: { color: "", shape: "" },
    },
    style: {
      artStyle: "16bit",
      palette: [],
      detailLevel: "medium",
    },
    bodyParts: bodyParts as Record<BodyPartName, BodyPartDNA>,
    canvas: { width: 64, height: 64 },
    rigging: buildDefaultRigging(),
    directions: { up: "", down: "", left: "", right: "" },
    tags: [],
    ...overrides,
  };
}
